from django.db import models

# Create your models here.

class Appointment(models.Model):
    appt_type = models.CharField(max_length=200)
    date = models.DateTimeField('Appointment date and time')
    clinic = models.CharField(max_length=200)
    creation_time = models.DateTimeField('Creation Time')

class Patient(models.Model):
    Patient = models.ForeignKey(Appointment)
    name = models.CharField(max_length=50)
    gender = models.CharField(max_length=10)
    contact = models.CharField(max_length=50)
    dob = models.CharField(max_length=50)

class Doctor(models.Model):
    Doctor = models.ForeignKey(Appointment)
    name = models.CharField(max_length=50)
    phoneModel = models.CharField(max_length=50)
    calDavAccount = models.CharField(max_length=50)

class Nurse(models.Model):
    number = models.CharField(max_length=50)
    name = models.CharField(max_length=50)
