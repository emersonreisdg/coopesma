from django.utils import translation
from django.views.generic import TemplateView

from django.utils.decorators import method_decorator
from django.contrib.auth.decorators import login_required


@method_decorator(
    login_required(login_url='colaborador:login', redirect_field_name='next'),
    name='dispatch'
)
class ManagerView(TemplateView):
    """
    View para a página do gestor (Manager).

    Esta view utiliza TemplateView para renderizar o template
    'coopesma/pages/manager.html' e requer que o usuário esteja
    autenticado para acesso (decorador login_required).

    No contexto da página, adiciona informações do usuário autenticado,
    incluindo o idioma HTML, o primeiro grupo do usuário e o primeiro nome.

    Atributos:
        template_name (str): Caminho do template HTML a ser renderizado.

    Métodos:
        get_context_data(**kwargs) -> dict:
            Retorna o contexto para o template, incluindo dados do usuário
            autenticado como idioma da página, grupos e primeiro nome.
    """

    template_name = 'coopesma/pages/manager.html'

    def get_context_data(self, **kwargs):
        """
        Obtém o contexto para renderização do template.

        Atualiza o contexto com informações do usuário autenticado:
        - html_language: idioma da interface obtido do sistema de tradução do
          Django.
        - user_groups: primeiro grupo ao qual o usuário pertence (ou None).
        - user_first_name: primeiro nome do usuário.

        Args:
            **kwargs: Argumentos adicionais.

        Retorna:
            dict: Contexto atualizado para o template.
        """

        context = super().get_context_data(**kwargs)
        if self.request.user.is_authenticated:
            html_language = translation.get_language()
            user_group = self.request.user.groups.first()
            user_first_name = self.request.user.first_name
            context.update(
                {
                    'html_language': html_language,
                    'user_groups': user_group,
                    'user_first_name': user_first_name,
                }
            )
        return context
