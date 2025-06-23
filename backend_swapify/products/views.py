from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Product, ProductImage, Category
from .serializers import ProductSerializer, ProductImageSerializer, CategorySerializer
from rest_framework import generics
from django.http import JsonResponse


def test_view(request):
    return JsonResponse({"message": "Test başarılı"})


class CategoryListAPIView(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all().order_by("-created_at")
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        # Serializer'daki create metodu çağrılır, owner burada atanır
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
