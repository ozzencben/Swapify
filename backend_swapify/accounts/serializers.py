from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import CustomUser

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "first_name",
            "last_name",
            "email",
            "bio",
            "location",
            "profile_image",
        ]
        read_only_fields = ("id", "username", "email")


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    password_again = serializers.CharField(
        write_only=True, required=False, allow_blank=True
    )
    bio = serializers.CharField(required=False, allow_blank=True, max_length=500)
    location = serializers.CharField(required=False, allow_blank=True, max_length=100)
    profile_image = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = CustomUser
        fields = [
            "username",
            "first_name",
            "last_name",
            "email",
            "password",
            "password_again",
            "bio",
            "location",
            "profile_image",
        ]

    def validate(self, attrs):
        if attrs.get("password") != attrs.get("password_again"):
            raise serializers.ValidationError("Şifreler uyuşmuyor.")
        return attrs

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Bu kullanıcı adı zaten alınmış.")
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Bu email zaten kayıtlı.")
        return value

    def create(self, validated_data):
        validated_data.pop("password_again", None)  # Burada çıkarıyoruz
        user = CustomUser.objects.create_user(
            username=validated_data["username"],
            first_name=validated_data["first_name"],
            last_name=validated_data["last_name"],
            email=validated_data["email"],
            password=validated_data["password"],
            bio=validated_data.get("bio", ""),
            location=validated_data.get("location", ""),
            profile_image=validated_data.get("profile_image", None),
        )
        return user
