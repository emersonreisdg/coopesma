# flake8: noqa
# from authors.forms.setup_form import AuthorSetupForm
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.http.response import Http404
from django.shortcuts import render, redirect
from django.urls import reverse
from django.utils.decorators import method_decorator
from django.views import View
# from main_app.__models import Setup


# @method_decorator(
#     login_required(login_url='authors:login', redirect_field_name='next'),
#     name='dispatch'
# )
# class DashboardSetup(View):
#     def __init__(self, *args, **kwargs):
#         super().__init__(*args, **kwargs)
#     def setup(self, *args, **kwargs):
#         return super().setup(*args, **kwargs)
#     def dispatch(self, *args, **kwargs):
#         return super().dispatch(*args, **kwargs)
#     def get_setup(self, id=None):
#         setup = None
#         if id is not None:
#             setup = Setup.objects.filter(
#                 # is_published=False,
#                 # author=self.request.user,
#                 pk=id,
#             ).first()
#             if not setup:
#                 raise Http404()
#         return setup
#     def render_setup(self, form):
#         return render(
#             self.request,
#             'authors/pages/dashboard_setup.html',
#             context={
#                 'form': form
#             }
#         )
#     def get(self, request, id=None):
#         setup = self.get_setup(id)
#         form = AuthorSetupForm(instance=setup)
#         return self.render_setup(form)
#     def post(self, request, id=None):
#         setup = self.get_setup(id)
#         form = AuthorSetupForm(
#             data=request.POST or None,
#             files=request.FILES or None,
#             instance=setup
#         )
#         # AULA 188
#         if form.is_valid():
#             # Agora, o form é válido e eu posso tentar salvar
#             setup = form.save(commit=False)
#             # recipe.author = request.user
#             # recipe.preparation_steps_is_html = False
#             # recipe.is_published = False
#             # recipe.save()
#             # messages.success(request, 'Sua receita foi salva com sucesso!')
#             # return redirect(
#             #     reverse('authors:dashboard_recipe_edit', args=(recipe.id,))
#             # )
#         return self.render_setup(form)
# @method_decorator(
#     login_required(login_url='authors:login', redirect_field_name='next'),
#     name='dispatch'
# )
# class DashboardSetupDelete(DashboardSetup):
#     def post(self, *args, **kwargs):
#         setup = self.get_setup(self.request.POST.get('id'))
#         setup.delete()
#         messages.success(self.request, 'Deleted successfully.')
#         return redirect(reverse('authors:dashboard'))
