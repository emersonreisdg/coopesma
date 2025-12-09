from .dashboard_base import DashboardViewBase
from django.core.cache import cache
from django.db.models import Min, Max
from ....models import HistoricoOrcamentario
import json

from django.utils.decorators import method_decorator
from django.contrib.auth.decorators import login_required
from utils.coopesma.json_encoder_data import JSONEncoderCustom


@method_decorator(
    login_required(login_url='colaborador:login', redirect_field_name='next'),
    name='dispatch'
)
class DashboardFatesView(DashboardViewBase):
    """
    View de dashboard responsável por exibir os dados históricos do fundo
      FATES.

    A visualização inclui informações como saldo acumulado, entradas totais e
      reversões totais,
    organizadas ao longo do tempo para análise orçamentária.

    Atributos:
        model: Modelo Django associado à visualização (HistoricoOrcamentario).
        context_object_name (str): Nome do objeto no contexto do template.
        ordering (list): Critério de ordenação padrão (do mais recente ao mais
          antigo).
        template_name (str): Caminho do template HTML principal.
        tipo_ambiente (str): Tipo da interface (usado para layout).
        ambiente (str): Caminho do conteúdo do template específico da view.
        controles_ambiente (str): Caminho do arquivo JavaScript da interface.
        estilo_ambiente (str): Caminho do arquivo CSS específico.
        tem_cards (bool): Indica se a interface deve renderizar cards
          informativos.
    """

    model = HistoricoOrcamentario
    context_object_name = 'fates'
    ordering = ['-data']
    template_name = 'coopesma/pages/dashboard.html'
    tipo_ambiente = 'dashboard'
    ambiente = 'fates.html'
    controles_ambiente = 'fates.js'
    estilo_ambiente = 'dashboards/fates.css'
    tem_cards = False

    def get_queryset(self, *args, **kwargs):
        """
        Obtém o conjunto de dados da model `HistoricoOrcamentario`, com uso de
          cache.

        O cache utiliza a chave 'fates_queryset' e tem duração de 15 minutos.

        Returns:
            QuerySet: Conjunto de dados da model `HistoricoOrcamentario`.
        """

        cache_key = 'fates_queryset'
        queryset = cache.get(cache_key)

        if not queryset:
            queryset = self.model.objects.all()
            # Cache por 15 minutos
            cache.set(cache_key, queryset, timeout=60*15)

        return queryset

    def update_context(self, ctx):
        """
        Atualiza o contexto do template com os dados necessários para
          visualização do dashboard FATES.

        Inclui:
        - Anos mínimo e máximo com base na coluna `data`.
        - Dados em formato JSON serializado (usando `JSONEncoderCustom`).

        Args:
            ctx (dict): Dicionário de contexto herdado da superclasse.

        Returns:
            dict: Dicionário de contexto atualizado com dados do fundo FATES.
        """

        ctx = super().update_context(ctx)

        qs = self.get_queryset()

        years_range = qs.aggregate(min_year=Min('data'), max_year=Max('data'))
        min_year = years_range['min_year'].year
        max_year = years_range['max_year'].year
        # years = list(range(min_year, max_year + 1))

        # Convertendo datas para strings no formato ISO 8601
        data = list(qs.values('data', 'saldo_fates', 'fates_entrada_total',
                              'fates_reversao_total'))

        ctx.update(
            {
                'min_year': min_year,
                'max_year': max_year,
                'data': json.dumps(data, cls=JSONEncoderCustom),
            }
        )
        return ctx
