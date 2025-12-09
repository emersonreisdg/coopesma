from .dashboard_base import DashboardViewBase
from ....models import HistoricoDeReajustes

from django.utils.decorators import method_decorator
from django.contrib.auth.decorators import login_required


@method_decorator(
    login_required(login_url='colaborador:login', redirect_field_name='next'),
    name='dispatch'
)
class DashboardReajustesView(DashboardViewBase):
    """
    View para exibir o dashboard do Histórico de Reajustes.

    Esta view utiliza o modelo HistoricoDeReajustes para fornecer
    dados de reajustes históricos em um dashboard.

    O acesso é restrito a usuários autenticados.

    Atributos:
        model (Model): Modelo HistoricoDeReajustes utilizado para consultas.

    Herda de:
        DashboardViewBase: view base com funcionalidades comuns para
          dashboards.

    Métodos:
        (herda métodos padrão de DashboardViewBase, podendo ser
        sobrescritos conforme necessidade)
    """
    model = HistoricoDeReajustes
