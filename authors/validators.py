from django.core.exceptions import ValidationError
from django.utils.translation import gettext as _
from django.contrib.auth.password_validation import (
    MinimumLengthValidator,
    CommonPasswordValidator,
    NumericPasswordValidator,
)


class SenhaMinLengthValidator(MinimumLengthValidator):
    def get_help_text(self):
        return _("A senha deve conter pelo menos %(min_length)d caracteres.") % {'min_length': self.min_length}  # noqa E501

    def validate(self, password, user=None):
        if len(password) < self.min_length:
            raise ValidationError(
                _("Esta senha é muito curta. Ela deve conter pelo menos %(min_length)d caracteres."),  # noqa E501
                code='password_too_short',
                params={'min_length': self.min_length},
            )


class SenhaCommonPasswordValidator(CommonPasswordValidator):
    def get_help_text(self):
        return _("A senha não deve ser muito comum.")

    def validate(self, password, user=None):
        if password.lower().strip() in self.passwords:
            raise ValidationError(
                _("Esta senha é muito comum."),
                code='password_too_common',
            )


class SenhaNumericValidator(NumericPasswordValidator):
    def get_help_text(self):
        return _("A senha não pode conter apenas números.")

    def validate(self, password, user=None):
        if password.isdigit():
            raise ValidationError(
                _("Esta senha é inteiramente numérica."),
                code='password_entirely_numeric',
            )
