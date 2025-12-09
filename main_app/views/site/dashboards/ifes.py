from .dashboard_base import DashboardViewBase
from ....models import Matriculas

from django.utils.decorators import method_decorator
from django.contrib.auth.decorators import login_required


@method_decorator(
    login_required(login_url='colaborador:login', redirect_field_name='next'),
    name='dispatch'
)
class DashboardIfesView(DashboardViewBase):
    """
    View baseada em DashboardViewBase para exibir dados relacionados às
     matrículas da IFES.

    Esta view utiliza o modelo Matriculas para obter os dados necessários para
      o dashboard.
    O acesso é restrito a usuários autenticados, redirecionando para a página
      de login caso o usuário não esteja autenticado.

    Atributos herdados:
        model: o modelo Matriculas utilizado para consultas.
        métodos e propriedades da DashboardViewBase para renderização e
          contexto.
    """

    model = Matriculas
