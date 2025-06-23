import os
from uuid import uuid4
from django.db import models
from django.contrib.auth.models import AbstractUser


def user_profile_path(instance, filename):
    ext = filename.split(".")[-1]
    folder = f"user_{instance.pk}" if instance.pk else "temp"
    filename = f"{uuid4().hex}.{ext}"
    return os.path.join("profile_images", folder, filename)


class CustomUser(AbstractUser):
    bio = models.TextField(blank=True)
    location = models.CharField(max_length=100, blank=True)
    profile_image = models.ImageField(
        upload_to=user_profile_path, blank=True, null=True
    )

