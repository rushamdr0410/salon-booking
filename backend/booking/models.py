from django.db import models

class Service(models.Model):
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    duration = models.PositiveBigIntegerField()

    class Meta:
        def __str__(self):
            return f"{self.name} - {self.price} - {self.duration}"

class Appointment(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    customer_name = models.CharField(max_length=100)
    customer_phone = models.CharField(max_length=15)
    date = models.DateField()
    time = models.TimeField()
    notes = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    service = models.ForeignKey(Service, on_delete=models.PROTECT, related_name='appointments',)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        def __str__(self):
            return f"{self.cname} - {self.service.name} - {self.date} {self.time}"