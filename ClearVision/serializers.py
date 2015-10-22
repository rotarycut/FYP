from swampdragon.serializers.model_serializer import ModelSerializer

__author__ = 'sherman'
from rest_framework import serializers

from ClearVision.models import *


class PatientSerializer(serializers.ModelSerializer):

    marketingname = serializers.SerializerMethodField()

    class Meta:
        model = Patient
        fields = ('name', 'contact', 'marketingname', 'id', 'marketingChannelId')

    def get_marketingname(self, patient):
        return str(patient.marketingChannelId.name)

class ClinicSerializer(serializers.ModelSerializer):
    Monday = serializers.SerializerMethodField()
    Tuesday = serializers.SerializerMethodField()
    Wednesday = serializers.SerializerMethodField()
    Thursday = serializers.SerializerMethodField()
    Friday = serializers.SerializerMethodField()
    Saturday = serializers.SerializerMethodField()

    class Meta:
        model = Clinic
        fields = ('id', 'name', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday')

    def get_Monday(self, clinic):
        return [clinic.mondayStart, clinic.mondayEnd]

    def get_Tuesday(self, clinic):
        return [clinic.tuesdayStart, clinic.tuesdayEnd]

    def get_Wednesday(self, clinic):
        return [clinic.wednesdayStart, clinic.wednesdayEnd]

    def get_Thursday(self, clinic):
        return [clinic.thursdayStart, clinic.thursdayEnd]

    def get_Friday(self, clinic):
        return [clinic.fridayStart, clinic.fridayEnd]

    def get_Saturday(self, clinic):
        return [clinic.saturdayStart, clinic.saturdayEnd]

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
        depth = 1
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

class BlacklistSerializer(serializers.ModelSerializer):

    class Meta:
        model = Blacklist
        depth = 1

class SwapperSerializer(serializers.ModelSerializer):

    class Meta:
        model = Swapper
        depth = 1

class CustomFilterApptTypeSerializer(serializers.ModelSerializer):

    class Meta:
        model = CustomFilterApptType
        depth = 1

class CustomFilterMarketingChannelSerializer(serializers.ModelSerializer):

    class Meta:
        model = CustomFilterMarketingChannel
        depth = 1

class CustomFilterROISerializer(serializers.ModelSerializer):

    class Meta:
        model = CustomFilterROI
        depth = 1

class CalendarBlockerSerializer(serializers.ModelSerializer):

    class Meta:
        model = BlockDates
        depth = 1

class InputMarketingChannelCostSerializer(serializers.ModelSerializer):

    class Meta:
        model = MarketingChannels
        depth = 1

class DoctorTimeSlotSerializer(serializers.ModelSerializer):

    class Meta:
        model = DoctorDayTimeSlots
        depth = 1

class CalendarColorSettingsSerializer(serializers.ModelSerializer):

    class Meta:
        model = CalendarColorSettings
        depth = 1

class HeatMapColorSettingsSerializer(serializers.ModelSerializer):

    class Meta:
        model = HeatMapColorSettings
        depth = 1
