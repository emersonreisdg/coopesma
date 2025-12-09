from .dashboard_base import DashboardViewBase
from ....models import HistoricoOrcamentario

from django.utils.decorators import method_decorator
from django.contrib.auth.decorators import login_required


@method_decorator(
    login_required(login_url='colaborador:login', redirect_field_name='next'),
    name='dispatch'
)
class DashboardHistoricoOrcamentarioView(DashboardViewBase):
    """
    View do dashboard para exibição dos dados do histórico orçamentário.

    Esta classe herda de DashboardViewBase e utiliza o modelo
      HistoricoOrcamentario
    para apresentar informações financeiras históricas no dashboard,
      organizando os dados para visualização no front-end.

    Atributos:
        model (Model): Modelo Django associado, HistoricoOrcamentario.
    """
    model = HistoricoOrcamentario,
