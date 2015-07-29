from datetime import datetime

__author__ = 'sherman'
from rest_framework import serializers
from ClearVision.models import *

class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = ('name', 'contact')

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
    startTime = serializers.SerializerMethodField()
    endTime = serializers.SerializerMethodField()

    class Meta:
        model = Appointment
        depth = 0
        fields = ('id', 'title', 'date', 'startTime', 'endTime', 'doctor', 'patients',)

    def get_title(self, appointment):
        return str(appointment.patients.count()) + " Patient(s)"

    def get_startTime(self, appointment):
        return str(appointment.doctor.timeBucket.startTime)

    def get_endTime(self, appointment):
        return str(appointment.doctor.timeBucket.endTime)

    patients = PatientSerializer(many=True)

class AppointmentMakerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        depth = 0

class AppointmentIScheduleFinderSerializer(serializers.ModelSerializer):

    class Meta:
        model = Appointment
        depth = 0

"""
class AppointmentIScheduleSwapSerializer(serializers.ModelSerializer):

    class Meta:
        model = Appointment
        depth = 1
"""