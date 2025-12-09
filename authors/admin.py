from django.contrib import admin

from authors.models import Profile


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    """
    Configuração de exibição do modelo Profile no Django Admin.
    """
    ...
