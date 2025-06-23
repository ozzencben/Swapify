from rest_framework import viewsets, permissions, filters, generics, status
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.contrib.auth import get_user_model
from rest_framework.serializers import ModelSerializer

from .models import Product, ProductImage, Category
from .serializers import ProductSerializer, ProductImageSerializer, CategorySerializer

User = get_user_model()


# --- Category API ---
class CategoryListAPIView(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


# --- Product API ---
class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all().order_by("-created_at")
    serializer_class = ProductSerializer
    permission_classes = [
        permissions.IsAuthenticatedOrReadOnly
    ]  # İzinleri projenin ihtiyacına göre ayarla
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["is_trade", "is_sale", "category", "owner__username"]
    search_fields = ["title", "description"]

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(
        detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated]
    )
    def upload_image(self, request, pk=None):
        product = self.get_object()
        image = request.FILES.get("image")
        if not image:
            return Response({"error": "Resim dosyası gerekli."}, status=400)
        ProductImage.objects.create(product=product, image=image)
        return Response({"message": "Görsel yüklendi."}, status=201)

    @action(
        detail=False, methods=["get"], permission_classes=[permissions.IsAuthenticated]
    )
    def myproducts(self, request):
        queryset = self.queryset.filter(owner=request.user)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


# --- Public User Profile API ---
class PublicUserSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
        ]  # Profil resmi varsa ekle


@api_view(["GET"])
def public_user_profile(request, username):
    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return Response(
            {"detail": "Kullanıcı bulunamadı."}, status=status.HTTP_404_NOT_FOUND
        )
    serializer = PublicUserSerializer(user)
    return Response(serializer.data)
