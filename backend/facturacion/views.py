from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django_filters.rest_framework import DjangoFilterBackend
from .models import Producto, Cliente, Proveedor, Venta, DetalleVenta, ConfiguracionFiscal
from .serializers import (
    ProductoSerializer,
    ClienteSerializer,
    ProveedorSerializer,
    VentaSerializer,
    VentaCreateSerializer,
    DetalleVentaSerializer,
    ConfiguracionFiscalSerializer,
)


class ProveedorViewSet(viewsets.ModelViewSet):
    queryset = Proveedor.objects.all()
    serializer_class = ProveedorSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nombre', 'email', 'telefono']
    ordering_fields = ['nombre', 'created_at']


class ProductoViewSet(viewsets.ModelViewSet):
    queryset = Producto.objects.select_related('proveedor').all()
    serializer_class = ProductoSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['proveedor']
    search_fields = ['nombre', 'descripcion']
    ordering_fields = ['nombre', 'precio', 'stock', 'created_at']

    @action(detail=False, methods=['get'])
    def bajo_stock(self, request):
        productos = [p for p in self.get_queryset() if p.bajo_stock]
        serializer = self.get_serializer(productos, many=True)
        return Response(serializer.data)


class ClienteViewSet(viewsets.ModelViewSet):
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nombre', 'documento', 'telefono', 'email']
    ordering_fields = ['nombre', 'created_at']


class VentaViewSet(viewsets.ModelViewSet):
    queryset = Venta.objects.select_related('cliente', 'usuario').prefetch_related('detalles').all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['estado', 'cliente', 'usuario']
    ordering_fields = ['fecha', 'total']

    def get_serializer_class(self):
        if self.action == 'create':
            return VentaCreateSerializer
        return VentaSerializer

    def get_serializer_context(self):
        return {'request': self.request}

    @action(detail=True, methods=['post'])
    def anular(self, request, pk=None):
        venta = self.get_object()
        if venta.estado == 'anulada':
            return Response(
                {'error': 'La venta ya esta anulada.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        for detalle in venta.detalles.all():
            if detalle.producto:
                detalle.producto.stock += detalle.cantidad
                detalle.producto.save()
        venta.estado = 'anulada'
        venta.save()
        return Response({'mensaje': 'Venta anulada correctamente.'})


class ConfiguracionFiscalViewSet(viewsets.ModelViewSet):
    queryset = ConfiguracionFiscal.objects.all()
    serializer_class = ConfiguracionFiscalSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def activa(self, request):
        config = ConfiguracionFiscal.get_activa()
        if config:
            return Response(ConfiguracionFiscalSerializer(config).data)
        # Si no existe ninguna, devolver valores por defecto
        return Response({'iva': 0, 'descuento_maximo': 0})

    @action(detail=False, methods=['post'], permission_classes=[IsAdminUser])
    def actualizar(self, request):
        config = ConfiguracionFiscal.get_activa()
        if config:
            serializer = ConfiguracionFiscalSerializer(
                config, data=request.data, partial=True
            )
        else:
            serializer = ConfiguracionFiscalSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save(actualizado_por=request.user)
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)