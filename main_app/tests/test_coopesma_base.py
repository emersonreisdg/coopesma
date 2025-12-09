from django.test import TestCase
from main_app.__models import Grade, Setup  # , User
from django.contrib.auth.models import User


class CoopesmaMixin:
    def make_grade(self, name='Grade'):
        return Grade.objects.create(name=name)

    def make_author(
        self,
        first_name='Nome',
        last_name='Sobrenome',
        username='username',
        password='123456',
        email='username@email.com',
    ):
        return User.objects.create_user(
            first_name=first_name,
            last_name=last_name,
            username=username,
            password=password,
            email=email,
        )

    def make_setup(
        self,
        year=2024,
        grade=None,
        ideal_students_per_class=25,
        max_students_per_class=30,
        ideal_classes_per_grade=2,
        max_classes_per_grade=2,
    ):
        if grade is None:
            grade = {}

        return Setup.objects.create(
            year=year,
            grade=self.make_grade(),
            ideal_students_per_class=ideal_students_per_class,
            max_students_per_class=max_students_per_class,
            ideal_classes_per_grade=ideal_classes_per_grade,
            max_classes_per_grade=max_classes_per_grade,
        )


class CoopesmaTestBase(TestCase, CoopesmaMixin):
    def setUp(self) -> None:
        return super().setUp()
