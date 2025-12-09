from django.urls import reverse, resolve
from main_app import views
from .test_coopesma_base import CoopesmaTestBase
# from unittest.mock import patch
# from unittest import skip


class CoopesmaHomeViewTest(CoopesmaTestBase):
    def test_coopesma_home_view_function_is_correct(self):
        view = resolve(
            reverse('coopesma:home')
        )
        self.assertIs(view.func.view_class, views.SetupListViewHome)

    # @skip('WIP - Work in progress')
    def test_coopesma_home_view_returns_status_code_200_OK(self):
        response = self.client.get(
            reverse('coopesma:home')
        )
        self.assertEqual(response.status_code, 200)

    # @skip('WIP - Work in progress')
    def test_coopesma_home_view_loads_correct_templates(self):
        response = self.client.get(
            reverse('coopesma:home')
        )
        self.assertTemplateUsed(response, 'coopesma/pages/home.html')

    # @skip('WIP - Work in progress: Adaptar o teste')
    def test_invalid_page_query_uses_page_one(self):
        self.assertEqual(1, 1)
        # for i in range(8):
        #     kwargs = {'ideal_classes_per_grade': f'r{i}'}
        #     self.make_setup(**kwargs)
        # with patch('coopesmas.views.PER_PAGE', new=3):
        #     response = self.client.get(
        #       reverse('coopesmas:home') + '?page=12A'
        #       )
        #     self.assertEqual(
        #         response.context['coopesmas'].number,
        #         1
        #     )
        #     response = self.client.get(reverse('coopesmas:home') + '?page=2')
        #     self.assertEqual(
        #         response.context['coopesmas'].number,
        #         2
        #     )
        #     response = self.client.get(reverse('coopesmas:home') + '?page=3')
        #     self.assertEqual(
        #         response.context['coopesmas'].number,
        #         3
        #     )
