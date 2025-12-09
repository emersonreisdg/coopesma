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
class DashboardPrevisaoOrcamentariaView(DashboardViewBase):
    """
    View para exibir o dashboard de Previsão Orçamentária.

    Esta view exibe dados orçamentários organizados por tipo, subtipo,
    categoria e item, permitindo visualização por anos e meses disponíveis.
    Os dados são carregados e armazenados em cache para melhorar a performance.

    Acesso restrito a usuários autenticados.

    Atributos:
        model (Model): Modelo PrevisaoOrcamentaria usado para consultas.
        title (str): Título da página do dashboard.
        context_object_name (str): Nome da variável de contexto para o
          template.
        template_name (str): Caminho do template HTML usado para renderizar.
        tipo_ambiente (str): Tipo do ambiente para lógica interna.
        ambiente (str): Nome do template específico do ambiente.
        controles_ambiente (str): Arquivo JavaScript específico para a view.
        estilo_ambiente (str): Arquivo CSS específico para a view.
        tem_cards (bool): Indica se o dashboard utiliza cards para exibição.

    Métodos:
        get_queryset(*args, **kwargs):
            Retorna o queryset do modelo, utilizando cache para otimização.

        update_context(ctx):
            Atualiza o contexto com dados estruturados para o template,
            incluindo intervalo de anos, meses por ano e hierarquias dos dados
            agrupados em tipo, subtipo, categoria e item.

    """
    model = PrevisaoOrcamentaria
    title = 'Previsão Orçamentária'
    context_object_name = 'previsao_orcamentaria'
    template_name = 'coopesma/pages/dashboard.html'
    tipo_ambiente = 'dashboard'
    ambiente = 'previsao_orcamentaria.html'
    controles_ambiente = 'previsao_orcamentaria.js'
    estilo_ambiente = 'dashboards/previsao_orcamentaria.css'
    tem_cards = True

    def get_queryset(self, *args, **kwargs):
        """
        Obtém o queryset completo de PrevisaoOrcamentaria.

        Utiliza cache para evitar múltiplas consultas ao banco de dados,
        armazenando o resultado por 15 minutos.

        Args:
            *args: Argumentos posicionais opcionais.
            **kwargs: Argumentos nomeados opcionais.

        Returns:
            QuerySet: Conjunto de objetos PrevisaoOrcamentaria.
        """
        cache_key = 'previsao_orcamentaria_queryset'
        queryset = cache.get(cache_key)

        if not queryset:
            queryset = self.model.objects.all()
            cache.set(cache_key, queryset, timeout=60*15)

        return queryset

    def update_context(self, ctx):
        """
        Atualiza o contexto do template com dados específicos para o dashboard.

        Realiza as seguintes operações:
        - Calcula o intervalo mínimo e máximo de anos nos dados.
        - Agrupa meses disponíveis por ano, ordenando-os.
        - Converte dados para JSON para facilitar uso em JavaScript.
        - Agrupa subtipo por tipo, categoria por subtipo e item por categoria.

        Args:
            ctx (dict): Contexto inicial recebido da superclasse.

        Returns:
            dict: Contexto atualizado com as seguintes chaves:
                - 'min_year': Ano mínimo presente nos dados.
                - 'max_year': Ano máximo presente nos dados.
                - 'years': Lista de anos disponíveis.
                - 'months_by_year': JSON com meses disponíveis por ano.
                - 'data': JSON dos dados brutos para o dashboard.
                - 'subtipo_por_tipo': JSON agrupando subtipos por tipo.
                - 'categoria_por_subtipo': JSON agrupando categorias por
                  subtipo.
                - 'item_por_categoria': JSON agrupando itens por categoria.
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
