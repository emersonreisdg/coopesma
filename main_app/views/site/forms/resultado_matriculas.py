from .form_base import FormViewBase
from django.core.cache import cache
from django.db.models import Min, Max
from ....models import Matriculas
import json
from utils.coopesma.json_encoder_data import JSONEncoderCustom


class FormResultadoMatriculasView(FormViewBase):
    """
    View responsável por exibir os resultados de matrículas em formato
    de formulário. Utiliza cache para otimização e prepara os dados
    para renderização no frontend.
    """
    model = Matriculas
    context_object_name = 'resultado_matriculas'
    ordering = ['-data']
    template_name = 'coopesma/pages/form.html'
    tipo_ambiente = 'form'
    ambiente = 'resultado_matriculas.html'
    controles_ambiente = 'resultado_matriculas.js'
    estilo_ambiente = 'forms/resultado_matriculas.css'
    tem_cards = False

    def get_queryset(self, *args, **kwargs):
        """
        Recupera o queryset do modelo Matriculas. Os dados são armazenados
        em cache por 15 minutos para melhorar a performance.

        Retorna:
            QuerySet: lista de objetos Matriculas.
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
        Atualiza o contexto com informações adicionais para renderização
        no template, como intervalo de anos e dados serializados em JSON.

        Parâmetros:
            ctx (dict): contexto base herdado da superclasse.

        Retorna:
            dict: contexto atualizado com 'years' e 'data'.
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
