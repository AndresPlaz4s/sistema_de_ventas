from django.utils import timezone
from django.db.models import Sum
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Caja, MovimientoCaja
from .serializers import CajaSerializer, MovimientoCajaSerializer


class CajaViewSet(viewsets.ModelViewSet):
    queryset = Caja.objects.select_related('usuario').all()
    serializer_class = CajaSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'], url_path='activa')
    def activa(self, request):
        caja = Caja.objects.filter(estado='abierta').first()
        if caja:
            return Response({'caja': self.get_serializer(caja).data})
        return Response({'caja': None})

    @action(detail=False, methods=['post'], url_path='abrir')
    def abrir(self, request):
        if Caja.objects.filter(estado='abierta').exists():
            return Response({'error': 'Ya hay una caja abierta.'}, status=status.HTTP_400_BAD_REQUEST)
        caja = Caja.objects.create(
            usuario=request.user,
            monto_inicial=request.data.get('monto_inicial', 0),
            observaciones=request.data.get('observaciones', ''),
            estado='abierta'
        )
        return Response(self.get_serializer(caja).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='cerrar')
    def cerrar(self, request, pk=None):
        try:
            caja = Caja.objects.get(pk=pk, estado='abierta')
        except Caja.DoesNotExist:
            return Response({'error': 'No hay caja abierta con ese ID.'}, status=status.HTTP_404_NOT_FOUND)
        monto_final = request.data.get('monto_final')
        if monto_final is None or float(monto_final) < 0:
            return Response({'error': 'Monto final invalido.'}, status=status.HTTP_400_BAD_REQUEST)
        caja.monto_final = monto_final
        caja.observaciones = request.data.get('observaciones', '')
        caja.estado = 'cerrada'
        caja.fecha_cierre = timezone.now()
        caja.save()
        return Response(self.get_serializer(caja).data)

    @action(detail=True, methods=['get'], url_path='resumen')
    def resumen(self, request, pk=None):
        try:
            caja = Caja.objects.get(pk=pk)
        except Caja.DoesNotExist:
            return Response({'error': 'Caja no encontrada.'}, status=404)
        total_ventas = 0
        total_ingresos = 0
        try:
            from facturacion.models import Venta
            ventas = Venta.objects.filter(
                fecha__gte=caja.fecha_apertura,
                fecha__lte=caja.fecha_cierre or timezone.now()
            )
            total_ventas = ventas.count()
            total_ingresos = ventas.aggregate(total=Sum('total'))['total'] or 0
        except Exception:
            pass
        return Response({
            'total_ventas': total_ventas,
            'total_ingresos': float(total_ingresos),
        })


class MovimientoCajaViewSet(viewsets.ModelViewSet):
    queryset = MovimientoCaja.objects.select_related('usuario', 'caja').all()
    serializer_class = MovimientoCajaSerializer
    permission_classes = [IsAuthenticated]