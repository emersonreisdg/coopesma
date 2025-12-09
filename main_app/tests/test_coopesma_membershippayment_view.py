from django.urls import reverse, resolve
from main_app import views
from .test_coopesma_base import CoopesmaTestBase


class CoopesmaMembershipPaymentViewTest(CoopesmaTestBase):
    def test_coopesma_membership_payment_view_function_is_correct(self):
        view = resolve(
            reverse('coopesma:controle-de-rateio')
        )
        self.assertIs(view.func, views.membership_payment)

    def test_coopesma_membership_payment_view_returns_status_code_200_OK(self):  # noqa:E501
        response = self.client.get(
            reverse('coopesma:controle-de-rateio')
        )
        self.assertEqual(response.status_code, 200)

    def test_coopesma_membership_payment_view_loads_correct_templates(self):
        response = self.client.get(
            reverse('coopesma:controle-de-rateio')
        )
        self.assertTemplateUsed(
            response, 'coopesma/pages/membership_payment.html')
