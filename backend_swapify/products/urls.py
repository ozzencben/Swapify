from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductViewSet, CategoryListAPIView, public_user_profile

router = DefaultRouter()
router.register(r"items", ProductViewSet, basename="products")

print("Router URLs:")
for url in router.urls:
    print(f"{url.name}: {url.pattern}")

urlpatterns = [
    path("", include(router.urls)),
    path("categories/", CategoryListAPIView.as_view(), name="category-list"),
    path('accounts/user/<str:username>/', public_user_profile, name='public_user_profile'),
]
