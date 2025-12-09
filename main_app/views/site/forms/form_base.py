from django.views.generic.edit import FormView
from django.utils import translation


class FormViewBase(FormView):
    """
    Classe base genérica para views baseadas em formulário. Fornece estrutura
    reutilizável com suporte a contexto estendido, configuração de ambiente,
    linguagem HTML e controle de layout para dashboards.

    Atributos:
        model (Model): Modelo associado à view.
        title (str): Título da página.
        html_language (str): Idioma atual da interface (ex: 'pt-br').
        context_object_name (str): Nome do objeto no contexto do template.
        ordering (str | list): Critério de ordenação padrão.
        template_name (str): Caminho do template HTML.
        tipo_ambiente (str): Tipo de visualização (ex: 'form', 'dashboard').
        ambiente (str): Nome do arquivo HTML principal da view.
        controles_ambiente (str): Arquivo JS relacionado à view.
        estilo_ambiente (str): Arquivo CSS associado à view.
        tem_cards (bool): Indica se a view utiliza cards.
        usar_gauge (bool): Indica se a view utiliza gráficos tipo gauge.
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
        Retorna o queryset a ser utilizado na view.
        Pode ser sobrescrito por subclasses.

        Retorna:
            QuerySet | None: Consulta de dados ou None.
        """
        return None

    def update_context(self, ctx):
        """
        Atualiza o contexto da view com informações adicionais, como título,
        ambiente, idioma e arquivos de controle.

        Parâmetros:
            ctx (dict): Contexto original da view.

        Retorna:
            dict: Contexto atualizado.
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
        Gera o contexto para renderização do template e o estende com dados
        adicionais da view.

        Retorna:
            dict: Contexto final para renderização.
        """
        ctx = super().get_context_data(*args, **kwargs)
        return self.update_context(ctx)
