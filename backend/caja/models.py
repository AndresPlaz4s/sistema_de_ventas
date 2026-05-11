from django.db import models
from django.conf import settings


class Caja(models.Model):
    ESTADOS = [
        ('abierta', 'Abierta'),
        ('cerrada', 'Cerrada'),
    ]

    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    fecha_apertura = models.DateTimeField(auto_now_add=True)
    fecha_cierre = models.DateTimeField(null=True, blank=True)
    monto_inicial = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    monto_final = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    estado = models.CharField(max_length=10, choices=ESTADOS, default='abierta')
    observaciones = models.TextField(blank=True)

    @property
    def total_ventas(self):
        from facturacion.models import Venta
        from django.db.models import Sum
        ventas = Venta.objects.filter(
            fecha__gte=self.fecha_apertura,
            fecha__lte=self.fecha_cierre or self.fecha_apertura,
            estado='completada'
        ).aggregate(total=Sum('total'))
        return ventas['total'] or 0

    @property
    def diferencia(self):
        if self.monto_final is not None:
            return self.monto_final - (self.monto_inicial + self.total_ventas)
        return None

    def __str__(self):
        return f'Caja #{self.id} - {self.estado} - {self.fecha_apertura.strftime("%d/%m/%Y")}'

    class Meta:
        verbose_name = 'Caja'
        verbose_name_plural = 'Cajas'
        ordering = ['-fecha_apertura']


class MovimientoCaja(models.Model):
    TIPOS = [
        ('ingreso', 'Ingreso'),
        ('egreso', 'Egreso'),
    ]

    caja = models.ForeignKey(Caja, on_delete=models.CASCADE, related_name='movimientos')
    tipo = models.CharField(max_length=10, choices=TIPOS)
    monto = models.DecimalField(max_digits=10, decimal_places=2)
    descripcion = models.CharField(max_length=200)
    fecha = models.DateTimeField(auto_now_add=True)
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return f'{self.tipo} - ${self.monto} - {self.descripcion}'

    class Meta:
        verbose_name = 'Movimiento de caja'
        verbose_name_plural = 'Movimientos de caja'
        ordering = ['-fecha']