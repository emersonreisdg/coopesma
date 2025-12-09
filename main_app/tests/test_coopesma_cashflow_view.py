from django.urls import reverse, resolve
from main_app import views
from .test_coopesma_base import CoopesmaTestBase


class CoopesmaCashflowViewTest(CoopesmaTestBase):
    def test_coopesma_cash_flow_view_function_is_correct(self):
        view = resolve(
            reverse('coopesma:fluxo-de-caixa')
        )
        self.assertIs(view.func, views.cash_flow)

    def test_coopesma_cash_flow_view_returns_status_code_200_OK(self):
        response = self.client.get(
            reverse('coopesma:fluxo-de-caixa')
        )
        self.assertEqual(response.status_code, 200)

    def test_coopesma_cash_flow_view_loads_correct_templates(self):
        response = self.client.get(
            reverse('coopesma:fluxo-de-caixa')
        )
        self.assertTemplateUsed(response, 'coopesma/pages/cash_flow.html')
