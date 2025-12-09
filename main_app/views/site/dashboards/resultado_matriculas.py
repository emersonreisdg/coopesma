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
class DashboardResultadoMatriculasView(DashboardViewBase):
    """
    View para exibir o dashboard de resultados de matrículas.

    Essa view utiliza o modelo `Matriculas` para obter dados históricos
    relacionados a matrículas, rematrículas, novos alunos, capacidade
    e ocupação, organizando essas informações para uso em gráficos e tabelas
    no frontend.

    O acesso é restrito a usuários autenticados.

    Atributos:
        model (Model): Modelo `Matriculas` usado para consulta.
        context_object_name (str): Nome do objeto passado para o template.
        ordering (list): Ordenação padrão dos objetos pelo campo `data` desc.
        template_name (str): Template HTML usado para renderizar a página.
        tipo_ambiente (str): Tipo do ambiente (ex: dashboard).
        ambiente (str): Arquivo HTML específico do dashboard.
        controles_ambiente (str): Arquivo JS que controla o dashboard.
        estilo_ambiente (str): Arquivo CSS de estilização do dashboard.
        tem_cards (bool): Indica que o dashboard inclui cards informativos.

    Métodos:
        get_queryset(*args, **kwargs):
            Obtém o queryset do modelo `Matriculas`, utilizando cache para
            otimização do desempenho. Retorna todos os registros.

        update_context(ctx):
            Atualiza o contexto do template com os dados necessários para
            renderizar o dashboard, incluindo o intervalo de anos disponíveis
            e os dados formatados em JSON para uso no frontend.
    """
    model = Matriculas
    context_object_name = 'resultado_matriculas'
    ordering = ['-data']
    template_name = 'coopesma/pages/dashboard.html'
    tipo_ambiente = 'dashboard'
    ambiente = 'resultado_matriculas.html'
    controles_ambiente = 'resultado_matriculas.js'
    estilo_ambiente = 'dashboards/resultado_matriculas.css'
    tem_cards = True

    def get_queryset(self, *args, **kwargs):
        """
        Retorna o queryset do modelo `Matriculas`, utilizando cache para
        melhorar o desempenho.

        Retorna:
            QuerySet: Conjunto de registros do modelo `Matriculas`.
        """
        cache_key = 'resultado_matriculas_queryset'
        queryset = cache.get(cache_key)

        if not queryset:
            queryset = self.model.objects.all()
            # Cache por 15 minutos
            cache.set(cache_key, queryset, timeout=60*15)

        return queryset

    def update_context(self, ctx):
        """
        Atualiza o contexto com dados necessários para renderizar o dashboard.

        Args:
            ctx (dict): Contexto atual do template.

        Retorna:
            dict: Contexto atualizado com intervalo de anos e dados das
              matrículas
            no formato JSON para o frontend.
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
