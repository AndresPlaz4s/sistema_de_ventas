from django.urls import path
from .views import (
    CajaListView,
    CajaActivaView,
    AbrirCajaView,
    CerrarCajaView,
    ResumenCajaView,
)

urlpatterns = [
    path('', CajaListView.as_view()),
    path('activa/', CajaActivaView.as_view()),
    path('abrir/', AbrirCajaView.as_view()),
    path('<int:pk>/cerrar/', CerrarCajaView.as_view()),
    path('<int:pk>/resumen/', ResumenCajaView.as_view()),
]