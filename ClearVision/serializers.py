__author__ = 'sherman'
from rest_framework import serializers
from ClearVision.models import *

class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient

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

    title = serializers.CharField(source='patients.count')
    #title = serializers.SerializerMethodField()

    class Meta:
        model = Appointment
        fields = ('id', 'title', 'start', 'end', 'patients',)
        depth = 2
        read_only_fields = ('title',)

    #def get_title(self, Appointment):
        #return Appointment.count()