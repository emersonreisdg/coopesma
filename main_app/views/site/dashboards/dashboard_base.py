from django.views.generic import ListView
from django.utils import translation


class DashboardViewBase(ListView):
    """
    Classe base genérica para views de dashboards na aplicação.

    Herda de `ListView` e define a estrutura padrão que outras views de
      dashboard devem seguir.
    Permite a customização de dados e templates conforme o tipo de dashboard
      implementado.

    Atributos:
        model (Model): Modelo associado à view (deve ser definido na
          subclasse).
        title (str): Título da página exibido no template.
        html_language (str): Idioma atual da aplicação (útil para templates
          multilíngues).
        context_object_name (str): Nome do contexto principal passado ao
          template.
        ordering (str | list): Ordenação padrão para o queryset.
        template_name (str): Caminho do template a ser renderizado.
        tipo_ambiente (str): Tipo do ambiente
          (usado para lógica de layout, ex: 'dashboard').
        ambiente (str): Nome do template específico de ambiente
          (ex: 'aplicacoes.html').
        controles_ambiente (str): Caminho para o arquivo JavaScript específico
          do ambiente.
        estilo_ambiente (str): Caminho para o CSS específico do ambiente.
        tem_cards (bool): Define se o dashboard exibe cards de informações
          no topo.
        usar_gauge (bool): Define se o dashboard utiliza gráficos do tipo
          "gauge".
    """

    model = None
    title = None
    html_language = translation.get_language()
    context_object_name = None
    ordering = None
    template_name = None
    tipo_ambiente = None
    ambiente = None
    controles_ambiente = None
    estilo_ambiente = None
    tem_cards = None
    usar_gauge = None

    def get_queryset(self, *args, **kwargs):
        """
        Deve ser sobrescrito nas subclasses para retornar os dados que
          alimentarão o dashboard.

        Retorna:
            QuerySet | None: Por padrão, retorna None. Deve ser implementado
              na subclasse.
        """

        return None

    def update_context(self, ctx):
        """
        Atualiza o contexto da view com os atributos comuns aos dashboards.

        Este método centraliza as variáveis contextuais compartilhadas pelas
          views filhas.

        Args:
            ctx (dict): Contexto padrão herdado do Django.

        Retorna:
            dict: Contexto atualizado com os parâmetros específicos do
              dashboard.
        """

        ctx.update(
            {
                'title': self.title,
                'html_language': self.html_language,
                'tipo_ambiente': self.tipo_ambiente,
                'ambiente': self.ambiente,
                'controles_ambiente': self.controles_ambiente,
                'estilo_ambiente': self.estilo_ambiente,
                'tem_cards': self.tem_cards,
                'usar_gauge': self.usar_gauge,
            }
        )
        return ctx

    def get_context_data(self, *args, **kwargs):
        """
        Substitui o método padrão do Django para adicionar o contexto do
          dashboard.

        Chama o `get_context_data` do Django e o atualiza com informações
          adicionais
        via `update_context`.

        Retorna:
            dict: Contexto completo para o template.
        """

        ctx = super().get_context_data(*args, **kwargs)
        return self.update_context(ctx)
