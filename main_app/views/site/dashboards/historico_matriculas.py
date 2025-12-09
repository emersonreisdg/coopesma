from .dashboard_base import DashboardViewBase
from django.core.cache import cache
from django.db.models import Min, Max
from ....models import HistoricoMatriculas
import json

from django.utils.decorators import method_decorator
from django.contrib.auth.decorators import login_required
from utils.coopesma.json_encoder_data import JSONEncoderCustom


@method_decorator(
    login_required(login_url='colaborador:login', redirect_field_name='next'),
    name='dispatch'
)
class DashboardHistoricoMatriculasView(DashboardViewBase):
    """
    View do dashboard responsável por exibir dados históricos de matrículas.

    Esta view utiliza o modelo HistoricoMatriculas para carregar os dados
    relacionados à evolução das matrículas ao longo do tempo,
    renderizando-os em formato apropriado para visualização
    no front-end.

    Atributos:
        model (Model): Modelo Django associado, HistoricoMatriculas.
        context_object_name (str): Nome do objeto de contexto utilizado no
          template.
        ordering (list): Ordenação padrão dos dados (por data decrescente).
        template_name (str): Caminho para o template HTML.
        tipo_ambiente (str): Tipo de ambiente para controle visual.
        ambiente (str): Nome do HTML específico que renderiza os gráficos.
        controles_ambiente (str): Script JS associado ao ambiente.
        estilo_ambiente (str): Caminho para o CSS do dashboard.
        tem_cards (bool): Indica se há cards informativos no dashboard.
    """

    model = HistoricoMatriculas
    context_object_name = 'historico_matriculas'
    ordering = ['-data']
    template_name = 'coopesma/pages/dashboard.html'
    tipo_ambiente = 'dashboard'
    ambiente = 'historico_matriculas.html'
    controles_ambiente = 'historico_matriculas.js'
    estilo_ambiente = 'dashboards/historico_matriculas.css'
    tem_cards = False

    def get_queryset(self, *args, **kwargs):
        """
        Retorna o queryset com cache aplicado para otimizar o carregamento de
          dados.

        Returns:
            QuerySet: Conjunto de objetos HistoricoMatriculas.
        """

        cache_key = 'historico_matriculas_queryset'
        queryset = cache.get(cache_key)

        if not queryset:
            queryset = self.model.objects.all()
            # Cache por 15 minutos
            cache.set(cache_key, queryset, timeout=60*15)

        return queryset

    def update_context(self, ctx):
        """
        Atualiza o contexto com informações necessárias para o template do
          dashboard.

        Inclui:
        - Intervalo de anos baseado na data dos registros
        - Dados serializados para visualização (número de matrículas e meta)

        Args:
            ctx (dict): Contexto herdado do método base.

        Returns:
            dict: Contexto atualizado com dados adicionais.
        """

        ctx = super().update_context(ctx)

        qs = self.get_queryset()

        years_range = qs.aggregate(min_year=Min('data'), max_year=Max('data'))
        min_year = years_range['min_year'].year
        max_year = years_range['max_year'].year
        # years = list(range(min_year, max_year + 1))

        # Convertendo datas para strings no formato ISO 8601
        data = list(qs.values('data', 'numero_matriculas', 'meta'))

        ctx.update(
            {
                'min_year': min_year,
                'max_year': max_year,
                'data': json.dumps(data, cls=JSONEncoderCustom),
            }
        )
        return ctx
