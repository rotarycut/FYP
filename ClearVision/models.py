from django.db import models

class Patient(models.Model):
    name = models.CharField(max_length=50)
    gender = models.CharField(max_length=10)
    contact = models.CharField(max_length=50)
    dob = models.CharField(max_length=50)
    marketingChannelId = models.PositiveIntegerField(default=0)

    def __str__(self):
        return self.name

class Clinic(models.Model):
    name = models.CharField(max_length=50)
    startHr = models.TimeField("Clinic Opening")
    endHr = models.TimeField("Clinic Closing")

    def __str__(self):
        return self.name

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
    start = models.DateTimeField('Appointment start date and time')
    end = models.DateTimeField("Appointment end date and time")
    creation_time = models.DateTimeField('Creation Time')
    patients = models.ManyToManyField(Patient)
    doctor = models.ForeignKey(Doctor)
    clinic = models.ForeignKey(Clinic)

    def __str__(self):
        return self.title
