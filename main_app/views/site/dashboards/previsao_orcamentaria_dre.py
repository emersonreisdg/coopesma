from .dashboard_base import DashboardViewBase
from ....models import PrevisaoOrcamentaria
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
class DashboardPrevisaoOrcamentariaDreView(DashboardViewBase):
    """
    View para exibir o dashboard de Previsão Orçamentária no formato DRE.

    Esta view herda de DashboardViewBase e gerencia a exibição dos dados
    orçamentários agrupados por tipo, subtipo, categoria e item, com
    suporte a cache para otimização.

    A view também prepara o contexto para o template, incluindo o intervalo de
    anos, meses disponíveis por ano e as hierarquias de agrupamento dos dados.

    Acesso restrito a usuários autenticados.

    Atributos:
        model (Model): Modelo PrevisaoOrcamentaria usado para consultas.
        title (str): Título para a página/dash.
        context_object_name (str): Nome do objeto no contexto do template.
        template_name (str): Caminho para o template HTML usado.
        tipo_ambiente (str): Tipo de ambiente para uso interno.
        ambiente (str): Nome do template específico do ambiente.
        controles_ambiente (str): Arquivo JS com controles específicos do
         ambiente.
        estilo_ambiente (str): Arquivo CSS específico do ambiente.
        tem_cards (bool): Indicador para uso de cards no dashboard.

    Métodos:
        get_queryset(*args, **kwargs):
            Retorna o queryset do modelo, utilizando cache com timeout de 15
              minutos.

        update_context(ctx):
            Atualiza o contexto do template com dados formatados para exibição,
            incluindo anos disponíveis, meses por ano e a estrutura hierárquica
            dos dados agrupados por tipo, subtipo, categoria e item.

    """
    model = PrevisaoOrcamentaria
    title = 'Previsão Orçamentária | Formato DRE'
    context_object_name = 'previsao_orcamentaria_dre'
    template_name = 'coopesma/pages/dashboard.html'
    tipo_ambiente = 'dashboard'
    ambiente = 'previsao_orcamentaria_dre.html'
    controles_ambiente = 'previsao_orcamentaria_dre.js'
    estilo_ambiente = 'dashboards/previsao_orcamentaria_dre.css'
    tem_cards = True

    def get_queryset(self, *args, **kwargs):
        """
        Obtém o queryset completo de PrevisaoOrcamentaria.

        Utiliza cache para evitar consultas repetidas ao banco de dados,
        armazenando os resultados por 15 minutos.

        Args:
            *args: Argumentos posicionais opcionais.
            **kwargs: Argumentos nomeados opcionais.

        Returns:
            QuerySet: Conjunto de registros do modelo PrevisaoOrcamentaria.
        """

        cache_key = 'previsao_orcamentaria_dre_queryset'
        queryset = cache.get(cache_key)

        if not queryset:
            queryset = self.model.objects.all()
            cache.set(cache_key, queryset, timeout=60*15)

        return queryset

    def update_context(self, ctx):
        """
        Atualiza o contexto passado para o template com dados específicos para
         o dashboard.

        Executa as seguintes operações:
        - Obtém o intervalo de anos disponíveis nos dados.
        - Agrupa os meses disponíveis por ano.
        - Converte os dados para JSON para facilitar o uso no frontend.
        - Cria uma estrutura hierárquica de agrupamentos
          (tipo > subtipo > categoria > item).

        Args:
            ctx (dict): Contexto inicial que pode conter dados padrão da
              superclasse.

        Returns:
            dict: Contexto atualizado contendo:
                - 'min_year' (int): Ano mínimo disponível nos dados.
                - 'max_year' (int): Ano máximo disponível nos dados.
                - 'years' (list[int]): Lista dos anos disponíveis.
                - 'months_by_year' (str): JSON contendo meses disponíveis por
                  ano.
                - 'data' (str): JSON dos dados brutos para o dashboard.
                - 'subtipo_por_tipo' (str): JSON mapeando subtipos para cada
                  tipo.
                - 'categoria_por_subtipo' (str): JSON mapeando categorias para
                  cada subtipo.
                - 'item_por_categoria' (str): JSON mapeando itens para cada
                  categoria.
        """
        ctx = super().update_context(ctx)

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
        data = list(qs.values('data', 'tipo', 'subtipo',
                              'categoria', 'item', 'valor',
                              'observacao'))

        # Agrupar subtipo por tipo e categoria por subtipo
        subtipo_por_tipo = defaultdict(list)
        categoria_por_subtipo = defaultdict(lambda: defaultdict(list))
        item_por_categoria = defaultdict(
            lambda: defaultdict(lambda: defaultdict(list)))

        for entry in data:
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
                'data': json.dumps(data, cls=JSONEncoderCustom),
                'subtipo_por_tipo': json.dumps(subtipo_por_tipo),
                'categoria_por_subtipo': json.dumps(categoria_por_subtipo),
                'item_por_categoria': json.dumps(item_por_categoria),
            }
        )
        return ctx
