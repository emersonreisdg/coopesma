from django.urls import path, reverse_lazy
from django.contrib.auth import views as auth_views
from . import views
from .views.all import CustomSetPasswordForm
from .views.all import force_password_change_view


app_name = 'colaborador'

urlpatterns = [
    path('register/', views.register_view, name='register'),
    path('register/create/', views.register_create, name='register_create'),
    path('login/', views.login_view, name='login'),
    path('login/create/', views.login_create, name='login_create'),
    path('logout/', views.logout_view, name='logout'),
    path(
        'password-reset/',
        auth_views.PasswordResetView.as_view(
            template_name='authors/pages/password_reset.html',
            email_template_name='authors/pages/password_reset_email.html',
            subject_template_name='authors/pages/password_reset_subject.txt',
            success_url=reverse_lazy('colaborador:password_reset_done'),
        ),
        name='password_reset'
    ),
    path(
        'password-reset-done/',
        auth_views.PasswordResetDoneView.as_view(
            template_name='authors/pages/password_reset_done.html'
        ),
        name='password_reset_done'
    ),
    path(
        'reset/<uidb64>/<token>/',
        auth_views.PasswordResetConfirmView.as_view(
            template_name='authors/pages/password_reset_confirm.html',
            success_url=reverse_lazy('colaborador:password_reset_complete'),
            form_class=CustomSetPasswordForm,
        ),
        name='password_reset_confirm'
    ),
    path(
        'reset/done/',
        auth_views.PasswordResetCompleteView.as_view(
            template_name='authors/pages/password_reset_complete.html'
        ),
        name='password_reset_complete'
    ),
    path(
        'force-password-change/',
        force_password_change_view,
        name='force_password_change'
    ),
    path(
        'logout-redirect/',
        views.logout_and_redirect_to_login,
        name='logout_redirect'
    ),
    path(
        'profile/<int:id>/',
        views.ProfileView.as_view(),
        name='profile'
    ),
]
