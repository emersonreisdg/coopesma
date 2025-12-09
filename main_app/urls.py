# flake8: noqa
from django.urls import path

# from . import views

from .views.site.dashboards.home import HomeView
from .views.site.dashboards.manager import ManagerView
from .views.site.dashboards.dashboard import DashboardView
from .views.site.dashboards.despesas_administrativas import DashboardDespesaAdmnistrativaView
from .views.site.dashboards.aplicacoes import DashboardAplicacoesView
from .views.site.dashboards.cargos_salarios import DashboardCargosSalariosView
from .views.site.dashboards.controle_cooperados import DashboardControleCooperadosView
from .views.site.dashboards.planos_descontos import DashboardPlanosDescontosView
from .views.site.dashboards.fluxo_caixa import DashboardFluxoCaixaView
from .views.site.dashboards.receitas_despesas import DashboardReceitasDespesasView
from .views.site.dashboards.execucao_orcamentaria import DashboardExecucaoOrcamentariaView
from .views.site.dashboards.indicadores_financeiros import DashboardIndicadoresFinanceirosView
from .views.site.dashboards.historico_matriculas import DashboardHistoricoMatriculasView
from .views.site.dashboards.inadimplencia import DashboardHistoricoInadimplenciaView
# from .views.site.dashboards.inadimplencia import DashboarIndicacaoView
from .views.site.dashboards.reajustes import DashboardReajustesView
from .views.site.dashboards.ifes import DashboardIfesView
from .views.site.dashboards.detalhes_matriculas import DashboardDetalhesMatriculasView
from .views.site.dashboards.resultado_matriculas import DashboardResultadoMatriculasView
from .views.site.dashboards.parametros_funcionamento import DashboardParametrosFuncionamentoView
from .views.site.dashboards.previsao_orcamentaria import DashboardPrevisaoOrcamentariaView
from .views.site.dashboards.previsao_orcamentaria_dre import DashboardPrevisaoOrcamentariaDreView
from .views.site.dashboards.fates import DashboardFatesView
from .views.site.dashboards.projecao_fates import DashboardProjecaoFATESView

from .views.site.forms.form import FormView
from .views.site.forms.aplicacoes import FormAplicacoesView, FormAplicacoesListView, FormAplicacoesEditView, FormAplicacoesDeleteView, salvar_aplicacao_na_sessao
from .views.site.forms.controle_cooperados import FormControleCooperadosView, FormControleCooperadosListView, FormControleCooperadosEditView, FormControleCooperadosDeleteView, salvar_controle_cooperados_na_sessao
from .views.site.forms.fluxo_caixa import FormFluxoCaixaView, FormFluxoCaixaListView, FormFluxoCaixaEditView, FormFluxoCaixaDeleteView, salvar_fluxo_caixa_na_sessao
from .views.site.forms.indicacao import FormIndicacaoView, FormIndicacaoListView, FormIndicacaoEditView, FormIndicacaoDeleteView, salvar_indicacao_na_sessao
from .views.site.forms.previsao_orcamentaria import FormPrevisaoOrcamentariaView, FormPrevisaoOrcamentariaListView, FormPrevisaoOrcamentariaEditView, FormPrevisaoOrcamentariaDeleteView, salvar_previsao_orcamentaria_na_sessao

from .views.site.forms.resultado_matriculas import FormResultadoMatriculasView
from .views.site.forms.fluxo_caixa_upload import ExcelUploadView, CompleteFluxoFormView, salvar_fluxo_caixa_na_sessao
# from .views.site.forms.controle_cooperados import register_view

from .views.site.orcamento.orcamento import OrcamentoView

from .views.site.usina.usina_fotovoltaica import UsinaFotovoltaicaView, UsinaFotovoltaicaMonitoramentoView
from django.conf import settings
from .views.site.usina.api.usina_fotovoltaica import get_login_credentials, check_authentication
from .views.site.usina.auto_login import selenium_login

app_name = 'coopesma'

urlpatterns = [
    path('', HomeView.as_view(), name="home"),
    path('gestao', ManagerView.as_view(), name="gestao"),
    path('relatorios', DashboardView.as_view(), name="relatorios"),
    path(
        'relatorio/aplicacoes/',
        DashboardAplicacoesView.as_view(),
        name="aplicacoes",
    ),
    path(
        'relatorio/cargos_salarios/',
        DashboardCargosSalariosView.as_view(),
        name="cargos_salarios",
    ),
    path(
        'relatorio/controle_cooperados/',
        DashboardControleCooperadosView.as_view(),
        name="controle_cooperados",
    ),
    path(
        'relatorio/planos_descontos/',
        DashboardPlanosDescontosView.as_view(),
        name="planos_descontos",
    ),
    path(
        'relatorio/despesas_administrativas/',
        DashboardDespesaAdmnistrativaView.as_view(),
        name="despesas_administrativas",
    ),
    path(
        'relatorio/fluxo_caixa/',
        DashboardFluxoCaixaView.as_view(),
        name="fluxo_caixa",
    ),
    path(
        'relatorio/execucao_orcamentaria/',
        DashboardExecucaoOrcamentariaView.as_view(),
        name="orcamento",
    ),
    path(
        'relatorio/receitas_despesas/',
        DashboardReceitasDespesasView.as_view(),
        name="receitas_despesas",
    ),
    path(
        'relatorio/indicadores_financeiros/',
        DashboardIndicadoresFinanceirosView.as_view(),
        name="indicadores_financeiros",
    ),
    path(
        'relatorio/historico_matriculas/',
        DashboardHistoricoMatriculasView.as_view(),
        name="historico_matriculas",
    ),
    path(
        'relatorio/inadimplencia/',
        DashboardHistoricoInadimplenciaView.as_view(),
        name="inadimplencia",
    ),
    # path(
    #     'relatorio/indicacao/',
    #     DashboarIndicacaoView.as_view(),
    #     name="inadimplencia",
    # ),
    path(
        'relatorio/reajustes/',
        DashboardReajustesView.as_view(),
        name="reajustes",
    ),
    path(
        'relatorio/ifes/',
        DashboardIfesView.as_view(),
        name="ifes",
    ),
    path(
        'relatorio/detalhes_matriculas/',
        DashboardDetalhesMatriculasView.as_view(),
        name="detalhes_matriculas",
    ),
    path(
        'relatorio/resultado_matriculas/',
        DashboardResultadoMatriculasView.as_view(),
        name="resultado_matriculas",
    ),
    path(
        'relatorio/parametros_funcionamento/',
        DashboardParametrosFuncionamentoView.as_view(),
        name="parametros_funcionamento",
    ),
    path(
        'relatorio/previsao_orcamentaria/',
        DashboardPrevisaoOrcamentariaView.as_view(),
        name="previsao_orcamentaria",
    ),
    path(
        'relatorio/previsao_orcamentaria/formato_dre/',
        DashboardPrevisaoOrcamentariaDreView.as_view(),
        name="previsao_orcamentaria_dre",
    ),
    path(
        'relatorio/fates/',
        DashboardFatesView.as_view(),
        name="fates",
    ),
    path(
        'relatorio/fates/projecao',
        DashboardProjecaoFATESView.as_view(),
        name="fates_projecao",
    ),
    # AJUSTAR QUANDO ESTIVER DESENVOLVENDO AS VIEWS DE FORMULÁRIOS
    # path('formularios', ManagerView.as_view(), name="formularios"),
    path('formularios/', FormView.as_view(), name="formularios"),
    path(
        'formulario/aplicacoes/',
        FormAplicacoesView.as_view(),
        name="aplicacoes",
    ),
    path('formulario/aplicacoes/confirmar/',
         FormAplicacoesListView.as_view(),
         name='aplicacoes_list'
         ),
    path('formulario/aplicacoes/salvar_sessao/',
         salvar_aplicacao_na_sessao,
         name='aplicacoes_salvar_sessao'
         ),
    path('formulario/aplicacoes/editar/',
         FormAplicacoesEditView.as_view(),
         name='aplicacoes_editar'
         ),

    path('formulario/aplicacoes/<int:pk>/excluir/',
         FormAplicacoesDeleteView.as_view(),
         name='aplicacoes_delete'
         ),
    path(
        'formulario/controle/cooperados/',
        FormControleCooperadosView.as_view(),
        name="controle_cooperados",
    ),
    path('formulario/controle/cooperados/confirmar/',
         FormControleCooperadosListView.as_view(),
         name='controle_cooperados_list'
         ),
    path('formulario/controle/cooperados/salvar_sessao/',
         salvar_controle_cooperados_na_sessao,
         name='controle_cooperados_salvar_sessao'
         ),
    path('formulario/controle/cooperados/editar/',
         FormControleCooperadosEditView.as_view(),
         name='controle_cooperados_editar'
         ),
    # path(
    #     'formulario/fluxo_caixa/',
    #     FormFluxoCaixaView.as_view(),
    #     name="fluxo_caixa",
    # ),
    path(
        'formulario/fluxo_caixa/',
        ExcelUploadView.as_view(),
        name="fluxo_caixa",
    ),
    path(
        'formulario/fluxo_caixa/enquadramento/',
        CompleteFluxoFormView.as_view(),
        name="fluxo_caixa_enquadramentos",
    ),
    path('formulario/fluxo_caixa/salvar_sessao/',
         salvar_fluxo_caixa_na_sessao,
         name='fluxo_caixa_salvar_sessao'
         ),
    path('formulario/fluxo_caixa/editar/',
         FormFluxoCaixaEditView.as_view(),
         name='fluxo_caixa_editar'
         ),
    path('formulario/fluxo_caixa/confirmar/',
         FormFluxoCaixaListView.as_view(),
         name='fluxo_caixa_confirmar'
         ),

    path('formulario/fluxo_caixa/<int:pk>/excluir/',
         FormFluxoCaixaDeleteView.as_view(),
         name='fluxo_caixa_delete'
         ),
    path(
        'formulario/indicacao/',
        FormIndicacaoView.as_view(),
        name="indicacao",
    ),
    path('formulario/indicacao/confirmar/',
         FormIndicacaoListView.as_view(),
         name='indicacao_list'
         ),
    path('formulario/indicacao/salvar_sessao/',
         salvar_indicacao_na_sessao,
         name='indicacao_salvar_sessao'
         ),
    path('formulario/indicacao/editar/',
         FormIndicacaoEditView.as_view(),
         name='indicacao_editar'
         ),

    path('formulario/indicacao/<int:pk>/excluir/',
         FormIndicacaoDeleteView.as_view(),
         name='indicacao_delete'
         ),
    path(
        'formulario/previsao_orcamentaria/',
        FormPrevisaoOrcamentariaView.as_view(),
        name="previsao_orcamentaria",
    ),
    path('formulario/previsao_orcamentaria/confirmar/',
         FormPrevisaoOrcamentariaListView.as_view(),
         name='previsao_orcamentaria_list'
         ),
    path('formulario/previsao_orcamentaria/salvar_sessao/',
         salvar_indicacao_na_sessao,
         name='previsao_orcamentaria_salvar_sessao'
         ),
    path('formulario/previsao_orcamentaria/editar/',
         FormPrevisaoOrcamentariaEditView.as_view(),
         name='previsao_orcamentaria_editar'
         ),

    path('formulario/previsao_orcamentaria/<int:pk>/excluir/',
         FormPrevisaoOrcamentariaDeleteView.as_view(),
         name='previsao_orcamentaria_delete'
         ),
    path(
        'formulario/resultado_matriculas/',
        FormResultadoMatriculasView.as_view(),
        name="resultado_matriculas",
    ),

    path('orcamento', OrcamentoView.as_view(), name="orcamento"),


    # AJUSTAR QUANDO ESTIVER DESENVOLVENDO AS VIEWS DE PESQUISAS
    path('usina_fotovoltaica/', UsinaFotovoltaicaView.as_view(),
         name="usina_fotovoltaica"),

    path('usina_fotovoltaica/monitoramento/',
         UsinaFotovoltaicaMonitoramentoView.as_view(),
         name='monitoramento'),

    path('api/get-login-credentials/',
         get_login_credentials,
         name='get_login_credentials'),

    path('api/check-authentication/',
         check_authentication,
         name='check_authentication'),

    path('selenium-login/',
         selenium_login,
         name='selenium_login'),
]
