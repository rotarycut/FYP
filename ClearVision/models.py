from django.db import models

class Patient(models.Model):
    nric = models.CharField(max_length=15)
    name = models.CharField(max_length=50)
    gender = models.CharField(max_length=10)
    contact = models.CharField(max_length=50)
    dob = models.CharField(max_length=50)
    marketingChannelId = models.CharField(max_length=50)

    def __str__(self):
        return self.nric

class Clinic(models.Model):
    name = models.CharField(max_length=50)
    startHr = models.DateTimeField("Clinic Opening")
    endHr = models.DateTimeField("Clinic Closing")

class Staff(models.Model):
    number = models.CharField(max_length=50)
    name = models.CharField(max_length=50)
    clinic = models.ManyToManyField(Clinic)

    def __str__(self):
        return self.name

class Doctor(models.Model):
    name = models.CharField(max_length=50)
    phoneModel = models.CharField(max_length=50)
    calDavAccount = models.CharField(max_length=50)
    contact = models.CharField(max_length=50)
    clinic = models.ManyToManyField(Clinic)

    def __str__(self):
        return self.name


class Appointment(models.Model):
    type = models.CharField(max_length=200)
    startTime = models.DateTimeField('Appointment date and time')
    creation_time = models.DateTimeField('Creation Time')
    patient = models.ForeignKey(Patient)
    doctor = models.ForeignKey(Doctor)
    clinic = models.ForeignKey(Clinic)

    def __str__(self):
        return self.date
