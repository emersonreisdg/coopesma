import os
from pathlib import Path

from utils.environment import get_env_variable, parse_comma_sep_str_to_list
from dotenv import load_dotenv

load_dotenv()  # Carrega as variáveis do .env automaticamente

BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/3.2/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get('SECRET_KEY', 'INSECURE')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True if os.environ.get('DEBUG') == '1' else False

ALLOWED_HOSTS: list[str] = parse_comma_sep_str_to_list(
    get_env_variable('ALLOWED_HOST')
)

# ALLOWED_HOSTS: list[str] = ['gestao.coopesma.com.br']

CSRF_TRUSTED_ORIGINS: list[str] = parse_comma_sep_str_to_list(
    get_env_variable('CSRF_TRUSTED_ORIGINS')
)

ROOT_URLCONF = 'Coopesma.urls'

WSGI_APPLICATION = 'Coopesma.wsgi.application'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Configuração dinâmica do backend de e-mail
EMAIL_BACKEND_TYPE = get_env_variable('EMAIL_BACKEND_TYPE', default='console')
EMAIL_BACKEND = get_env_variable('EMAIL_BACKEND', default='console')
print("EMAIL_BACKEND_TYPE =", EMAIL_BACKEND_TYPE)
print("EMAIL_BACKEND =", EMAIL_BACKEND)


if EMAIL_BACKEND_TYPE == 'smtp':
    EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
    EMAIL_HOST = get_env_variable('EMAIL_HOST', default='smtp.gmail.com')
    EMAIL_PORT = int(get_env_variable('EMAIL_PORT', default='587'))
    EMAIL_USE_TLS = get_env_variable('EMAIL_USE_TLS', default='True') == 'True'
    EMAIL_HOST_USER = get_env_variable('EMAIL_HOST_USER')
    EMAIL_HOST_PASSWORD = get_env_variable('EMAIL_HOST_PASSWORD')
else:
    EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
