from django.views.generic import ListView
from django.utils import translation


class DashboardViewBase(ListView):
    """
    Classe base abstrata para views de dashboard.

    Fornece atributos e métodos reutilizáveis para views baseadas em listas,
    como controle de idioma, template e contexto customizado para dashboards.
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
        Retorna o queryset que será utilizado para listar os objetos.

        Esta implementação padrão retorna `None`, devendo ser sobrescrita
        nas subclasses com a lógica de obtenção dos dados relevantes.

        Returns:
            QuerySet | None: os dados que serão exibidos na view.
        """
        return None

    def update_context(self, ctx):
        """
        Atualiza o contexto do template com variáveis específicas do dashboard.

        Args:
            ctx (dict): o dicionário de contexto original.

        Returns:
            dict: o dicionário de contexto atualizado com os dados adicionais.
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
        Retorna o contexto para o template com os dados atualizados pela view
          base.

        Returns:
            dict: dicionário de contexto completo com informações do dashboard.
        """
        ctx = super().get_context_data(*args, **kwargs)
        return self.update_context(ctx)
