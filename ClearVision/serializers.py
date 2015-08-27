from datetime import datetime
from django.db.models import Count

__author__ = 'sherman'
from rest_framework import serializers
from ClearVision.models import *

class PatientSerializer(serializers.ModelSerializer):

    marketingname = serializers.SerializerMethodField()

    class Meta:
        model = Patient
        fields = ('name', 'contact', 'marketingname')

    def get_marketingname(self, patient):
        return str(patient.marketingChannelId.name)

class ClinicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Clinic

class StaffSerializer(serializers.ModelSerializer):
    class Meta:
        model = Staff

class DoctorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Doctor

class AppointmentSerializer(serializers.ModelSerializer):

    title = serializers.SerializerMethodField()
    start = serializers.SerializerMethodField()
    end = serializers.SerializerMethodField()

    class Meta:
        model = Appointment
        depth = 0
        fields = ('id', 'apptType', 'title', 'date', 'start', 'end', 'doctor', 'patients', 'tempPatients')

    def get_title(self, appointment):
        return str(appointment.patients.count()) + " Patient(s)"

    def get_start(self, appointment):
        return str(appointment.date) + " " + str(appointment.timeBucket.start)

    def get_end(self, appointment):
        return str(appointment.date) + " " + str(appointment.timeBucket.end)

    tempPatients = PatientSerializer(many=True)
    patients = PatientSerializer(many=True)

class AppointmentMakerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        depth = 1

class AppointmentIScheduleFinderSerializer(serializers.ModelSerializer):

    class Meta:
        model = FullYearCalendar

class RemarksSerializer(serializers.ModelSerializer):

    class Meta:
        model = AppointmentRemarks
        depth = 0


class AvailiableTimeSlotsSerializer(serializers.ModelSerializer):

    class Meta:
        model = AvailableTimeSlots
        depth = 1

class AttendedAppointmentSerializer(serializers.ModelSerializer):

    class Meta:
        model = AttendedAppointment
        depth = 1