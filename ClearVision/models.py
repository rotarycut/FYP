from django.db import models

# Create your models here.

class Patient(models.Model):
    name = models.CharField(max_length=50)
    gender = models.CharField(max_length=10)
    contact = models.CharField(max_length=50)
    dob = models.CharField(max_length=50)

    def __str__(self):
        return self.name


class Doctor(models.Model):
    name = models.CharField(max_length=50)
    phoneModel = models.CharField(max_length=50)
    calDavAccount = models.CharField(max_length=50)

    def __str__(self):
        return self.name


class Nurse(models.Model):
    number = models.CharField(max_length=50)
    name = models.CharField(max_length=50)

    def __str__(self):
        return self.name


class Appointment(models.Model):
    patient = models.ForeignKey(Patient)
    doctor = models.ForeignKey(Doctor)
    appt_type = models.CharField(max_length=200)
    date = models.DateTimeField('Appointment date and time')
    clinic = models.CharField(max_length=200)
    creation_time = models.DateTimeField('Creation Time')

    def __str__(self):
        return self.date
