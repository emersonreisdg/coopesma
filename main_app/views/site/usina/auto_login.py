from datetime import time
from selenium import webdriver
from selenium.webdriver.common.by import By
# from selenium.webdriver.chrome.service import Service as ChromeService
# from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from django.http import JsonResponse
from decouple import config
from django.contrib.auth.decorators import login_required


@login_required
def selenium_login(request):
    login_url = 'https://monitoramento.sicessolar.com.br/login'
    monitoramento_url = 'https://monitoramento.sicessolar.com.br/monitoramento'

    # Verificar se o usuário está autenticado no Django
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Unauthorized'}, status=401)

    login_pv = config('LOGIN_PV')
    password_pv = config('PASSWORD_PV')

    options = webdriver.ChromeOptions()
    # Certifique-se de que o modo headless está desativado
    # options.add_argument('--no-sandbox')
    # options.add_argument('--disable-dev-shm-usage')
    options.add_argument('--start-maximized')
    # O seguinte comando é opcional, mas garante que a\
    #  interface gráfica seja exibida
    options.add_argument('--start-maximized')
    service = Service(ChromeDriverManager().install())

    driver = webdriver.Chrome(service=service, options=options)

    try:
        print("Abrindo URL de login...")
        # Acessar a página de login
        driver.get(login_url)

        print("Página atual:", driver.current_url)
        print("Título da página:", driver.title)

        print("Buscando elementos da página...")
        # Encontrar os campos de entrada e botão de login
        login_field = driver.find_element(By.NAME, 'iptEmail')
        password_field = driver.find_element(By.NAME, 'iptSenha')
        login_button = driver.find_element(By.CLASS_NAME, 'btnLogin')

        print('login_field:', login_field)
        print('password_field:', password_field)
        print('login_button:', login_button)

        print("Inserindo credenciais...")
        # Preencher os dados de login
        login_field.send_keys(login_pv)
        password_field.send_keys(password_pv)
        login_button.click()

        # Aguarde o redirecionamento ou valide se o login foi bem-sucedido
        # Aguarda até 10 segundos para o carregamento da página
        driver.implicitly_wait(20)
        if monitoramento_url in driver.current_url:
            return JsonResponse({'redirect_url': monitoramento_url})

        return JsonResponse({'error': 'Login falhou'}, status=401)
    except Exception as e:
        print("Erro ao inicializar o navegador:", e)
        return JsonResponse({'error': str(e)}, status=500)
    finally:
        time.sleep(20)
        driver.quit()
