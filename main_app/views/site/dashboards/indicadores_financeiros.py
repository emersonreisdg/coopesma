from .dashboard_base import DashboardViewBase
from ....models import HistoricoIndicesFinanceiros
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
class DashboardIndicadoresFinanceirosView(DashboardViewBase):
    """
    View para o dashboard de Indicadores Financeiros.

    Esta view herda de DashboardViewBase e utiliza o modelo
      HistoricoIndicesFinanceiros
    para recuperar e preparar dados financeiros que serão exibidos em formato
    visual no frontend.

    O dashboard apresenta indicadores financeiros detalhados, com suporte
    para cards e gauges, e permite seleção de períodos para análise.

    Atributos:
        model (Model): Modelo Django para consulta dos dados financeiros.
        context_object_name (str): Nome da variável no contexto do template.
        ordering (list): Ordenação padrão dos dados (decrescente por data).
        template_name (str): Caminho para o template HTML.
        tipo_ambiente (str): Tipo de ambiente para controle do template.
        ambiente (str): Arquivo HTML específico para renderização.
        controles_ambiente (str): Script JavaScript para controle do frontend.
        estilo_ambiente (str): CSS para estilização do dashboard.
        tem_cards (bool): Define se o dashboard usa cards para apresentação.
        usar_gauge (bool): Define se o dashboard usa gráficos do tipo gauge.

    Métodos:
        get_queryset(*args, **kwargs) -> QuerySet:
            Recupera o queryset dos indicadores financeiros, utilizando cache
            para otimizar performance. Os dados são armazenados em cache por
              15 minutos.

        update_context(ctx: dict) -> dict:
            Atualiza o contexto do template com os dados necessários para
            renderização, incluindo lista de anos, indicadores financeiros,
            itens contábeis, e dados financeiros calculados e serializados em
              JSON.

    """

    model = HistoricoIndicesFinanceiros
    context_object_name = 'indicadores_financeiros'
    ordering = ['-data']
    template_name = 'coopesma/pages/dashboard.html'
    tipo_ambiente = 'dashboard'
    ambiente = 'indicadores_financeiros.html'
    controles_ambiente = 'indicadores_financeiros.js'
    estilo_ambiente = 'dashboards/indicadores_financeiros.css'
    tem_cards = True
    usar_gauge = True

    def get_queryset(self, *args, **kwargs):
        """
        Obtém o queryset do modelo HistoricoIndicesFinanceiros, utilizando
          cache.

        Retorna:
            QuerySet: Todos os registros do modelo, armazenados em cache por
              15 minutos.
        """
        cache_key = 'indicadores_financeiros_queryset'
        queryset = cache.get(cache_key)

        if not queryset:
            queryset = self.model.objects.all()
            # Cache por 15 minutos
            cache.set(cache_key, queryset, timeout=60*15)

        return queryset

    def update_context(self, ctx):
        """
        Atualiza o contexto do template com os dados financeiros formatados e
        as informações dos indicadores e itens contábeis para uso no frontend.

        Realiza o cálculo de índices financeiros derivados a partir dos campos
          brutos,
        como ROE, índices de liquidez e margem de lucro.

        Args:
            ctx (dict): Contexto inicial do template.

        Retorna:
            dict: Contexto atualizado com os dados para renderização do
              dashboard.
        """
        ctx = super().update_context(ctx)

        qs = self.get_queryset()

        years_range = qs.aggregate(min_year=Min('data'), max_year=Max('data'))
        min_year = years_range['min_year'].year
        max_year = years_range['max_year'].year
        years = list(range(min_year, max_year + 1))

        itens_contabeis = [
            {'nome': 'Ativo Circulante', 'tag': 'ativo_circulante'},
            {'nome': 'Realizável a Longo Prazo',
                'tag': 'realizavel_a_longo_prazo'},
            {'nome': 'Imobilizado',
             'tag': 'investimento_imobilizado'},
            {'nome': 'Total do Ativo', 'tag': 'total_ativo'},
            {'nome': 'Passivo Circulante', 'tag': 'passivo_circulante'},
            {'nome': 'Exigível a Longo Prazo',
             'tag': 'exigivel_a_longo_prazo'},
            {'nome': 'Patrimônio Líquido', 'tag': 'patrimonio_liquido'},
            {'nome': 'Receita Líquida Total',
             'tag': 'receita_liquida_total'},
            {'nome': 'Lucro Líquido', 'tag': 'lucro_liquido'},
            {'nome': 'Depreciação', 'tag': 'depreciacao'},
            {'nome': 'Resultado Operacional',
             'tag': 'resultado_operacional'},
            {'nome': 'Contas a Receber', 'tag': 'contas_a_receber'},
            {'nome': 'Sobra Bruta', 'tag': 'sobra_bruta'},
        ]

        indicadores_financeiros = [
            {'nome': 'Índice de Liquidez Geral',
             'indicador': 'indice_liquidez_geral',
             'limites': [0.0, 1.0, 2.0, 3.0, 4.0],
             'referencia': 1.0,
             'sentido': 'direto',
             'observacao': 'Para cada R$ 1,00 a pagar, tem-se R$ ??? '
             'de ativo.'},
            {'nome': 'Índice de Solvência Geral',
             'indicador': 'indice_solvencia_geral',
             'limites': [0.0, 1.0, 3.0, 6.0, 10.0],
             'referencia': 1.0,
             'sentido': 'direto',
             'observacao': 'Para cada R$ 1,00 a pagar, tem-se R$ ??? '
             'de ativo total.'},
            {'nome': 'Índice de Liquidez Corrente',
             'indicador': 'indice_liquidez_corrente',
             'limites': [0.0, 1.0, 2.0, 3.0, 4.0],
             'referencia': 1.0,
             'sentido': 'direto',
             'observacao': 'Para cada R$ 1,00 a pagar no curto prazo, tem-se '
             'R$ ??? de ativo no curto prazo.'},
            {'nome': 'Índice de Endividamento Total',
             'indicador': 'indice_endividamento_total',
             'limites': [0.0, 0.15, 0.4, 0.8,  2.0],
             'referencia': 1.0,
             'sentido': 'reverso',
             'observacao': 'Para cada R$ 1,00 de Patrimônio Líquido, tem-se '
             'R$ ??? de passivo.'},
            {'nome': 'Grau de Imobilização',
             'indicador': 'grau_imobilizacao',
             'limites': [0.0, 0.25, 0.5, 0.75, 1.0],
             'referencia': 0.1,
             'sentido': 'direto',
             'observacao': 'Para cada R$ 1,00 de Patrimônio Líquido, R$ ??? '
             'encontra-se imobilizado/investido.'},
            {'nome': 'EBITDA',
             'indicador': 'ebitda',
             'limites': [-0.5, 0.1, 0.35, 0.6, 1.2],
             'referencia': 0.0,
             'sentido': 'direto',
             'observacao': 'Resultado operacional antes da provisão dos '
             'impostos sobre o lucro e do resultado financeiro (-) '
             'depreciação.'},
            {'nome': 'Margem de Lucro Líquida',
             'indicador': 'margem_lucro_liquida',
             'limites': [-0.5, 0.0, 0.25, 0.5, 1.0],
             'referencia': 0.0,
             'sentido': 'direto',
             'observacao': 'Resultado do lucro líquido dividido pela receita '
             'líquida após todos os impostos e tributos serem devidamente '
             'deduzidos.'},
            {'nome': 'Margem de Contribuição',
             'indicador': 'margem_contribuicao',
             'limites': [-0.5, 0.0, 0.25, 0.5, 1.0],
             'referencia': 0.0,
             'sentido': 'direto',
             'observacao': 'Percentual da receita líquida necessário para '
             'cobrir os custos operacionais fixos.'},
            {'nome': 'ROE',
             'indicador': 'roe',
             'limites': [-0.5, 0.0, 0.5, 1.0, 1.5],
             'referencia': 0.0,
             'sentido': 'direto',
             'observacao': 'Retorno sobre o Patrimônio Líquido.'
             }
        ]

        # Convertendo datas para strings no formato ISO 8601
        data = list(qs.values('data',
                              'ativo_circulante',
                              'realizavel_a_longo_prazo',
                              'investimento_imobilizado',
                              'total_ativo',
                              'passivo_circulante',
                              'exigivel_a_longo_prazo',
                              'patrimonio_liquido',
                              'receita_liquida_total',
                              'lucro_liquido',
                              'depreciacao',
                              'resultado_operacional',
                              'contas_a_receber',
                              'diponivel',
                              'sobra_bruta',
                              'indice_liquidez_geral',
                              'indice_solvencia_geral',
                              'indice_liquidez_corrente',
                              'indice_endividamento_total',
                              'grau_imobilizacao',
                              'ebitda',
                              'margem_lucro_liquida',
                              'margem_contribuicao')
                    )

        for item in data:
            # Calculando o ROE
            if item['patrimonio_liquido'] != 0:
                item['indice_endividamento_total'] = (item['passivo_circulante'] + item['exigivel_a_longo_prazo']) / item['patrimonio_liquido']  # noqa: E501
                item['grau_imobilizacao'] = item['investimento_imobilizado'] / item['patrimonio_liquido']  # noqa: E501
                item['roe'] = item['lucro_liquido'] / item['patrimonio_liquido']  # noqa: E501
            else:
                item['indice_endividamento_total'] = None
                item['grau_imobilizacao'] = None
                item['roe'] = None  # Evitar divisão por zero

            if (item['passivo_circulante'] + item['exigivel_a_longo_prazo']) != 0:  # noqa: E501
                item['indice_liquidez_geral'] = (item['ativo_circulante'] + item['realizavel_a_longo_prazo']) / (item['passivo_circulante'] + item['exigivel_a_longo_prazo'])   # noqa: E501
                item['indice_solvencia_geral'] = item['total_ativo'] / (item['passivo_circulante'] + item['exigivel_a_longo_prazo'])   # noqa: E501
            else:
                item['indice_liquidez_geral'] = None
                item['indice_solvencia_geral'] = None

            if item['passivo_circulante'] != 0:  # noqa: E501
                item['indice_liquidez_corrente'] = item['ativo_circulante'] / item['passivo_circulante']   # noqa: E501
            else:
                item['indice_liquidez_corrente'] = None

            if item['receita_liquida_total'] != 0:  # noqa: E501
                item['ebitda'] = item['resultado_operacional'] / item['receita_liquida_total']   # noqa: E501
                item['margem_lucro_liquida'] = item['lucro_liquido'] / item['receita_liquida_total']   # noqa: E501
                item['margem_contribuicao'] = item['sobra_bruta'] / item['receita_liquida_total']   # noqa: E501
            else:
                item['ebitda'] = None
                item['margem_lucro_liquida'] = None
                item['margem_contribuicao'] = None

        ctx.update(
            {
                'itens_contabeis': itens_contabeis,
                'i_contabeis': json.dumps(itens_contabeis),
                'ind_financeiros': indicadores_financeiros,
                'indicadores_financeiros': json.dumps(indicadores_financeiros),
                'years': years,
                'data': json.dumps(data, cls=JSONEncoderCustom),
            }
        )
        return ctx
