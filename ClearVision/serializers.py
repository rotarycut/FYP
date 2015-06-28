__author__ = 'sherman'
from rest_framework import serializers
from ClearVision.models import Appointment, Patient, Doctor


class AppointmentSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Appointment


class PatientSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Patient


class DoctorSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Doctor
