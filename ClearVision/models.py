from django.db import models

class Patient(models.Model):
    name = models.CharField(max_length=50)
    gender = models.CharField(max_length=10)
    contact = models.CharField(max_length=50, primary_key=True)
    dob = models.CharField(max_length=50, null=True)
    marketingChannelId = models.PositiveIntegerField(default=0)
    convert = models.NullBooleanField(null=True)

    def __str__(self):
        return self.contact

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

class AvailableTimeSlots(models.Model):
    type = models.CharField(max_length=200)
    startTime = models.TimeField("Start Time")
    endTime = models.TimeField("End Time")

    def __str__(self):
        return str(self.startTime)

class Doctor(models.Model):
    name = models.CharField(max_length=50)
    phoneModel = models.CharField(max_length=50)
    calDavAccount = models.CharField(max_length=50)
    contact = models.CharField(max_length=50)
    timeBucket = models.ForeignKey(AvailableTimeSlots, null=True)
    clinic = models.ManyToManyField(Clinic)

    def __str__(self):
        return self.name

class Appointment(models.Model):

    type = models.CharField(max_length=200)
    date = models.DateField('Appointment date')
    last_modified = models.DateTimeField('Creation Time', auto_now=True)
    patients = models.ManyToManyField(Patient, related_name="patients")
    tempPatients = models.ManyToManyField(Patient, related_name="tempPatients", blank=True)
    doctor = models.ForeignKey(Doctor)
    clinic = models.ForeignKey(Clinic)
    timeBucket = models.ForeignKey(AvailableTimeSlots)

    def __str__(self):
        return self.type

