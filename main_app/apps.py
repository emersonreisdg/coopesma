from django.apps import AppConfig


class MainAppConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'main_app'

    def ready(self, *args, **kwargs) -> None:
        import main_app.signals  # noqa
        super_ready = super().ready(*args, **kwargs)
        return super_ready
