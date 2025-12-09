from .dashboard_base import DashboardViewBase
from django.core.cache import cache
from ....models import ProjecaoFates
import json

from django.utils.decorators import method_decorator
from django.contrib.auth.decorators import login_required
from utils.coopesma.json_encoder_data import JSONEncoderCustom


@method_decorator(
    login_required(login_url='colaborador:login', redirect_field_name='next'),
    name='dispatch'
)
class DashboardProjecaoFATESView(DashboardViewBase):
    """
    View para exibir o dashboard de Projeção FATES.

    Esta view apresenta dados da projeção FATES, carregados do modelo
    ProjecaoFates, com suporte a cache para otimização da performance.

    O acesso é restrito a usuários autenticados.

    Atributos:
        model (Model): Modelo ProjecaoFates usado para as consultas.
        context_object_name (str): Nome da variável de contexto para o
          template.
        ordering (list): Ordenação padrão dos objetos, pela data decrescente.
        template_name (str): Caminho do template HTML para renderização.
        tipo_ambiente (str): Tipo do ambiente para lógica interna.
        ambiente (str): Nome do template específico do ambiente.
        controles_ambiente (str): Arquivo JavaScript para esta view.
        estilo_ambiente (str): Arquivo CSS específico para esta view.
        tem_cards (bool): Indica se o dashboard utiliza cards para exibição.

    Métodos:
        get_queryset(*args, **kwargs):
            Retorna o queryset com todos os objetos do modelo,
            utilizando cache para reduzir acessos ao banco de dados.

        update_context(ctx):
            Atualiza o contexto do template, convertendo os dados
            em JSON com suporte para serialização customizada,
            facilitando o consumo via JavaScript no front-end.

    """
    model = ProjecaoFates
    context_object_name = 'projecao_fates'
    ordering = ['-data']
    template_name = 'coopesma/pages/dashboard.html'
    tipo_ambiente = 'dashboard'
    ambiente = 'projecao_fates.html'
    controles_ambiente = 'projecao_fates.js'
    estilo_ambiente = 'dashboards/projecao_fates.css'
    tem_cards = False

    def get_queryset(self, *args, **kwargs):
        """
        Obtém o queryset completo de ProjecaoFates.

        Utiliza cache para evitar múltiplas consultas ao banco de dados,
        armazenando o resultado por 15 minutos.

        Args:
            *args: Argumentos posicionais opcionais.
            **kwargs: Argumentos nomeados opcionais.

        Returns:
            QuerySet: Conjunto de objetos ProjecaoFates.
        """
        cache_key = 'projecao_fates_queryset'
        queryset = cache.get(cache_key)

        if not queryset:
            queryset = self.model.objects.all()
            # Cache por 15 minutos
            cache.set(cache_key, queryset, timeout=60*15)

        return queryset

    def update_context(self, ctx):
        """
        Atualiza o contexto do template com os dados da projeção FATES.

        Converte os dados do queryset em JSON para uso no front-end.

        Args:
            ctx (dict): Contexto inicial recebido da superclasse.

        Returns:
            dict: Contexto atualizado com a chave 'data' contendo
                  os dados JSON serializados da projeção FATES.
        """
        ctx = super().update_context(ctx)

        qs = self.get_queryset()

        # Convertendo datas para strings no formato ISO 8601
        data = list(qs.values('data', 'projecao_fates'))

        ctx.update(
            {
                'data': json.dumps(data, cls=JSONEncoderCustom),
            }
        )
        return ctx
