from .dashboard_base import DashboardViewBase
from ....models import Parametros

from django.utils.decorators import method_decorator
from django.contrib.auth.decorators import login_required


@method_decorator(
    login_required(login_url='colaborador:login', redirect_field_name='next'),
    name='dispatch'
)
class DashboardParametrosFuncionamentoView(DashboardViewBase):
    """
    View para o dashboard dos parâmetros de funcionamento.

    Esta view estende DashboardViewBase e utiliza o modelo `Parametros`
    para apresentar dados relacionados aos parâmetros de funcionamento da
      aplicação.

    Acesso restrito a usuários autenticados, através do decorador
      `login_required`.

    Atributos:
        model (Model): Modelo Django associado, neste caso `Parametros`.

    Esta classe pode ser estendida para customizar template, contexto e
    outras funcionalidades específicas do dashboard de parâmetros.
    """
    model = Parametros
