# # from main_app.__models import Setup
# from collections import defaultdict
# from django import forms
# # from django.core.exceptions import ValidationError
# from utils.django_forms import add_attr
# # from utils.strings import is_positive_number


# class AuthorSetupForm(forms.ModelForm):
#     def __init__(self, *args, **kwargs):
#         super().__init__(*args, **kwargs)

#         self._my_errors = defaultdict(list)

#         add_attr(self.fields.get('year'), 'class', 'span-2')
#         add_attr(self.fields.get('grade'), 'class', 'span-2')

#     class Meta:
#         model = Setup
#         fields = 'year', 'grade', 'ideal_students_per_class', \
#             'max_students_per_class', 'ideal_classes_per_grade', \
#             'max_classes_per_grade'

# AULA 187
# widgets = {
#     'cover': forms.FileInput(
#         attrs={
#             'class': 'span-2'
#         }
#     ),
#     'servings_unit': forms.Select(
#         choices=(
#             ('Porções', 'Porções'),
#             ('Pedaços', 'Pedaços'),
#             ('Pessoas', 'Pessoas'),
#         ),
#     ),
#     'preparation_time_unit': forms.Select(
#         choices=(
#             ('Minutos', 'Minutos'),
#             ('Horas', 'Horas'),
#         ),
#     ),
# }

# VALICAÇÃO DE CAMPOS: AULA 191
# def clean(self, *args, **kwargs):
#     super_clean = super().clean(*args, **kwargs)
#     cd = self.cleaned_data

#     name = cd.get('name')

#     # if title == description:
#     #     self._my_errors['title'].append(
#               'Cannot be equal to description'
#            )
#     #     self._my_errors['description'].append(
#               'Cannot be equal to title'
#           )

#     if self._my_errors:
#         raise ValidationError(self._my_errors)

#     return super_clean

# def clean_title(self):
#     name = self.cleaned_data.get('name')
#     min_chars = 3

#     if len(name) < min_chars:
#         self._my_errors['name'].append(
#           f'Must have at least {min_chars} chars.'
#           )

#     return name
