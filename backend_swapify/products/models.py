from django.db import models
from django.conf import settings
from django.utils.text import slugify
import uuid
import os


# Dosya adı benzersizleştirme
def product_image_upload_path(instance, filename):
    ext = filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    return os.path.join("product_images", str(instance.product.id), filename)


# Kategori Modeli
class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True, blank=True)

    class Meta:
        verbose_name_plural = "Categories"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


# Ürün Modeli
class Product(models.Model):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="products"
    )
    title = models.CharField(max_length=255)
    description = models.TextField()
    category = models.ForeignKey(
        Category, on_delete=models.SET_NULL, null=True, related_name="products"
    )
    is_trade = models.BooleanField(default=False)  # Takasa uygun mu?
    is_sale = models.BooleanField(default=False)  # Satılık mı?
    is_sold = models.BooleanField(default=False)  # Satıldı mı?
    location = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


# Ürün Görselleri
class ProductImage(models.Model):
    product = models.ForeignKey(
        Product, on_delete=models.CASCADE, related_name="images"
    )
    image = models.ImageField(upload_to=product_image_upload_path)

    def __str__(self):
        return f"Image for {self.product.title}"
