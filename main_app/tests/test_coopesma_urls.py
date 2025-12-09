from django.test import TestCase
from django.urls import reverse
# from unittest import skip


class CoopesmaURLsTest(TestCase):
    def test_coopesma_home_url_is_correct(self):
        url = reverse('coopesma:home')
        self.assertEqual(url, '/')

    def test_coopesma_manager_url_is_correct(self):
        url = reverse('coopesma:gestao')
        self.assertEqual(url, '/gestao')

    def test_coopesma_cash_flow_url_is_correct(self):
        url = reverse('coopesma:fluxo-de-caixa')
        self.assertEqual(url, '/fluxo-de-caixa')

    def test_coopesma_membership_payment_url_is_correct(self):
        url = reverse('coopesma:controle-de-rateio')
        self.assertEqual(url, '/controle-de-rateio')

    def test_coopesma_enrollment_url_is_correct(self):
        url = reverse('coopesma:controle-de-matricula')
        self.assertEqual(url, '/controle-de-matricula')

    def test_coopesma_purchases_services_url_is_correct(self):
        url = reverse('coopesma:compras-e-servicos')
        self.assertEqual(url, '/compras-e-servicos')

    def test_coopesma_dashboards_url_is_correct(self):
        url = reverse('coopesma:relatorios')
        self.assertEqual(url, '/relatorios')

    def test_coopesma_relatorio_url_is_correct(self):
        url = reverse('coopesma:relatorio', kwargs={'id': 1})
        self.assertEqual(url, '/relatorio/1/')
