from authors.models import Profile
from django.shortcuts import get_object_or_404
from django.views.generic import TemplateView


class ProfileView(TemplateView):
    """
    View responsável por exibir o perfil de um usuário específico.

    Utiliza um TemplateView para renderizar a página com os dados do perfil
    com base no ID passado via URL.
    """
    template_name = 'authors/pages/profile.html'

    def get(self, request, *args, **kwargs):
        """
        Processa requisições GET e renderiza o template com os dados do perfil.

        Args:
            request (HttpRequest): Requisição do usuário.
            *args: Argumentos adicionais.
            **kwargs: Dicionários com argumentos da URL (ex: id do perfil).

        Returns:
            HttpResponse: Página renderizada com os dados do perfil.
        """
        context = self.get_context_data(**kwargs)
        profile_id = context.get('id')
        profile = get_object_or_404(Profile.objects.filter(
            pk=profile_id
        ).select_related('author'), pk=profile_id)

        return self.render_to_response({
            **context,
            'profile': profile,
        })
