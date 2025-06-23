from django.contrib import admin
from .models import Category, Product, ProductImage


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    prepopulated_fields = {"slug": ("name",)}
    list_display = ("name",)


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("title", "owner", "is_sale", "is_trade", "is_sold", "created_at")
    list_filter = ("is_sale", "is_trade", "is_sold", "category")
    search_fields = ("title", "description", "owner__username")
    inlines = [ProductImageInline]
