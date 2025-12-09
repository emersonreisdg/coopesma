from .dashboard_base import DashboardViewBase
from ....models import PrevisaoOrcamentaria, DespesaReceita
from django.core.cache import cache
from django.db.models import Min, Max
import json
from collections import defaultdict

from django.utils.decorators import method_decorator
from django.contrib.auth.decorators import login_required
from utils.coopesma.json_encoder_data import JSONEncoderCustom


@method_decorator(
    login_required(login_url='colaborador:login', redirect_field_name='next'),
    name='dispatch'
)
class OrcamentoView(DashboardViewBase):
    """
    View de dashboard para exibição de dados orçamentários.

    Esta view exibe os dados de Previsão Orçamentária e Despesa/Receita,
    agrupados por ano, mês, tipo, subtipo, categoria e item. Também prepara
    o contexto para uso no template, com suporte a caching.
    """
    model = PrevisaoOrcamentaria
    title = 'Orçamento'
    context_object_name = 'orcamento'
    template_name = 'coopesma/pages/orcamento.html'
    tipo_ambiente = 'dashboard'
    ambiente = 'orcamento.html'
    controles_ambiente = 'orcamento.js'
    estilo_ambiente = 'orcamento/orcamento.css'
    tem_cards = True

    def get_queryset(self, *args, **kwargs):
        """
        Retorna o queryset de Previsão Orçamentária, utilizando cache.

        Returns:
            QuerySet: objetos de PrevisaoOrcamentaria armazenados ou
              consultados.
        """
        cache_key = 'orcamento_queryset'
        queryset = cache.get(cache_key)

        if not queryset:
            queryset = self.model.objects.all()
            cache.set(cache_key, queryset, timeout=60*15)

        return queryset

    def update_context(self, ctx):
        """
        Atualiza o contexto do template com dados de orçamento e despesas.

        Inclui dados agregados como:
        - anos disponíveis,
        - meses por ano,
        - dados de previsão orçamentária e despesas,
        - estrutura hierárquica (tipo → subtipo → categoria → item).

        Args:
            ctx (dict): contexto original da view.

        Returns:
            dict: contexto atualizado para renderização do dashboard.
        """
        ctx = super().update_context(ctx)

        print('Atualizando o contexto para ORÇAMENTO')

        qs = self.get_queryset()
        years_range = qs.aggregate(min_year=Min('data'), max_year=Max('data'))
        min_year = years_range['min_year'].year
        max_year = years_range['max_year'].year
        years = list(range(min_year, max_year + 1))

        # Agrupando meses por ano
        previsoes_orcamentarias = PrevisaoOrcamentaria.objects.all()
        months_by_year = defaultdict(list)
        for previsao_orcamentaria in previsoes_orcamentarias:
            year = previsao_orcamentaria.data.year
            month = previsao_orcamentaria.data.month
            if month not in months_by_year[year]:
                months_by_year[year].append(month)

        # Organiza os meses em ordem crescente
        months_by_year = {year: sorted(months)
                          for year, months in months_by_year.items()}

        # Convertendo datas para strings no formato ISO 8601
        data_previsao = list(qs.values('data', 'tipo', 'subtipo',
                                       'categoria', 'item', 'valor',
                                       'observacao'))

        # Dados de DespesaReceita
        despesa_receita_qs = DespesaReceita.objects.all()
        data_despesa_receita = list(despesa_receita_qs.values(
            'data',
            'plano_de_contas',
            'valor',
            'tipo',
            'subtipo',
            'categoria'
        ))

        # Agrupar subtipo por tipo e categoria por subtipo
        subtipo_por_tipo = defaultdict(list)
        categoria_por_subtipo = defaultdict(lambda: defaultdict(list))
        item_por_categoria = defaultdict(
            lambda: defaultdict(lambda: defaultdict(list)))

        for entry in data_previsao:
            tipo = entry['tipo']
            subtipo = entry['subtipo']
            categoria = entry['categoria']
            # Renomear para evitar conflito com a variável "item"
            nome_item = entry['item']

            if subtipo not in subtipo_por_tipo[tipo]:
                subtipo_por_tipo[tipo].append(subtipo)
            if categoria not in categoria_por_subtipo[tipo][subtipo]:
                categoria_por_subtipo[tipo][subtipo].append(categoria)
            if nome_item not in item_por_categoria[tipo][subtipo][categoria]:
                item_por_categoria[tipo][subtipo][categoria].append(nome_item)

        print('item_por_categoria:', item_por_categoria)

        ctx.update(
            {
                'min_year': min_year,
                'max_year': max_year,
                'years': years,
                'months_by_year': json.dumps(months_by_year),
                'data_previsao': json.dumps(data_previsao,
                                            cls=JSONEncoderCustom
                                            ),
                'data_despesa_receita': json.dumps(data_despesa_receita,
                                                   cls=JSONEncoderCustom
                                                   ),
                'subtipo_por_tipo': json.dumps(subtipo_por_tipo),
                'categoria_por_subtipo': json.dumps(categoria_por_subtipo),
                'item_por_categoria': json.dumps(item_por_categoria),
            }
        )
        return ctx
