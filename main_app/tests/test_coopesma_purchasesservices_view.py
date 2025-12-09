from django.urls import reverse, resolve
from main_app import views
from .test_coopesma_base import CoopesmaTestBase


class CoopesmaPurchasesServicesViewTest(CoopesmaTestBase):
    def test_coopesma_purchases_services_view_function_is_correct(self):
        view = resolve(
            reverse('coopesma:compras-e-servicos')
        )
        self.assertIs(view.func, views.purchases_services)

    def test_coopesma_purchases_services_view_returns_status_code_200_OK(self):
        response = self.client.get(
            reverse('coopesma:compras-e-servicos')
        )
        self.assertEqual(response.status_code, 200)

    def test_coopesma_purchases_services_view_loads_correct_templates(self):
        response = self.client.get(
            reverse('coopesma:compras-e-servicos')
        )
        self.assertTemplateUsed(
            response, 'coopesma/pages/purchases_services.html')
