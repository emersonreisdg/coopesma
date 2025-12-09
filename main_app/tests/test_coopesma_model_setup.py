
from .test_coopesma_base import CoopesmaTestBase, Grade, Setup
from django.core.exceptions import ValidationError
from parameterized import parameterized
# from unittest import skip


# @skip('WIP - Work in progress')
class CoopesmaModelTest(CoopesmaTestBase):
    def setUp(self) -> None:
        self.setup = self.make_setup()
        return super().setUp()

    def make_grade(self, grade="Nível I"):
        return Grade.objects.create(grade=grade)

    def make_setup_no_defaults(self):
        setup = Setup(
            year=2024,
            grade=self.make_grade(),
            ideal_students_per_class=2,
            max_students_per_class=25,
            ideal_classes_per_grade=30,
            max_classes_per_grade=2,
        )
        setup.full_clean()
        setup.save()
        return setup

    @parameterized.expand([
        ('year', 4),
        ('ideal_students_per_class', 2),
        ('max_students_per_class', 2),
        ('ideal_classes_per_grade', 2),
        ('ideal_classes_per_grade', 3),
    ])
    def test_setup_fields_max_length(self, field, max_length):
        long_value = 'x' * (max_length + 1)
        setattr(self.setup, field, long_value)
        with self.assertRaises(ValidationError):
            self.setup.full_clean()
