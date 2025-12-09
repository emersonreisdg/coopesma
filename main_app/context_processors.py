def user_group(request):
    if request.user.is_authenticated:
        groups = request.user.groups.all()
        if groups.exists():
            # ou outra lógica para selecionar o grupo principal
            return {'group': groups.first()}
    return {}
