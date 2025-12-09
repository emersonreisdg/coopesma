# Internationalization
# https://docs.djangoproject.com/en/3.2/topics/i18n/
from . import BASE_DIR

LANGUAGE_CODE = 'pt-BR'

TIME_ZONE = 'America/Sao_Paulo'

USE_I18N = True

USE_TZ = False

LOCALE_PATHS = [
    BASE_DIR / 'locale',
]
