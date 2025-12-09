from .dashboard_base import DashboardViewBase
from ....models import CargosESalarios
from django.utils.decorators import method_decorator
from django.contrib.auth.decorators import login_required


@method_decorator(
    login_required(login_url='colaborador:login', redirect_field_name='next'),
    name='dispatch'
)
class DashboardCargosSalariosView(DashboardViewBase):
    """
    View responsável por renderizar o dashboard de cargos e salários.

    Esta view utiliza a infraestrutura da classe base `DashboardViewBase` para
    carregar e exibir os dados do modelo `CargosESalarios` no contexto de um
      dashboard.

    A view está protegida por autenticação, exigindo que o usuário esteja
      logado
    para ter acesso à visualização dos dados.

    Atributos:
        model (Model): Modelo Django que representa os dados de cargos e
         salários.
    """

    model = CargosESalarios
