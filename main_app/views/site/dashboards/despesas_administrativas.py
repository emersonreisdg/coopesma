from .dashboard_base import DashboardViewBase
from django.core.cache import cache
from django.db.models import Min, Max
from ....models import DespesasAdministrativas
import json
from django.db.models.functions import ExtractMonth

from django.utils.decorators import method_decorator
from django.contrib.auth.decorators import login_required
from utils.coopesma.json_encoder_data import JSONEncoderCustom


@method_decorator(
    login_required(login_url='colaborador:login', redirect_field_name='next'),
    name='dispatch'
)
class DashboardDespesaAdmnistrativaView(DashboardViewBase):
    """
    View do dashboard para exibição e análise de despesas administrativas.

    Esta view herda de DashboardViewBase e configura os elementos específicos
    do ambiente de dashboard de despesas administrativas. É protegida por
      login.

    Atributos:
        model: Modelo Django que representa as despesas administrativas.
        title (str): Título a ser exibido no dashboard.
        context_object_name (str): Nome da variável de contexto para o
          template.
        template_name (str): Caminho para o template base.
        tipo_ambiente (str): Tipo de ambiente ('dashboard').
        ambiente (str): Caminho do arquivo HTML específico da aplicação.
        controles_ambiente (str): Caminho do arquivo JS de controle.
        estilo_ambiente (str): Caminho do CSS específico da aplicação.
        tem_cards (bool): Indica se o dashboard possui cards informativos.
    """

    model = DespesasAdministrativas
    title = 'Despesas Administrativas'
    context_object_name = 'despesas_administrativas'
    template_name = 'coopesma/pages/dashboard.html'
    tipo_ambiente = 'dashboard'
    ambiente = 'despesas_administrativas.html'
    controles_ambiente = 'despesas_administrativas.js'
    estilo_ambiente = 'dashboards/despesas_administrativas.css'
    tem_cards = True

    def get_queryset(self, *args, **kwargs):
        """
        Obtém o queryset de despesas administrativas, com cache por 15 minutos.

        Retorna:
            queryset (QuerySet): Conjunto de objetos `DespesasAdministrativas`.
        """

        cache_key = 'despesas_administrativas_queryset'
        queryset = cache.get(cache_key)

        if not queryset:
            queryset = self.model.objects.all()
            cache.set(cache_key, queryset, timeout=60*15)

        return queryset

    def update_context(self, ctx):
        """
        Atualiza o contexto do template com dados necessários para
          renderização.

        Adiciona os anos disponíveis e os dados de despesas com mês extraído.

        Parâmetros:
            ctx (dict): Contexto herdado do método base.

        Retorna:
            ctx (dict): Contexto atualizado com os dados para o frontend.
        """

        ctx = super().update_context(ctx)

        qs = self.get_queryset()
        years_range = qs.aggregate(min_year=Min('data'), max_year=Max('data'))
        min_year = years_range['min_year'].year
        max_year = years_range['max_year'].year
        years = list(range(min_year, max_year + 1))

        data = list(qs.annotate(month=ExtractMonth('data')).values(
            'month', 'data', 'descricao', 'valor'))

        ctx.update({
            'years': years,
            'data': json.dumps(data, cls=JSONEncoderCustom),
        })
        return ctx
