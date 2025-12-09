from .dashboard_base import DashboardViewBase


class DashboardView(DashboardViewBase):
    """
    View principal para exibição do dashboard geral da aplicação.

    Esta classe herda de `DashboardViewBase` e configura a visualização padrão
      do dashboard.
    Pode ser usada como uma tela inicial ou resumo geral dos indicadores da
      aplicação.

    Atributos:
        template_name (str): Caminho para o template HTML do dashboard
          principal.
        tipo_ambiente (str): Tipo do ambiente, utilizado para lógica de layout
          e estilização.
        estilo_ambiente (str): Caminho do arquivo CSS específico para
          estilização do dashboard.
    """

    template_name = 'coopesma/pages/dashboard.html'
    tipo_ambiente = 'dashboard'
    estilo_ambiente = 'dashboards/dashboard.css'
