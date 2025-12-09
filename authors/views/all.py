from django.urls import reverse_lazy
from django.urls import reverse
from authors.forms import RegisterForm, LoginForm
from django.contrib import messages
from django.shortcuts import redirect, render
from django.http import Http404
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import SetPasswordForm
from django.contrib.auth.views import PasswordChangeView
from django.contrib.auth import update_session_auth_hash
from django.utils.translation import gettext as _
# from django.utils.translation import gettext_lazy as _
# from main_app.__models import Setup


class ForcePasswordChangeView(PasswordChangeView):
    """
    View baseada em classe que força a troca de senha ao detectar
    que o usuário está usando a senha padrão.
    """
    template_name = 'authors/pages/force_password_change.html'
    success_url = reverse_lazy('colaborador:login')
    title = _('Alterar senha obrigatória')


class CustomSetPasswordForm(SetPasswordForm):
    """
    Formulário personalizado para redefinição de senha,
    com mensagens e labels customizados.
    """

    def __init__(self, *args, **kwargs):
        """
        Inicializa o formulário com mensagens customizadas.
        """
        super().__init__(*args, **kwargs)
        self.error_messages_custom()

        # Substitui os labels
        self.fields['new_password1'].label = 'Nova senha'
        self.fields['new_password2'].label = 'Confirme a nova senha'

        # Substitui os help_texts e mensagens padrão
        self.fields['new_password1'].help_text = _(
            "A senha deve ter pelo menos 8 caracteres, incluindo letra maiúscula, minúscula, número e caractere especial."  # noqa E501
        )

    def error_messages_custom(self):
        """
        Atualiza mensagens de erro padrão do formulário.
        """
        # Substituir mensagens padrão
        # (opcional, depende das regras de validação)
        self.error_messages.update({
            'password_mismatch': _('As senhas digitadas não coincidem.'),
        })


def register_view(request):
    """
    Renderiza a página de cadastro de usuários.

    Args:
        request (HttpRequest): Requisição HTTP.

    Returns:
        HttpResponse: Página de cadastro com o formulário.
    """
    register_form_data = request.session.get('register_form_data', None)
    form = RegisterForm(register_form_data)
    return render(request, 'authors/pages/register_view.html', {
        'form': form,
        'form_action': reverse('colaborador:register_create'),
    }
    )


def register_create(request):
    """
    Cria um novo usuário com os dados do formulário de registro.

    Returns:
        HttpResponseRedirect: Redireciona para login em caso de sucesso.
    """
    if not request.POST:
        raise Http404()

    # POST = request.POST

    request.session['register_form_data'] = request.POST
    form = RegisterForm(request.POST)

    if form.is_valid():
        user = form.save(commit=False)
        user.set_password(user.password)
        user.save()
        messages.success(request, _('Usuário criado com sucesso. Faça login.'))

        del (request.session['register_form_data'])
        return redirect(reverse('colaborador:login'))

    return redirect('colaborador:register')


def login_view(request):
    """
    Renderiza a página de login.

    Returns:
        HttpResponse: Página com formulário de login.
    """
    form = LoginForm()
    user = request.user
    group = user.groups.first()
    return render(request, 'authors/pages/login.html', {
        'form': form,
        'form_action': reverse('colaborador:login_create'),
        'group': group,
    })


def login_create(request):
    """
    Realiza autenticação do usuário.

    Retorna erro se as credenciais forem inválidas ou se
    o formulário for submetido incorretamente.

    Returns:
        HttpResponseRedirect: Redireciona para dashboard ou alteração de senha.
    """
    if not request.POST:
        raise Http404()

    form = LoginForm(request.POST)

    if form.is_valid():
        username = form.cleaned_data.get('username', '')
        password = form.cleaned_data.get('password', '')

        authenticated_user = authenticate(
            username=username,
            password=password,
        )

        if authenticated_user is not None:
            login(request, authenticated_user)

            # Verifica se a senha inserida é a padrão Acesso-1-Coop
            if password == 'Acesso-1-Coop##':
                # Armazena flag na sessão para redirecionar depois
                request.session['must_change_password'] = True
                return redirect(reverse('colaborador:force_password_change'))

            messages.success(request, _('You are logged in.'))
            return redirect(reverse('coopesma:gestao'))

        else:
            messages.error(request, _('Invalid credentials'))
    else:
        messages.error(request, _('Invalid username or password'))

    return redirect(reverse('colaborador:login'))


@login_required(login_url='colaborador:login')
def force_password_change_view(request):
    """
    View que força o usuário a trocar a senha padrão ao fazer login.

    Args:
        request (HttpRequest): Requisição HTTP.

    Returns:
        HttpResponse: Página de troca de senha ou redirecionamento.
    """
    if not request.session.get('must_change_password', False):
        return redirect(reverse('coopesma:gestao'))

    if request.method == 'POST':
        form = CustomSetPasswordForm(user=request.user, data=request.POST)
        if form.is_valid():
            user = form.save()
            update_session_auth_hash(request, user)  # Evita logout
            del request.session['must_change_password']
            messages.success(request, _('Password changed successfully.'))
            return redirect(reverse('coopesma:gestao'))
        else:
            messages.error(request, _('Please correct the error below.'))
    else:
        form = CustomSetPasswordForm(user=request.user)

    return render(request, 'authors/pages/force_password_change.html', {
        'form': form,
        'form_action': reverse('colaborador:force_password_change'),
        'info_message': _('Você está usando a senha padrão. Por segurança, altere sua senha antes de continuar.'),  # noqa E501
    })


@login_required(login_url='colaborador:login', redirect_field_name='next')
def logout_view(request):
    """
    Encerra a sessão do usuário autenticado.

    Valida se a requisição foi feita via POST e pelo usuário correto.

    Returns:
        HttpResponseRedirect: Redireciona para login após logout.
    """
    if not request.POST:
        messages.error(request, _('Invalid logout request'))
        return redirect(reverse('colaborador:login'))

    if request.POST.get('username') != request.user.username:
        messages.error(request, _('Invalid logout user'))
        return redirect(reverse('colaborador:login'))

    messages.success(request, _('Logged out successfully'))
    logout(request)
    return redirect(reverse('colaborador:login'))


@login_required(login_url='colaborador:login', redirect_field_name='next')
def logout_and_redirect_to_login(request):
    """
    Encerra a sessão do usuário e redireciona para a tela de login.

    Returns:
        HttpResponseRedirect: Redireciona para a página de login.
    """
    logout(request)
    return redirect(reverse('colaborador:login'))


# @login_required(login_url='authors:login', redirect_field_name='next')
# def dashboard(request):
#     setups = Setup.objects.filter(
#         year=2018,
#         # is_published=False,
#         # author=request.user
#     )
#     return render(
#         request,
#         'authors/pages/dashboard.html',
#         context={
#             'setups': setups,
#         }
#     )
