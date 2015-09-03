from django.db import models

class FullYearCalendar(models.Model):
    date = models.DateField('Date', primary_key=True)
    day = models.CharField(max_length=50)

    def __str__(self):
        return str(self.date)

class MarketingChannels(models.Model):
    name = models.CharField(max_length=350)

class Patient(models.Model):
    name = models.CharField(max_length=50)
    gender = models.CharField(max_length=10)
    contact = models.CharField(max_length=50, primary_key=True)
    registrationDate = models.DateTimeField(null=True)
    marketingChannelId = models.ForeignKey(MarketingChannels)
    conversion = models.NullBooleanField(default=False)
    addedToQueue = models.NullBooleanField(default=None)

    class Meta:
        ordering = ['registrationDate']

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

class Doctor(models.Model):
    name = models.CharField(max_length=50)
    phoneModel = models.CharField(max_length=50)
    calDavAccount = models.CharField(max_length=50)
    contact = models.CharField(max_length=50)
    clinic = models.ManyToManyField(Clinic)

    def __str__(self):
        return self.name


class AvailableTimeSlots(models.Model):
    timeslotType = models.CharField(max_length=200)
    start = models.TimeField("Start Time")
    end = models.TimeField("End Time")
    date = models.ForeignKey(FullYearCalendar,)
    doctors = models.ManyToManyField(Doctor)

    def __str__(self):
        return self.start

class Appointment(models.Model):
    apptType = models.CharField(max_length=200)
    date = models.DateField('Appointment date')
    last_modified = models.DateTimeField('Creation Time', auto_now=True)
    patients = models.ManyToManyField(Patient, related_name="patients")
    tempPatients = models.ManyToManyField(Patient, related_name="tempPatients", blank=True)
    doctor = models.ForeignKey(Doctor)
    clinic = models.ForeignKey(Clinic)
    timeBucket = models.ForeignKey(AvailableTimeSlots)

    def __str__(self):
        return self.apptType

class AppointmentRemarks(models.Model):
    patient = models.ForeignKey(Patient)
    appointment = models.ForeignKey(Appointment)
    remarks = models.CharField(max_length=1500)

class Swapper(models.Model):
    patient = models.ForeignKey(Patient)
    scheduledAppt = models.ForeignKey(Appointment, related_name="scheduledAppt")
    tempAppt = models.ForeignKey(Appointment, related_name="tempAppt")
    swappable = models.BooleanField()
    hasRead = models.BooleanField()
    creationTime = models.DateTimeField(auto_now=True)

class AttendedAppointment(models.Model):
    apptType = models.CharField(max_length=200)
    last_modified = models.DateTimeField('Creation Time', auto_now=True)
    patient = models.ForeignKey(Patient)
    doctor = models.ForeignKey(Doctor)
    clinic = models.ForeignKey(Clinic)
    timeBucket = models.ForeignKey(AvailableTimeSlots)
    attended = models.BooleanField()
    originalAppt = models.ForeignKey(Appointment)
    remarks = models.CharField(max_length=1000, blank=True)

    def __str__(self):
        return self.apptType

class Blacklist(models.Model):
    apptType = models.CharField(max_length=200)
    doctor = models.ForeignKey(Doctor)
    timeBucket = models.ForeignKey(AvailableTimeSlots)
    remarks = models.CharField(max_length=1000, blank=True)
    patient = models.ForeignKey(Patient)