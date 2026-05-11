from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .models import User
from .serializers import (
    UserSerializer,
    UserCreateSerializer,
    UserUpdateSerializer,
    ChangePasswordSerializer,
)


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        if self.action in ['update', 'partial_update']:
            return UserUpdateSerializer
        return UserSerializer

    def get_serializer_context(self):
        return {'request': self.request}

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()

        # Extraer password antes de pasar al serializer (UserUpdateSerializer no lo tiene)
        password = request.data.get('password')

        serializer = UserUpdateSerializer(
            instance,
            data=request.data,
            partial=True,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        # Cambiar password si se envió
        if password:
            instance.set_password(password)
            instance.save()

        return Response(UserSerializer(instance, context={'request': request}).data)

    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = UserSerializer(request.user, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['post'], parser_classes=[MultiPartParser, FormParser])
    def subir_foto(self, request):
        user = request.user
        if 'foto' not in request.FILES:
            return Response({'error': 'No se envió ninguna foto.'}, status=status.HTTP_400_BAD_REQUEST)
        user.foto_perfil = request.FILES['foto']
        user.save()
        serializer = UserSerializer(user, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def change_password(self, request):
        serializer = ChangePasswordSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({'mensaje': 'Contraseña actualizada correctamente.'})

    @action(detail=True, methods=['post'])
    def toggle_activo(self, request, pk=None):
        user = self.get_object()
        user.activo = not user.activo
        user.is_active = user.activo  # ← esto bloquea el login real
        user.save()
        estado = 'activado' if user.activo else 'desactivado'
        return Response({'mensaje': f'Usuario {estado} correctamente.'})