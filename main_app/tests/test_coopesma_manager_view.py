from django.urls import reverse, resolve
from main_app import views
from .test_coopesma_base import CoopesmaTestBase


class CoopesmaManagerViewTest(CoopesmaTestBase):
    def test_coopesma_manager_view_function_is_correct(self):
        view = resolve(
            reverse('coopesma:gestao')
        )
        self.assertIs(view.func, views.manager)

    def test_coopesma_manager_view_returns_status_code_200_OK(self):
        response = self.client.get(
            reverse('coopesma:gestao')
        )
        self.assertEqual(response.status_code, 200)

    def test_coopesma_manager_view_loads_correct_templates(self):
        response = self.client.get(
            reverse('coopesma:gestao')
        )
        self.assertTemplateUsed(response, 'coopesma/pages/manager.html')
