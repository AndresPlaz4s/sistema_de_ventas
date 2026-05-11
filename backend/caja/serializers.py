from rest_framework import serializers
from .models import Caja, MovimientoCaja


class MovimientoCajaSerializer(serializers.ModelSerializer):
    usuario_nombre = serializers.SerializerMethodField()

    class Meta:
        model = MovimientoCaja
        fields = '__all__'

    def get_usuario_nombre(self, obj):
        if obj.usuario:
            return obj.usuario.get_full_name() or obj.usuario.username
        return '—'


class CajaSerializer(serializers.ModelSerializer):
    usuario_nombre = serializers.SerializerMethodField()
    movimientos = MovimientoCajaSerializer(many=True, read_only=True)

    class Meta:
        model = Caja
        fields = '__all__'

    def get_usuario_nombre(self, obj):
        if obj.usuario:
            return obj.usuario.get_full_name() or obj.usuario.username
        return '—'