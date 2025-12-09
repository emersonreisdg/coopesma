from decouple import config
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
import logging
import requests

logger = logging.getLogger(__name__)


@login_required(login_url='colaborador:login', redirect_field_name='next')
def get_login_credentials(request):
    if request.method == 'GET':
        try:
            login_pv = config('LOGIN_PV')
            password_pv = config('PASSWORD_PV')
            return JsonResponse({
                'LOGIN_PV': login_pv,
                'PASSWORD_PV': password_pv
            })
        except Exception as e:
            return JsonResponse({'error':
                                 f'Erro ao obter credenciais - {e}'},
                                status=500)
    return JsonResponse({'error': 'Método não permitido'}, status=405)


@login_required(login_url='colaborador:login', redirect_field_name='next')
def check_authentication(request):
    """
    Verifica se o usuário está autenticado no sistema remoto.
    """
    print(' Verifica se o usuário está autenticado no sistema remoto.')
    try:
        monitoramento_url = config('USINA_FOTOVOLTAICA_URL')  # noqa E503
        print('monitoramento_url:', monitoramento_url)
        response = requests.get(monitoramento_url, timeout=10)
        print('response.url:', response.url)

        # Se o redirecionamento for para a página de login, \
        # o usuário não está autenticado
        if response.url == config('USINA_FOTOVOLTAICA_LOGIN_URL'):
            return JsonResponse({'is_authenticated': False})
        return JsonResponse({'is_authenticated': True})
    except requests.RequestException as e:
        return JsonResponse({'error': str(e)}, status=500)
