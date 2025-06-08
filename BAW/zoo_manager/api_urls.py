from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .api_views import (
    EmployeeViewSet, EnclosureViewSet, AnimalViewSet, TaskViewSet,
    LoginAPIView, DashboardAPIView
)

# Tworzenie routera dla ViewSets
router = DefaultRouter()
router.register(r'employees', EmployeeViewSet)
router.register(r'enclosures', EnclosureViewSet)
router.register(r'animals', AnimalViewSet)
router.register(r'tasks', TaskViewSet)

urlpatterns = [
    # Główne API endpoints
    path('', include(router.urls)),
    
    # Autentykacja
    path('auth/login/', LoginAPIView.as_view(), name='api_login'),
    
    # Dashboard
    path('dashboard/', DashboardAPIView.as_view(), name='api_dashboard'),
]

