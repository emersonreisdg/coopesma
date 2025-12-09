from .dashboard_base import DashboardViewBase
from ....models import Controle
from django.core.cache import cache
from django.db.models import Min, Max
import json

from django.utils.decorators import method_decorator
from django.contrib.auth.decorators import login_required

from utils.coopesma.json_encoder_data import JSONEncoderCustom


@method_decorator(
    login_required(login_url='colaborador:login', redirect_field_name='next'),
    name='dispatch'
)
class DashboardControleCooperadosView(DashboardViewBase):
    """
    View responsável por renderizar o dashboard de controle de cooperados.

    Herda de DashboardViewBase e provê visualização de dados agregados do
      modelo `Controle`,
    com filtros por ano e renderização otimizada via cache.

    Atributos:
        model (Model): Modelo Django utilizado (Controle).
        title (str): Título da página.
        context_object_name (str): Nome do contexto usado no template.
        template_name (str): Caminho para o template base do dashboard.
        tipo_ambiente (str): Tipo de ambiente (usado para controle de layout).
        ambiente (str): Template específico da aba de ambiente.
        controles_ambiente (str): Script JS específico para o ambiente.
        estilo_ambiente (str): Estilo CSS associado ao ambiente.
        tem_cards (bool): Indica se há cards a serem exibidos no topo do
          dashboard.
    """

    model = Controle
    title = 'Controle'
    context_object_name = 'controle_cooperados'
    template_name = 'coopesma/pages/dashboard.html'
    tipo_ambiente = 'dashboard'
    ambiente = 'controle_cooperados.html'
    controles_ambiente = 'controle_cooperados.js'
    estilo_ambiente = 'dashboards/controle_cooperados.css'
    tem_cards = True

    def get_queryset(self, *args, **kwargs):
        """
        Retorna o queryset com caching para evitar múltiplas consultas ao
          banco de dados.

        O cache dura 15 minutos (900 segundos). Caso não exista cache, realiza
          a consulta ao banco e armazena o resultado.

        Retorna:
            QuerySet: Lista de objetos do modelo `Controle`.
        """

        cache_key = 'controle_cooperados_queryset'
        queryset = cache.get(cache_key)

        if not queryset:
            queryset = self.model.objects.all()
            cache.set(cache_key, queryset, timeout=60*15)

        return queryset

    def update_context(self, ctx):
        """
        Atualiza o contexto do template com os dados necessários para
          renderizar o dashboard.

        Adiciona:
        - Intervalo de anos presentes na base
          (`min_year`, `max_year`, `years`);
        - Dados do modelo `Controle` serializados em JSON com codificação
          personalizada.

        Args:
            ctx (dict): Contexto herdado da classe base.

        Retorna:
            dict: Contexto atualizado com os dados do dashboard.
        """

        ctx = super().update_context(ctx)

        qs = self.get_queryset()
        years_range = qs.aggregate(min_year=Min('data'), max_year=Max('data'))
        min_year = years_range['min_year'].year
        max_year = years_range['max_year'].year
        years = list(range(min_year, max_year + 1))
        years.sort(reverse=True)

        # Convertendo datas para strings no formato ISO 8601
        data = list(qs.values('data', 'cooperado', 'aluno',
                              'turma', 'cobranca_receita', 'plano_desconto',
                              'cooperar_plus', 'beneficios', 'rateio',
                              'desconto_percentual', 'desconto',
                              'valor_liquido', 'livros', 'numero_parcelas',
                              'soma_livros', 'indicou'))

        ctx.update(
            {
                'min_year': min_year,
                'max_year': max_year,
                'years': years,
                'data': json.dumps(data, cls=JSONEncoderCustom),
            }
        )
        return ctx
