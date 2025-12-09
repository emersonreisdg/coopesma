from django.shortcuts import render
from django.utils.translation import gettext_lazy as _
from ...site.forms.form_base import FormViewBase
from django import forms
from decouple import config
from django.http import JsonResponse
from django.utils.decorators import method_decorator
from django.contrib.auth.decorators import login_required
from django.views import View
from django.urls import reverse_lazy
import logging
import json

logger = logging.getLogger(__name__)


class UsinaFotovoltaicaForm(forms.Form):
    """
    Formulário para entrada de dados da usina fotovoltaica.
    """
    nome = forms.CharField(max_length=100)
    capacidade = forms.DecimalField(max_digits=10, decimal_places=2)


@method_decorator(
    login_required(login_url='colaborador:login', redirect_field_name='next'),
    name='dispatch'
)
class UsinaFotovoltaicaView(FormViewBase):
    """
    View para exibição do formulário de dados da usina fotovoltaica.

    Esta view renderiza a página principal com o formulário de entrada
    e define os recursos estáticos utilizados no ambiente da view.
    """
    model = None  # Atualize conforme necessário
    form_class = UsinaFotovoltaicaForm
    title = _("Usina Fotovoltaica")
    template_name = 'coopesma/pages/usina_fotovoltaica.html'
    context_object_name = "usina_fotovoltaica"
    ambiente = 'usina_fotovoltaica.html'
    controles_ambiente = 'usina_fotovoltaica.js'
    estilo_ambiente = 'usina/usina_fotovoltaica.css'

    def get_queryset(self, *args, **kwargs):
        """
        Retorna o queryset da view, se necessário.

        Pode ser sobrescrito por subclasses.
        """
        return None

    def usina_fotovoltaica_view(self, request):
        """
        Renderiza a página da usina fotovoltaica com a URL
        de monitoramento embutida no contexto.

        Args:
            request (HttpRequest): requisição HTTP.

        Returns:
            HttpResponse: resposta com o template renderizado.
        """
        monitoramento_url = reverse_lazy('coopesma:monitoramento')
        print('monitoramento_url:', monitoramento_url)
        context = {
            # Processa a URL no backend
            # 'monitoramento_url': '/usina_fotovoltaica/monitoramento/',
            'monitoramento_url': monitoramento_url,
        }
        return render(request, self.template_name, context)


@method_decorator(
    login_required(login_url='colaborador:login', redirect_field_name='next'),
    name='dispatch'
)
class UsinaFotovoltaicaMonitoramentoView(View):
    """
    View responsável por fornecer a URL autenticada para o sistema de
      monitoramento.

    Esta view responde a requisições POST e retorna uma URL obtida via variável
    de ambiente, permitindo a abertura segura do sistema de monitoramento
      externo.
    """

    def get_url(self):
        """
        Obtém a URL de login da usina fotovoltaica a partir do arquivo .env.

        Returns:
            str or None: URL da usina, ou None se ocorrer erro.
        """
        # username = config('LOGIN_PV')  # Login do arquivo .env
        # password = config('PASSWORD_PV')  # Senha do arquivo .env
        # # usina_fotovoltaica_url = config('USINA_FOTOVOLTAICA_URL')
        # #login_url = "https://monitoramento.sicessolar.com.br/login"

        try:
            return config('USINA_FOTOVOLTAICA_LOGIN_URL')
            # Apenas retorna o URL para abrir em uma nova aba
            # return login_url
        except Exception as e:
            logger.error(
                f"Erro ao tentar obter a URL de Monitoramento \
                    da Usina Fotovoltaica: {e}")
            return None

        # try:
        #     session = requests.Session()
        #     response = session.post(login_url, data=payload, timeout=10)

        #     if response.status_code == 200 and response.url != login_url:
        #         return response.url  # Retorna a URL autenticada
        #     return None

        # except requests.RequestException as e:
        #     logger.error(f"Erro durante o login: {e}")
        #     return None

    def post(self, request, *args, **kwargs):
        """
        Trata requisições POST para autenticação no sistema de monitoramento.

        Espera um JSON com o campo 'action': 'monitoramento'. Retorna a URL
        autenticada se disponível.

        Args:
            request (HttpRequest): requisição POST com corpo JSON.

        Returns:
            JsonResponse: JSON com URL ou mensagem de erro.
        """
        try:
            body = json.loads(request.body)
            action = body.get('action')
            print('action:', action)
            if action != 'monitoramento':
                return JsonResponse({'error': 'Ação inválida.'}, status=400)

            authenticated_url = self.get_url()
            print('authenticated_url:', authenticated_url)
            if authenticated_url:
                return JsonResponse({'redirect_url': authenticated_url})
            return JsonResponse({
                'error': 'Erro ao realizar login no monitoramento.'
            }, status=400)

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Dados de requisição inválidos.'},
                                status=400)
        except Exception as e:
            logger.error(f"Erro inesperado: {e}")
            return JsonResponse({'error': 'Erro interno do servidor.'},
                                status=500)
