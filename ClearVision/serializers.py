__author__ = 'sherman'
from rest_framework import serializers
from ClearVision.models import *

class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient

class ClinicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Clinic
