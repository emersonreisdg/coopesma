from .dashboard_base import DashboardViewBase
from django.core.cache import cache
from django.db.models import Min, Max
from ....models import DespesaReceita
import json
from collections import defaultdict

from django.utils.decorators import method_decorator
from django.contrib.auth.decorators import login_required
from utils.coopesma.json_encoder_data import JSONEncoderCustom


@method_decorator(
    login_required(login_url='colaborador:login', redirect_field_name='next'),
    name='dispatch'
)
class DashboardReceitasDespesasView(DashboardViewBase):
    """
    View para exibir o dashboard de Receitas e Despesas.

    Esta view utiliza o modelo `DespesaReceita` para fornecer dados
      financeiros,
    organizados hierarquicamente por tipo, subtipo, categoria e itens, além de
    estruturar os dados de meses e trimestres por ano para facilitar a
      navegação
    temporal no frontend.

    O acesso é restrito a usuários autenticados.

    Atributos:
        model (Model): Modelo DespesaReceita utilizado para consultas.
        context_object_name (str): Nome do objeto no contexto para o template.
        template_name (str): Template HTML utilizado para renderizar a view.
        tipo_ambiente (str): Tipo do ambiente (ex: dashboard).
        ambiente (str): Nome do arquivo HTML específico do ambiente.
        controles_ambiente (str): Arquivo JS de controle do dashboard.
        estilo_ambiente (str): Arquivo CSS para estilização do dashboard.
        tem_cards (bool): Indica se o dashboard terá cards.

    Métodos:
        get_queryset(*args, **kwargs):
            Obtém o queryset dos objetos, utilizando cache para otimização.
            Retorna todos os registros do modelo `DespesaReceita`.

        update_context(ctx):
            Atualiza o contexto do template com dados necessários para o
              dashboard,
            incluindo:
                - Intervalo de anos disponíveis.
                - Hierarquia dos meses por ano, com tradução para nomes em
                  português.
                - Organização da hierarquia temporal em trimestres.
                - Dados financeiros organizados por tipo, subtipo, categoria e
                  itens.
                - Dados convertidos para JSON para uso no frontend.
    """
    model = DespesaReceita
    context_object_name = 'receitas_despesas'
    template_name = 'coopesma/pages/dashboard.html'
    tipo_ambiente = 'dashboard'
    ambiente = 'receitas_despesas.html'
    controles_ambiente = 'receitas_despesas.js'
    estilo_ambiente = 'dashboards/receitas_despesas.css'
    tem_cards = True

    def get_queryset(self, *args, **kwargs):
        """
        Obtém o queryset do modelo `DespesaReceita`, usando cache para
          melhorar desempenho.

        Retorna:
            QuerySet: Conjunto de registros da tabela `DespesaReceita`.
        """
        cache_key = 'receitas_despesas_queryset'
        queryset = cache.get(cache_key)

        if not queryset:
            queryset = self.model.objects.all()
            # Cache por 15 minutos
            cache.set(cache_key, queryset, timeout=60*15)

        return queryset

    def update_context(self, ctx):
        """
        Atualiza o contexto do template com dados necessários para
          renderização do dashboard.

        Args:
            ctx (dict): Contexto atual do template.

        Retorna:
            dict: Contexto atualizado com dados financeiros e hierarquias para
              visualização.
        """
        ctx = super().update_context(ctx)

        qs = self.get_queryset()

        years_range = qs.aggregate(min_year=Min('data'), max_year=Max('data'))
        min_year = years_range['min_year'].year
        max_year = years_range['max_year'].year
        years = list(range(min_year, max_year + 1))

        # # Agrupando meses por ano
        # receitas_despesas = DespesaReceita.objects.all()
        # months_by_year = defaultdict(list)
        # for receita_despesa in receitas_despesas:
        #     year = receita_despesa.data.year
        #     month = receita_despesa.data.month
        #     if month not in months_by_year[year]:
        #         months_by_year[year].append(month)

        # # Organiza os meses em ordem crescente
        # months_by_year = {year: sorted(months)
        #                   for year, months in months_by_year.items()}

        # Agrupando meses por ano
        receitas_despesas = DespesaReceita.objects.all()
        months_by_year = defaultdict(list)
        for receita_despesa in receitas_despesas:
            year = receita_despesa.data.year
            month_number = receita_despesa.data.month  # número do mês (1-12)
            if month_number not in months_by_year[year]:
                months_by_year[year].append(month_number)

        # Mapeando o número do mês para o nome em português e ordenando
        months_map = {
            1: "Janeiro", 2: "Fevereiro", 3: "Março",
            4: "Abril", 5: "Maio", 6: "Junho",
            7: "Julho", 8: "Agosto", 9: "Setembro",
            10: "Outubro", 11: "Novembro", 12: "Dezembro"
        }
        months_by_year = {
            year: [months_map[m] for m in sorted(months)]
            for year, months in months_by_year.items()
        }

        # Criando a estrutura hierárquica para o JavaScript
        dataHierarchy = {}
        for year, months in months_by_year.items():
            dataHierarchy[year] = {
                "Trimestre 1": [m for m in months if m in ["Janeiro", "Fevereiro", "Março"]],  # noqa E503
                "Trimestre 2": [m for m in months if m in ["Abril", "Maio", "Junho"]],  # noqa E503
                "Trimestre 3": [m for m in months if m in ["Julho", "Agosto", "Setembro"]],  # noqa E503
                "Trimestre 4": [m for m in months if m in ["Outubro", "Novembro", "Dezembro"]]  # noqa E503
            }

        # Convertendo datas para strings no formato ISO 8601
        data = list(qs.values('data', 'plano_de_contas',
                              'valor', 'tipo', 'subtipo',
                              'categoria'
                              ))

        # Agrupar subtipo por tipo e categoria por subtipo
        subtipo_por_tipo = defaultdict(list)
        categoria_por_subtipo = defaultdict(lambda: defaultdict(list))
        item_por_tipo = defaultdict(list)
        item_por_subtipo = defaultdict(lambda: defaultdict(list))
        item_por_categoria = defaultdict(
            lambda: defaultdict(lambda: defaultdict(list)))

        for entry in data:
            tipo = entry['tipo']
            subtipo = entry['subtipo']
            categoria = entry['categoria']
            nome_item = entry['plano_de_contas']

            if subtipo not in subtipo_por_tipo[tipo]:
                subtipo_por_tipo[tipo].append(subtipo)
            if categoria not in categoria_por_subtipo[tipo][subtipo]:
                categoria_por_subtipo[tipo][subtipo].append(categoria)
            if nome_item not in item_por_tipo[tipo]:
                item_por_tipo[tipo].append(nome_item)
            if nome_item not in item_por_subtipo[tipo][subtipo]:
                item_por_subtipo[tipo][subtipo].append(nome_item)
            if nome_item not in item_por_categoria[tipo][subtipo][categoria]:
                item_por_categoria[tipo][subtipo][categoria].append(nome_item)

        print('dataHierarchy:', dataHierarchy)

        ctx.update(
            {
                'min_year': min_year,
                'max_year': max_year,
                'years': years,
                'months_by_year': json.dumps(months_by_year),
                'dataHierarchy': json.dumps(dataHierarchy, ensure_ascii=False),
                'data': json.dumps(data, cls=JSONEncoderCustom),
                'subtipo_por_tipo': json.dumps(subtipo_por_tipo),
                'categoria_por_subtipo': json.dumps(categoria_por_subtipo),
                'item_por_tipo': json.dumps(item_por_tipo),
                'item_por_subtipo': json.dumps(item_por_subtipo),
                'item_por_categoria': json.dumps(item_por_categoria),
            }
        )
        return ctx
