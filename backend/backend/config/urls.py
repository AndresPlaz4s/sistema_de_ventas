from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from facturacion.views import (
    ProductoViewSet,
    ClienteViewSet,
    ProveedorViewSet,
    VentaViewSet,
)
from caja.views import CajaViewSet, MovimientoCajaViewSet
from user.views import UserViewSet

router = DefaultRouter()
router.register(r'productos',    ProductoViewSet)
router.register(r'clientes',     ClienteViewSet)
router.register(r'proveedores',  ProveedorViewSet)
router.register(r'ventas',       VentaViewSet)
router.register(r'caja',         CajaViewSet)
router.register(r'movimientos',  MovimientoCajaViewSet)
router.register(r'usuarios',     UserViewSet)

urlpatterns = [
    path('admin/',             admin.site.urls),
    path('api/',               include(router.urls)),
    path('api/token/',         TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(),    name='token_refresh'),
]