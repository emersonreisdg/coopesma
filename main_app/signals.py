# import os

# from django.db.models.signals import pre_delete, pre_save
# from django.dispatch import receiver

# from main_app.models import Setup


# def delete_cover(instance):
#     try:
#         os.remove(instance.cover.path)
#     except (ValueError, FileNotFoundError):
#         ...


# @receiver(pre_delete, sender=Setup)
# def setup_cover_delete(sender, instance, *args, **kwargs):
#     old_instance = Setup.objects.get(pk=instance.pk)
#     delete_cover(old_instance)


# @receiver(pre_save, sender=Setup)
# def setup_cover_update(sender, instance, *args, **kwargs):
#     old_instance = Setup.objects.filter(pk=instance.pk)
#     is_new_cover = old_instance.cover != instance.cover

#     if is_new_cover:
#         delete_cover(old_instance)
