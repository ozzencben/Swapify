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
    image = serializers.ImageField(write_only=True, required=False)
    price = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    category = CategorySerializer(read_only=True)  # detaylı kategori (name, slug vs)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), source="category", write_only=True
    )

    class Meta:
        model = Product
        fields = [
            "id",
            "owner",
            "owner_username",
            "title",
            "description",
            "category",
            "category_id",
            "is_trade",
            "is_sale",
            "is_sold",
            "location",
            "created_at",
            "price",  # EKLENDİ
            "images",
            "image",
        ]
        read_only_fields = ["owner", "is_sold", "created_at"]

    def validate(self, data):
        if not data.get("is_trade") and not data.get("is_sale"):
            raise serializers.ValidationError(
                "Ürün en az bir satış ya da takas seçeneği içermelidir."
            )
        return data

    def create(self, validated_data):
        image = validated_data.pop("image", None)
        product = Product.objects.create(**validated_data)

        if image:
            ProductImage.objects.create(product=product, image=image)

        return product
