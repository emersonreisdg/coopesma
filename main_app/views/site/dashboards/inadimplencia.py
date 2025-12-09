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
class DashboardHistoricoInadimplenciaView(DashboardViewBase):
    """
    View para exibição do dashboard de histórico de inadimplência.

    Esta view herda de DashboardViewBase e utiliza o modelo
      HistoricoOrcamentario
    para consultar dados relacionados à inadimplência de cooperados.

    Acesso restrito a usuários autenticados.

    Atributos:
        model: Modelo utilizado para consulta dos dados.
        context_object_name: Nome do contexto para template.
        ordering: Ordenação padrão dos registros (decrescente por data).
        template_name: Template HTML para renderização do dashboard.
        tipo_ambiente, ambiente, controles_ambiente, estilo_ambiente:
          Configurações visuais e funcionais do dashboard.
        tem_cards: Define se o dashboard apresenta cards (False neste caso).
    """

    model = HistoricoOrcamentario
    context_object_name = 'inadimplencia'
    ordering = ['-data']
    template_name = 'coopesma/pages/dashboard.html'
    tipo_ambiente = 'dashboard'
    ambiente = 'inadimplencia.html'
    controles_ambiente = 'inadimplencia.js'
    estilo_ambiente = 'dashboards/inadimplencia.css'
    tem_cards = False

    def get_queryset(self, *args, **kwargs):
        """
        Obtém o queryset de dados para o dashboard, usando cache para otimizar
          desempenho.

        Retorna:
            QuerySet: Conjunto de registros do modelo HistoricoOrcamentario.
        """

        cache_key = 'inadimplencia_queryset'
        queryset = cache.get(cache_key)

        if not queryset:
            queryset = self.model.objects.all()
            # Cache por 15 minutos
            cache.set(cache_key, queryset, timeout=60*15)

        return queryset

    def update_context(self, ctx):
        """
        Atualiza o contexto do template com dados para renderização.

        Inclui intervalo de anos disponíveis e os dados da inadimplência
        convertidos para JSON, usando um encoder customizado para garantir
        a serialização correta dos tipos de dados.

        Args:
            ctx (dict): Contexto atual do template.

        Retorna:
            dict: Contexto atualizado com informações adicionais para o
              template.
        """

        ctx = super().update_context(ctx)

        qs = self.get_queryset()

        years_range = qs.aggregate(min_year=Min('data'), max_year=Max('data'))
        min_year = years_range['min_year'].year
        max_year = years_range['max_year'].year
        # years = list(range(min_year, max_year + 1))

        # Convertendo datas para strings no formato ISO 8601
        data = list(qs.values('data',
                              'receita_ato_cooperado',
                              'inadimplencia_quitada',
                              'inadimplencia_adquirida',
                              'inadimplencia_acumulada')
                    )

        ctx.update(
            {
                'min_year': min_year,
                'max_year': max_year,
                'data': json.dumps(data, cls=JSONEncoderCustom),
            }
        )
        return ctx
