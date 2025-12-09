from django.urls import reverse, resolve
from main_app import views
from .test_coopesma_base import CoopesmaTestBase


class CoopesmaEnrollmentViewTest(CoopesmaTestBase):
    def test_coopesma_enrollment_view_function_is_correct(self):
        view = resolve(
            reverse('coopesma:controle-de-matricula')
        )
        self.assertIs(view.func, views.enrollment)

    def test_coopesma_enrollment_view_returns_status_code_200_OK(self):
        response = self.client.get(
            reverse('coopesma:controle-de-matricula')
        )
        self.assertEqual(response.status_code, 200)

    def test_coopesma_enrollment_view_loads_correct_templates(self):
        response = self.client.get(
            reverse('coopesma:controle-de-matricula')
        )
        self.assertTemplateUsed(response, 'coopesma/pages/enrollment.html')
