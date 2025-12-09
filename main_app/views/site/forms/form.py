from django import forms
from .form_base import FormViewBase
from django.utils.decorators import method_decorator
from django.contrib.auth.decorators import login_required


class MeuFormulario(forms.Form):
    """
    Formulário de exemplo criado com base em Django Forms.
    Este formulário pode ser estendido com campos específicos conforme
    a necessidade do sistema.
    """
    ...


@method_decorator(
    login_required(login_url='colaborador:login', redirect_field_name='next'),
    name='dispatch'
)
class FormView(FormViewBase):
    """
    View baseada em formulário protegida por autenticação.

    Esta classe herda de FormViewBase e define a estrutura necessária
    para renderização de um formulário genérico com um template padrão.

    Atributos:
        template_name (str): Caminho do template HTML usado pela view.
        tipo_ambiente (str): Tipo de ambiente, geralmente 'form'.
        estilo_ambiente (str): Caminho do CSS aplicado ao formulário.
        form_class (Form): Classe de formulário Django a ser renderizada.
    """
    template_name = 'coopesma/pages/form.html'
    tipo_ambiente = 'form'
    estilo_ambiente = 'forms/form.css'
    form_class = MeuFormulario
