from rest_framework import status, viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authtoken.models import Token
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied

from .models import User
from .serializers import (
    UserSerializer,
    RegisterSerializer,
    LoginSerializer
)

# Create your views here.

class RegisterView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user, token = serializer.save()
        return Response(
            {
                'token': token.key,
                'user': UserSerializer(user).data
            },
            status=status.HTTP_201_CREATED,
        )

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, _ = Token.objects.get_or_create(user=user)
        return Response(
            {
                'token': token.key,
                'user': UserSerializer(user).data,
            },
            status=status.HTTP_200_OK
        )

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        Token.objects.filter(user=request.user).delete()
        return Response({'detail': "Logged out successfully."}, status=status.HTTP_200_OK)

class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)

class UserViewSet(viewsets.ModelViewSet):
    """Team member management and on-call rotation operations."""
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if not self.request.user.organization:
            return User.objects.none()
        return(
            User.objects.filter(organization=self.request.user.organization)
            .order_by("-is_on_call", "email")
        )

    def perform_create(self, serializer):
        if self.request.user.role != User.Role.ADMIN:
            raise PermissionDenied("Only organization administrators can invite new members.")
        serializer.save(organization=self.request.user.organization)

    def perform_update(self, serializer):
        # Only Admins can modify member roles
        if "role" in serializer.validated_data and self.request.user.role != User.Role.ADMIN: 
            raise PermissionDenied("Only organization administrators can modify member roles.")                                                  
        serializer.save()

    @action(detail=True, methods=["post"], url_path="toggle-on-call")
    def toggle_on_call(self, request, pk=None):
        """Toggle responder active on-call shift status."""
        target_user = self.get_object()

        # Responders can toggle themselves; Admins can toggle anyone
        if request.user.role != User.Role.ADMIN and request.user.id != target_user.id:
            raise PermissionDenied("You do not have permission to modify this responder's shift.")

        target_user.is_on_call = not target_user.is_on_call
        target_user.save(update_fields=["is_on_call"])

        return Response(UserSerializer(target_user).data, status=status.HTTP_200_OK)