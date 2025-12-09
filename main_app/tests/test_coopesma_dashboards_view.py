# from django.urls import reverse, resolve
# from main_app import views
# from .test_coopesma_base import CoopesmaTestBase


# class CoopesmaDashboardsViewTest(CoopesmaTestBase):
#    def test_coopesma_dashboards_view_function_is_correct(self):
#         view = resolve(
#             reverse('coopesma:relatorios')
#         )
#         self.assertIs(view.func, views.dashboards)

#     def test_coopesma_dashboards_view_returns_status_code_200_OK(self):
#         response = self.client.get(
#             reverse('coopesma:relatorios')
#         )
#         self.assertEqual(response.status_code, 200)

#     def test_coopesma_dashboards_view_loads_correct_templates(self):
#         response = self.client.get(
#             reverse('coopesma:relatorios')
#         )
#         self.assertTemplateUsed(response, 'coopesma/pages/dashboards.html')
