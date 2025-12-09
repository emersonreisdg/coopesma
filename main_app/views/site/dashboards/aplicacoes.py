from django.core.cache import cache
from django.db.models import Min, Max
from .dashboard_base import DashboardViewBase
from ....models import Aplicacoes
import json
from collections import defaultdict
from django.utils.decorators import method_decorator
from django.contrib.auth.decorators import login_required
from utils.coopesma.json_encoder_data import JSONEncoderCustom


@method_decorator(
    login_required(login_url='colaborador:login', redirect_field_name='next'),
    name='dispatch'
)
class DashboardAplicacoesView(DashboardViewBase):
    """
    View para exibir o dashboard de aplicações financeiras.

    Esta classe herda de `DashboardViewBase` e é responsável por carregar,
    processar e disponibilizar os dados relacionados a aplicações financeiras
    registradas no modelo `Aplicacoes`. Os dados são utilizados em um template
    dinâmico com interações JavaScript, CSS e gráficos.

    A view exige autenticação e utiliza cache para otimizar o carregamento do
    queryset.
    """

    model = Aplicacoes
    title = 'Aplicações'
    context_object_name = 'aplicacoes'
    template_name = 'coopesma/pages/dashboard.html'
    tipo_ambiente = 'dashboard'
    ambiente = 'aplicacoes.html'
    controles_ambiente = 'aplicacoes.js'
    estilo_ambiente = 'dashboards/aplicacoes.css'
    tem_cards = True

    def get_queryset(self, *args, **kwargs):
        """
        Retorna o conjunto de dados do modelo `Aplicacoes`, com cache de 15
        minutos.

        Retorna:
            QuerySet: lista de objetos do modelo `Aplicacoes`.
        """

        cache_key = 'aplicacoes_queryset'
        queryset = cache.get(cache_key)

        if not queryset:
            queryset = self.model.objects.all()
            cache.set(cache_key, queryset, timeout=60*15)

        return queryset

    def update_context(self, ctx):
        """
        Atualiza o contexto do template com dados adicionais necessários
        para o dashboard.

        Inclui:
        - Intervalo de anos disponíveis nas aplicações.
        - Mapeamento de meses por ano.
        - Lista de bancos únicos.
        - Contas e aplicações agrupadas por banco.
        - Dados financeiros convertidos para JSON.

        Args:
            ctx (dict): Contexto original herdado da view base.

        Retorna:
            dict: Contexto atualizado com os dados formatados.
        """

        ctx = super().update_context(ctx)

        qs = self.get_queryset()
        years_range = qs.aggregate(min_year=Min('data'), max_year=Max('data'))
        min_year = years_range['min_year'].year
        max_year = years_range['max_year'].year
        years = list(range(min_year, max_year + 1))

        # Agrupando meses por ano
        aplicacoes = Aplicacoes.objects.all()
        months_by_year = defaultdict(list)

        for aplicacao in aplicacoes:
            year = aplicacao.data.year
            month = aplicacao.data.month
            if month not in months_by_year[year]:
                months_by_year[year].append(month)

        # Organiza os meses em ordem crescente
        months_by_year = {year: sorted(months)
                          for year, months in months_by_year.items()}

        # Convertendo datas para strings no formato ISO 8601
        data = list(qs.values('data', 'banco', 'conta',
                              'aplicacao', 'valor', 'origem'))

        bancos_unicos = qs.values_list('banco', flat=True).distinct()

        # Agrupar contas e aplicações por banco
        contas_por_banco = defaultdict(list)
        aplicacoes_por_banco = defaultdict(list)

        for item in data:
            banco = item['banco']
            conta = item['conta']
            aplicacao = item['aplicacao']

            if conta not in contas_por_banco[banco]:
                contas_por_banco[banco].append(conta)
            if aplicacao not in aplicacoes_por_banco[banco]:
                aplicacoes_por_banco[banco].append(aplicacao)

        ctx.update(
            {
                'min_year': min_year,
                'max_year': max_year,
                'years': years,
                'months_by_year': json.dumps(months_by_year),
                # 'data': json.dumps(data),  # Convertendo para JSON
                'data': json.dumps(data, cls=JSONEncoderCustom),
                'bancos': bancos_unicos,
                # Dados para o seletor de contas
                'contas_por_banco': json.dumps(contas_por_banco),
                # Dados para o seletor de aplicações
                'aplicacoes_por_banco': json.dumps(aplicacoes_por_banco),
            }
        )
        return ctx
