from rest_framework import serializers
from .models import Service, Appointment


class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = ['id', 'name', 'price', 'duration']

    def validate_name(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Service name cannot be empty.")
        return value

    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Price must be a positive number.")
        return value

    def validate_duration(self, value):
        if value <= 0:
            raise serializers.ValidationError("Duration must be greater than zero.")
        return value


class AppointmentSerializer(serializers.ModelSerializer):
    service_name = serializers.CharField(source='service.name', read_only=True)

    class Meta:
        model = Appointment
        fields = [
            'id', 'customer_name', 'customer_phone',
            'service', 'service_name',
            'date', 'time', 'notes', 'status', 'created_at',
        ]
        read_only_fields = ['status', 'created_at']

    def validate_customer_name(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Customer name cannot be empty.")
        return value

    def validate_customer_phone(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Customer phone cannot be empty.")
        return value

    def validate(self, data):
        service = data.get('service', getattr(self.instance, 'service', None))
        date = data.get('date', getattr(self.instance, 'date', None))
        time = data.get('time', getattr(self.instance, 'time', None))

        conflicts = Appointment.objects.filter(
            service=service, date=date, time=time
        ).exclude(status='cancelled')

        if self.instance:
            conflicts = conflicts.exclude(pk=self.instance.pk)

        if conflicts.exists():
            raise serializers.ValidationError("This slot is already booked.")

        return data


class StatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Appointment.STATUS_CHOICES)