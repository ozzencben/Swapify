from rest_framework import permissions


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Sadece objenin sahibi olan kullanıcı yazma izinlerine sahiptir.
    Diğer kullanıcılar sadece okuma işlemi yapabilir.
    """

    def has_object_permission(self, request, view, obj):
        # Herkese okuma izni (GET, HEAD, OPTIONS)
        if request.method in permissions.SAFE_METHODS:
            return True

        # Yazma izni sadece objenin sahibine (owner)
        return obj.owner == request.user
