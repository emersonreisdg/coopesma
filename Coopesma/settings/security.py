# Password validation
# https://docs.djangoproject.com/en/3.2/ref/settings/#auth-password-validators

# AUTH_PASSWORD_VALIDATORS = [
#     {
#         'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',  # noqa: E501
#     },
#     {
#         'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',  # noqa: E501
#     },
#     {
#         'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',  # noqa: E501
#     },
#     {
#         'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',  # noqa: E501
#     },
# ]

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',  # noqa: E501
    },
    {
        'NAME': 'authors.validators.SenhaMinLengthValidator',
        'OPTIONS': {
            'min_length': 8,
        },
    },
    {
        'NAME': 'authors.validators.SenhaCommonPasswordValidator',
    },
    {
        'NAME': 'authors.validators.SenhaNumericValidator',
    },
]
