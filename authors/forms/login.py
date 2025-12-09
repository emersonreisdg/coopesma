from django import forms
from utils.django_forms import add_placeholder
from django.utils.translation import gettext_lazy as _


class LoginForm(forms.Form):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        add_placeholder(self.fields['username'], _('Digite seu usuário'))
        add_placeholder(self.fields['password'], _('Digite sua senha'))

    username = forms.CharField(label=_("Usuário"))
    password = forms.CharField(
        widget=forms.PasswordInput(),
        label=_("Senha")
    )
