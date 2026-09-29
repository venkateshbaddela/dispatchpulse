from rest_framework import serializers
from django.contrib.auth import authenticate
from django.utils.text import slugify
from rest_framework.authtoken.models import Token
import uuid

from .models import User, Organization

class OrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = ['id', 'name', 'slug', 'is_active', 'created_at']
        read_only_fields = ['id', 'slug', 'created_at']

class UserSerializer(serializers.ModelSerializer):
    organization = OrganizationSerializer(read_only=True)

    class Meta:
        model = User
        fields = ["id", "email", "role", "is_on_call", "organization"]
        read_only_fields = ["id", "organization"]

class RegisterSerializer(serializers.Serializer):
    org_name = serializers.CharField(max_length=120, write_only=True)
    email = serializers.EmailField(write_only=True)
    password = serializers.CharField(write_only=True, min_length=8)

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value.lower()

    def create(self, validated_data):
        org_name = validated_data['org_name']
        email = validated_data['email']
        password = validated_data['password']

        # Generate unique slug and API key for organization
        base_slug = slugify(self.org_name) or "org"
        slug = f"{base_slug}-{uuid.uuid4().hex[:6]}"
        api_key = f"dp_live_{uuid.uuid4().hex}"

        organization = Organization.objects.create(
            name=org_name,
            slug=slug,
            api_key=api_key,
        )

        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
            organization=organization,
            role=User.Roles.ADMIN,
        )
        token, _ = Token.objects.get_or_create(user=user)
        return user, token

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(write_only=True)
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get('email', '').lower()
        password =  attrs.get('password', '')

        user = authenticate(
            request=self.context.get('request'), 
            email=email, 
            password=password
        ) or authenticate(
            request=self.context.get('request'),
            username=email,
            password=password,
        )
        if not user:
            raise serializers.ValidationError("Inva;id email or password.")
        if not user.is_active:
            raise serializers.ValidationError("User account is disabled.")

        attrs['user'] = user
        return attrs