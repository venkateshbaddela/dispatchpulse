import uuid
from django.contrib.auth.models import AbstractUser
from django.db import models
# Create your models here.

class Organization(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=120)
    slug = models.SlugField(max_length=140, unique=True, db_index=True)
    api_key = models.CharField(max_length=64, unique=True, db_index=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = "ADMIN", "Admin"
        RESPONDER = "RESPONDER", "Responder"
        VIEWER = "VIEWER", "Viewer"

    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name="members",
        null=True,
        blank=True,
    )    
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20,
                            choices=Role.choices, default=Role.RESPONDER)
    is_on_call = models.BooleanField(default=False)
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    def __str__(self):
        return self.email