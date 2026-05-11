from rest_framework import serializers
from .models import Producto, Cliente, Proveedor, Venta, DetalleVenta, ConfiguracionFiscal


class ProveedorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Proveedor
        fields = '__all__'


class ProductoSerializer(serializers.ModelSerializer):
    proveedor_nombre = serializers.CharField(source='proveedor.nombre', read_only=True)
    bajo_stock = serializers.BooleanField(read_only=True)

    class Meta:
        model = Producto
        fields = '__all__'


class ClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        fields = '__all__'


class DetalleVentaSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.CharField(source='producto.nombre', read_only=True)

    class Meta:
        model = DetalleVenta
        fields = '__all__'


class VentaSerializer(serializers.ModelSerializer):
    detalles = DetalleVentaSerializer(many=True, read_only=True)
    cliente_nombre = serializers.CharField(source='cliente.nombre', read_only=True)
    usuario_nombre = serializers.CharField(source='usuario.username', read_only=True)

    class Meta:
        model = Venta
        fields = '__all__'


class VentaCreateSerializer(serializers.ModelSerializer):
    detalles = DetalleVentaSerializer(many=True)

    class Meta:
        model = Venta
        fields = ['cliente', 'observaciones', 'detalles', 'descuento']

    def create(self, validated_data):
        detalles_data = validated_data.pop('detalles')
        request = self.context.get('request')

        # Obtener configuración fiscal activa
        config = ConfiguracionFiscal.get_activa()
        iva_pct = float(config.iva) if config else 0
        descuento = float(validated_data.pop('descuento', 0))

        venta = Venta.objects.create(
            usuario=request.user,
            **validated_data
        )

        subtotal = 0
        for detalle in detalles_data:
            producto = detalle['producto']
            cantidad = detalle['cantidad']
            precio = detalle.get('precio_unitario', producto.precio)
            det_subtotal = cantidad * float(precio)

            DetalleVenta.objects.create(
                venta=venta,
                producto=producto,
                cantidad=cantidad,
                precio_unitario=precio,
                subtotal=det_subtotal
            )
            producto.stock -= cantidad
            producto.save()
            subtotal += det_subtotal

        iva_valor = subtotal * iva_pct / 100
        total = subtotal + iva_valor - descuento

        venta.subtotal = subtotal
        venta.iva_porcentaje = iva_pct
        venta.iva_valor = iva_valor
        venta.descuento = descuento
        venta.total = total
        venta.save()
        return venta


class ConfiguracionFiscalSerializer(serializers.ModelSerializer):
    actualizado_por_nombre = serializers.CharField(
        source='actualizado_por.username', read_only=True
    )

    class Meta:
        model = ConfiguracionFiscal
        fields = '__all__'