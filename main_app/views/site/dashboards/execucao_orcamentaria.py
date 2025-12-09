from .dashboard_base import DashboardViewBase
from django.core.cache import cache
from django.db.models import Min, Max
from ....models import ExecucaoOrcamentaria
import json
from django.db.models.functions import ExtractMonth

from django.utils.decorators import method_decorator
from django.contrib.auth.decorators import login_required
from utils.coopesma.json_encoder_data import JSONEncoderCustom


@method_decorator(
    login_required(login_url='colaborador:login', redirect_field_name='next'),
    name='dispatch'
)
class DashboardExecucaoOrcamentariaView(DashboardViewBase):
    """
    View de dashboard responsável pela visualização da execução orçamentária.

    Esta view apresenta receitas, mensalidades e despesas, organizadas por mês
      e ano,
    utilizando dados do modelo ExecucaoOrcamentaria.

    Atributos:
        model: Modelo Django usado para consultar os dados da execução
          orçamentária.
        context_object_name (str): Nome do objeto no contexto do template.
        template_name (str): Caminho do template HTML do dashboard.
        tipo_ambiente (str): Tipo do ambiente, usado para fins de organização
          visual.
        ambiente (str): Template específico para o conteúdo do dashboard.
        controles_ambiente (str): Arquivo JavaScript para controles dinâmicos.
        estilo_ambiente (str): Caminho do arquivo CSS específico do dashboard.
        tem_cards (bool): Indica se a interface renderiza cards informativos.
    """

    model = ExecucaoOrcamentaria
    context_object_name = 'execucao_orcamentaria'
    template_name = 'coopesma/pages/dashboard.html'
    tipo_ambiente = 'dashboard'
    ambiente = 'execucao_orcamentaria.html'
    controles_ambiente = 'execucao_orcamentaria.js'
    estilo_ambiente = 'dashboards/execucao_orcamentaria.css'
    tem_cards = True

    def get_queryset(self, *args, **kwargs):
        """
        Retorna o conjunto de dados a ser usado na view, com uso de cache.

        O cache tem validade de 15 minutos e é identificado pela chave
          'execucao_orcamentaria_queryset'.

        Returns:
            QuerySet: Conjunto de objetos do modelo ExecucaoOrcamentaria.
        """

        cache_key = 'execucao_orcamentaria_queryset'
        queryset = cache.get(cache_key)

        if not queryset:
            queryset = self.model.objects.all()
            # Cache por 15 minutos
            cache.set(cache_key, queryset, timeout=60*15)

        return queryset

    def update_context(self, ctx):
        """
        Atualiza o dicionário de contexto da view com dados específicos da
          execução orçamentária.

        Os dados incluem:
        - Lista de anos disponíveis
        - Dados financeiros agrupados por mês
        - Conversão JSON para uso em JavaScript

        Args:
            ctx (dict): Contexto herdado da superclasse.

        Returns:
            dict: Contexto atualizado com os dados da execução orçamentária.
        """

        ctx = super().update_context(ctx)

        qs = self.get_queryset()

        years_range = qs.aggregate(min_year=Min('data'), max_year=Max('data'))
        min_year = years_range['min_year'].year
        max_year = years_range['max_year'].year
        years = list(range(min_year, max_year + 1))

        # Agrupar receitas por mês
        data = list(qs.annotate(month=ExtractMonth('data')).values(
            'month', 'data', 'receitas', 'mensalidade', 'despesas'))

        ctx.update(
            {
                'years': years,  # Passa a lista de anos para o template
                'data': json.dumps(data, cls=JSONEncoderCustom),
            }
        )
        return ctx
