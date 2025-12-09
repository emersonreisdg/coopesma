from .dashboard_base import DashboardViewBase
from ....models import FluxosDeCaixa

from django.utils.decorators import method_decorator
from django.contrib.auth.decorators import login_required


@method_decorator(
    login_required(login_url='colaborador:login', redirect_field_name='next'),
    name='dispatch'
)
class DashboardFluxoCaixaView(DashboardViewBase):
    """
    View de dashboard responsável por exibir os dados do modelo FluxosDeCaixa.

    Esta classe herda da `DashboardViewBase` e configura os parâmetros básicos
      para visualização
    do fluxo de caixa na aplicação, garantindo que o acesso seja restrito a
      usuários autenticados.

    Atributos:
        model (Model): Modelo Django `FluxosDeCaixa`, que armazena os dados a
          serem exibidos no dashboard.
    """

    model = FluxosDeCaixa
