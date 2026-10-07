from django.shortcuts import render
from django.db.models import ProtectedError
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Service, Appointment
from .serializers import (
    ServiceSerializer,
    AppointmentSerializer,
    StatusUpdateSerializer,
)

ALLOWED_TRANSITIONS = {
    'pending': ['confirmed', 'cancelled'],
    'confirmed': ['completed', 'cancelled'],
    'completed': [],
    'cancelled': [],
}

@api_view(["GET", "POST"])
def service_list(request):
    if request.method == "GET":
        services = Service.objects.all()
        serializer = ServiceSerializer(services, many=True)
        return Response(serializer.data)

    elif request.method == "POST":
        serializer = ServiceSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(["PUT", "DELETE"])
def service_detail(request, pk):
    service = get_object_or_404(Service, pk=pk)

    if request.method == "PUT":
        serializer = ServiceSerializer(service, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == "DELETE":
        try:
            service.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except ProtectedError:
            return Response(
                {"error": "Cannot delete service with existing appointments."},
                status=status.HTTP_400_BAD_REQUEST,
            )

@api_view(["GET", "POST"])
def appointment_list(request):
    if request.method == "GET":
        appointments = Appointment.objects.select_related('service').order_by('-created_at')

        status_filter = request.query_params.get('status')
        if status_filter:
            appointments = appointments.filter(status=status_filter)

        serializer = AppointmentSerializer(appointments, many=True)
        return Response(serializer.data)

    elif request.method == "POST":
        serializer = AppointmentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(["PUT", "DELETE"])
def appointment_status(t, pk):
    appointment = get_object_or_404(Appointment, pk=pk)

    serializer = StatusUpdateSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    new_status = serializer.validated_data['status']

    if new_status not in ALLOWED_TRANSITIONS[appointment.status]:
        return Response(
            {"error": f"Cannot change status from '{appointment.status}' to '{new_status}'."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    appointment.status = new_status
    appointment.save()
    return Response(AppointmentSerializer(appointment).data)

@api_view(["DELETE"])
def appointment_details(request, pk):
    appointment = get_object_or_404(Appointment, pk=pk)
    appointment.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)