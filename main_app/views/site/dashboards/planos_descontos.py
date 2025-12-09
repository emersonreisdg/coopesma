from .dashboard_base import DashboardViewBase
from ....models import Controle
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
class DashboardPlanosDescontosView(DashboardViewBase):
    """
    View para o dashboard de Planos e Descontos.

    Esta view herda de DashboardViewBase e utiliza o modelo Controle para
    recuperar e exibir informações relacionadas aos planos e descontos
      aplicados aos cooperados.

    Funcionalidades principais:
    - Cacheia o queryset por 15 minutos para melhorar performance.
    - Recupera o intervalo de anos disponíveis nos dados para controle de
      filtros.
    - Converte os dados do queryset em JSON, incluindo campos relevantes como
      data, cooperado, rateio, valor líquido, benefícios, desconto, percentual
        de desconto, cooperar_plus e turma.
    - Atualiza o contexto do template com essas informações para renderização.

    Acesso restrito a usuários autenticados.

    Atributos:
        model (Model): Modelo Django associado (Controle).
        title (str): Título da página.
        context_object_name (str): Nome do contexto usado no template.
        template_name (str): Template HTML para renderização.
        tipo_ambiente (str): Tipo de ambiente para controle visual.
        ambiente (str): Nome do arquivo HTML parcial.
        controles_ambiente (str): Arquivo JS associado ao dashboard.
        estilo_ambiente (str): Arquivo CSS associado ao dashboard.
        tem_cards (bool): Indicador para exibir cards no dashboard.

    Métodos:
        get_queryset: Obtém os dados do modelo, usando cache para otimização.
        update_context: Atualiza o contexto do template com dados JSON e
          intervalo de anos.
    """

    model = Controle
    title = 'Planos e Descontos'
    context_object_name = 'planos_descontos'
    template_name = 'coopesma/pages/dashboard.html'
    tipo_ambiente = 'dashboard'
    ambiente = 'planos_descontos.html'
    controles_ambiente = 'planos_descontos.js'
    estilo_ambiente = 'dashboards/planos_descontos.css'
    tem_cards = True

    def get_queryset(self, *args, **kwargs):
        """
        Obtém o queryset com os dados do modelo Controle.

        Tenta recuperar os dados do cache com a chave
          'planos_descontos_queryset'.
        Se não encontrar, realiza a consulta no banco de dados e armazena o
          resultado no cache por 15 minutos para otimização de desempenho.

        Retorna:
            QuerySet: Conjunto de objetos do modelo Controle.
        """
        cache_key = 'planos_descontos_queryset'
        queryset = cache.get(cache_key)

        if not queryset:
            queryset = self.model.objects.all()
            cache.set(cache_key, queryset, timeout=60*15)

        return queryset

    def update_context(self, ctx):
        """
        Atualiza o contexto do template com informações adicionais necessárias
          para a renderização.

        - Recupera o queryset de dados.
        - Calcula o intervalo de anos disponíveis nos dados, com base nos
          valores mínimo e máximo do campo 'data'.
        - Gera uma lista de anos a partir desse intervalo.
        - Extrai do queryset os campos necessários e os converte para JSON
          usando JSONEncoderCustom.
        - Atualiza o contexto com os anos mínimo, máximo, a lista de anos e os
          dados JSON.

        Parâmetros:
            ctx (dict): Contexto inicial a ser atualizado.

        Retorna:
            dict: Contexto atualizado para renderização do template.
    """
        ctx = super().update_context(ctx)

        qs = self.get_queryset()
        years_range = qs.aggregate(min_year=Min('data'), max_year=Max('data'))
        min_year = years_range['min_year'].year
        max_year = years_range['max_year'].year
        years = list(range(min_year, max_year + 1))

        # Convertendo datas para strings no formato ISO 8601
        data = list(qs.values('data', 'cooperado', 'rateio',
                              'valor_liquido', 'beneficios', 'aluno',
                              'desconto', 'desconto_percentual',
                              'cooperar_plus', 'turma'))

        ctx.update(
            {
                'min_year': min_year,
                'max_year': max_year,
                'years': years,
                'data': json.dumps(data, cls=JSONEncoderCustom),
            }
        )
        return ctx
