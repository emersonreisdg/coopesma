from .dashboard_base import DashboardViewBase
from django.core.cache import cache
from django.db.models import Min, Max
from ....models import Matriculas
import json

from django.utils.decorators import method_decorator
from django.contrib.auth.decorators import login_required
from utils.coopesma.json_encoder_data import JSONEncoderCustom


@method_decorator(
    login_required(login_url='colaborador:login', redirect_field_name='next'),
    name='dispatch'
)
class DashboardDetalhesMatriculasView(DashboardViewBase):
    """
    View do dashboard responsável pela visualização dos detalhes de matrículas.

    Esta view utiliza o modelo Matriculas para compor gráficos e relatórios
    no ambiente de dashboard da aplicação, com cache para melhorar o
      desempenho.

    Atributos:
        model: Modelo `Matriculas` utilizado para consulta dos dados.
        context_object_name (str): Nome usado no template para referenciar o
          queryset.
        ordering (list): Ordenação padrão dos dados retornados.
        template_name (str): Template principal do dashboard.
        tipo_ambiente (str): Tipo de ambiente (usado para lógica de layout).
        ambiente (str): Nome do arquivo de template específico do ambiente.
        controles_ambiente (str): Caminho para o script JS de controle.
        estilo_ambiente (str): Caminho para o CSS do ambiente.
        tem_cards (bool): Define se o ambiente utiliza cards de dados.
    """

    model = Matriculas
    context_object_name = 'detalhes_matriculas'
    ordering = ['-data']
    template_name = 'coopesma/pages/dashboard.html'
    tipo_ambiente = 'dashboard'
    ambiente = 'detalhes_matriculas.html'
    controles_ambiente = 'detalhes_matriculas.js'
    estilo_ambiente = 'dashboards/detalhes_matriculas.css'
    tem_cards = True

    def get_queryset(self, *args, **kwargs):
        """
        Retorna o queryset de matrículas com uso de cache para performance.

        O cache é válido por 15 minutos, evitando consultas repetidas ao banco.

        Returns:
            QuerySet: Lista de objetos do modelo Matriculas.
        """

        cache_key = 'detalhes_matriculas_queryset'
        queryset = cache.get(cache_key)

        if not queryset:
            queryset = self.model.objects.all()
            # Cache por 15 minutos
            cache.set(cache_key, queryset, timeout=60*15)

        return queryset

    def update_context(self, ctx):
        """
        Atualiza o contexto do template com os dados formatados para o
          frontend.

        Inclui a faixa de anos disponível nos dados e as informações relevantes
        para visualização das métricas educacionais.

        Args:
            ctx (dict): Contexto herdado da view base.

        Returns:
            dict: Contexto atualizado com anos disponíveis e dados das
              matrículas.
        """

        ctx = super().update_context(ctx)

        qs = self.get_queryset()

        years_range = qs.aggregate(min_year=Min('data'), max_year=Max('data'))
        min_year = years_range['min_year'].year
        max_year = years_range['max_year'].year
        years = list(range(min_year, max_year + 1))

        # Convertendo datas para strings no formato ISO 8601
        data = list(qs.values('data', 'serie', 'alunos', 'rematriculados',
                              'nao_rematriculados', 'novos', 'particular',
                              'publica', 'migrantes', 'iniciantes',
                              'capacidade_ideal_alunos',
                              'saldo_oocupacao_ideal',
                              'vagas_ofertadas', 'vagas_ociosas',
                              'capacidade_maxima_alunos',
                              'saldo_ocupacao_maxima',
                              'aprovados_ifes',
                              ))

        ctx.update(
            {
                'years': years,
                'data': json.dumps(data, cls=JSONEncoderCustom),

            }
        )
        return ctx
