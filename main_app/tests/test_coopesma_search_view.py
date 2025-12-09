from django.urls import reverse, resolve
from main_app import views
from .test_coopesma_base import CoopesmaTestBase


# @skip('A mensagem do porquê estou pulando esses testes.')
class CoopesmaSearchViewTest(CoopesmaTestBase):
    def test_coopesma_search_uses_correct_view_function(self):
        resolved = resolve(reverse('coopesma:search'))
        self.assertIs(resolved.func.view_class, views.SetupListViewSearch)

    def test_coopesma_search_loads_correct_templates(self):
        response = self.client.get(reverse('coopesma:search') + '?q=Nível')
        self.assertTemplateUsed(response, 'coopesma/pages/search.html')

    def test_coopesma_search_raises_404_if_no_search_term(self):
        url = reverse('coopesma:search')  # + '?q=Nível'
        response = self.client.get(url)
        self.assertEqual(response.status_code, 404)

    def test_coopesma_search_term_is_on_page_title_and_escaped(self):
        url = reverse('coopesma:search') + '?q=Nível'
        response = self.client.get(url)
        self.assertIn(
            'Search for &quot;Nível&quot;',
            response.content.decode('utf-8')
        )
