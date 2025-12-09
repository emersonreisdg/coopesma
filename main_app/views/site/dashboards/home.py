from django.views.generic import TemplateView


class HomeView(TemplateView):
    """
    View para renderização da página inicial do sistema.

    Utiliza um TemplateView padrão do Django para exibir o template
    estático 'home.html' localizado no diretório 'coopesma/pages/'.

    Atributos:
        template_name (str): Caminho para o template HTML a ser renderizado.
    """

    template_name = 'coopesma/pages/home.html'
