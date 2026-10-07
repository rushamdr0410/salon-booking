from django.urls import path
from . import views

urlpatterns = [
    path('services/', views.service_list),
    path('services/<int:pk>/', views.service_detail),
    path('appointments/', views.appointment_list),
    path('appointments/<int:pk>/', views.appointment_details),
    path('appointments/<int:pk>/status/', views.appointment_status),
]