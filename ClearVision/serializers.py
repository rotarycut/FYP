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
    Days = serializers.SerializerMethodField()

    class Meta:
        model = Clinic
        fields = ('id', 'name', 'Days')

    def get_Days(self, clinic):
        return [
            {"day": "Monday", "start": clinic.mondayStart.strftime('%H:%M'), "end": clinic.mondayEnd.strftime('%H:%M')},
            {"day": "Tuesday", "start": clinic.tuesdayStart.strftime('%H:%M'), "end": clinic.tuesdayEnd.strftime('%H:%M')},
            {"day": "Wednesday", "start": clinic.wednesdayStart.strftime('%H:%M'), "end": clinic.wednesdayEnd.strftime('%H:%M')},
            {"day": "Thursday", "start": clinic.thursdayStart.strftime('%H:%M'), "end": clinic.thursdayEnd.strftime('%H:%M')},
            {"day": "Friday", "start": clinic.fridayStart.strftime('%H:%M'), "end": clinic.fridayEnd.strftime('%H:%M')},
            {"day": "Saturday", "start": clinic.saturdayStart.strftime('%H:%M'), "end": clinic.saturdayEnd.strftime('%H:%M')},

        ]

class StaffSerializer(serializers.ModelSerializer):
    class Meta:
        model = Staff

class DoctorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Doctor
        depth = 3

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

class ApptTypesSerializer(serializers.ModelSerializer):

    class Meta:
        model = AppointmentType
        depth = 1

class CalendarTimeRangeSerializer(serializers.ModelSerializer):

    class Meta:
        model = CalendarTimeRange
        depth = 1

class SMSApptReminderSerializer(serializers.ModelSerializer):

    class Meta:
        model = DaysAheadReminderSMS
        depth = 1