from rest_framework import serializers
from .models import Category, Product, ProductImage


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "slug"]


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ["id", "image"]


class ProductSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    owner_username = serializers.CharField(source="owner.username", read_only=True)
    image = serializers.ImageField(write_only=True, required=False)  # Yeni alan

    class Meta:
        model = Product
        fields = [
            "id",
            "owner",
            "owner_username",
            "title",
            "description",
            "category",
            "is_trade",
            "is_sale",
            "is_sold",
            "location",
            "created_at",
            "images",
            "image",  # Buraya ekledik
        ]
        read_only_fields = ["owner", "is_sold", "created_at"]

    def validate(self, data):
        if not data.get("is_trade") and not data.get("is_sale"):
            raise serializers.ValidationError(
                "Ürün en az bir satış ya da takas seçeneği içermelidir."
            )
        return data

    def create(self, validated_data):
        image = validated_data.pop('image', None)  # image'i ayrıştırıyoruz
        product = Product.objects.create(**validated_data)  # ürünü oluşturuyoruz

        if image:
            ProductImage.objects.create(product=product, image=image)  # görseli ilişkilendiriyoruz

        return product
