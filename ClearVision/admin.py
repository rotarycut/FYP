from django.contrib import admin

# Register your models here.


from .models import Appointment, Patient, Doctor, Nurse

admin.site.register(Appointment)
admin.site.register(Patient)
admin.site.register(Doctor)
admin.site.register(Nurse)
