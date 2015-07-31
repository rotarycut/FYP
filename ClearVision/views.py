from datetime import timedelta
import json
from django.contrib.auth.decorators import login_required
from django.contrib.auth.views import logout_then_login
from django.http import HttpResponse
from django.shortcuts import render
from django.template import Context
from django.views.decorators.csrf import csrf_exempt
import django_filters
from rest_framework.renderers import JSONRenderer
from .serializers import *
from rest_framework import filters
from rest_framework import generics, viewsets
from rest_framework.response import Response
from django.db.models import Q
from django.core.exceptions import ObjectDoesNotExist


@login_required
def success(request):
    response = "Hello " + request.user.username + ". You're at the Clearvision home page and successfully logged in."
    context = Context({
        'message': response,
    })
    return render(request, 'success.html', context)
def header(request):
    return render(request, 'header.html')
def calendar(request):
    return render(request, 'calendar.html')
def dashboard(request):
    return render(request, 'dashboard.html')
def logout(request):
    return logout_then_login(request, 'login')

# API for Patients
class PatientFilter(django_filters.FilterSet):
    min_id = django_filters.NumberFilter(name="marketingChannelId", lookup_type='gte')
    max_id = django_filters.NumberFilter(name="marketingChannelId", lookup_type='lte')

    class Meta:
        model = Patient
        fields = ['gender', 'min_id', 'max_id']

class PatientList(viewsets.ModelViewSet):
    #renderer_classes = (JSONRenderer,)
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer
    filter_backends = (filters.DjangoFilterBackend,)
    filter_class = PatientFilter


# API for Clinics
class ClinicFilter(django_filters.FilterSet):
    start_time = django_filters.TimeFilter(name="startHr", lookup_type='lte')
    end_time = django_filters.TimeFilter(name="endHr", lookup_type='gte')

    class Meta:
        model = Clinic
        fields = ['start_time', 'end_time']

class ClinicList(viewsets.ModelViewSet):
    renderer_classes = (JSONRenderer,)
    queryset = Clinic.objects.all()
    serializer_class = ClinicSerializer
    filter_backends = (filters.DjangoFilterBackend, filters.SearchFilter, )
    search_fields = ('name', )
    filter_class = ClinicFilter

# API for Staff

class StaffFilter(django_filters.FilterSet):

    class Meta:
        model = Staff

class StaffList(viewsets.ModelViewSet):
    renderer_classes = (JSONRenderer,)
    queryset = Staff.objects.all()
    serializer_class = StaffSerializer
    filter_backends = (filters.DjangoFilterBackend, filters.SearchFilter, )
    search_fields = ('name', )
    filter_class = StaffFilter


# API for Doctor

class DoctorFilter(django_filters.FilterSet):

    class Meta:
        model = Doctor
        fields = ['contact', 'phoneModel', 'clinic']

class DoctorList(viewsets.ModelViewSet):
    renderer_classes = (JSONRenderer,)
    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer
    filter_backends = (filters.DjangoFilterBackend, filters.SearchFilter, )
    search_fields = ('name', )
    filter_class = DoctorFilter


# API for Appointment

class AppointmentFilter(django_filters.FilterSet):
    appt_time_range_start = django_filters.TimeFilter(name="start", lookup_type='lte')
    appt_time_range_end = django_filters.TimeFilter(name="start", lookup_type='gte')

    class Meta:
        model = Appointment
        fields = ['patients', 'doctor__name', 'clinic', 'appt_time_range_start', 'appt_time_range_end', 'type']

class AppointmentList(viewsets.ModelViewSet):
    #renderer_classes = (JSONRenderer,)
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    filter_backends = (filters.DjangoFilterBackend, filters.SearchFilter, )
    filter_class = AppointmentFilter
    search_fields = ('^patients__contact',)

# API for Appointment to Create, Update & Delete
class AppointmentWriter(viewsets.ModelViewSet):
    #renderer_classes = (JSONRenderer,)
    queryset = Appointment.objects.all()
    serializer_class = AppointmentMakerSerializer

    def destroy(self, request, *args, **kwargs):
        data = request.DATA
        num_patients = Appointment.objects.get(id=self.get_object().id).patients.count()

        num_temp_patients = Appointment.objects.get(id=self.get_object().id).tempPatients.count()
        temp_patients = Appointment.objects.get(id=self.get_object().id).tempPatients.values("name", "contact",)

        p = Patient.objects.get(contact=data.get('contact'))
        a = Appointment.objects.get(id=self.get_object().id)
        a.patients.remove(p)
        a.save()

        if num_patients == 1:
            a.delete()
            return Response("{}")
        elif num_patients <= 5 and num_temp_patients >= 1:
            return Response("Inform Swap Possible for " + str(temp_patients))
        else:
            serializedExistingAppt = AppointmentSerializer(a)
            return Response(serializedExistingAppt.data)

    def create(self, request, *args, **kwargs):
        data = request.DATA

        apptDate = data.get('date')
        apptTimeBucket = data.get('time') + ":00"
        apptType = data.get('type')
        docID = data.get('docID')
        clinicID = data.get('clinicID')
        patientContact = data.get('contact')
        patientName = data.get('name')
        patientGender = data.get('gender')
        marketingID = data.get('channelID')
        isWaitingList = data.get('waitingListFlag')

        if not Patient.objects.filter(contact=patientContact).exists():

            Patient.objects.create(name=patientName, gender=patientGender, contact=patientContact,
                                   marketingChannelId=MarketingChannels.objects.get(id=marketingID))

        p = Patient.objects.get(contact=patientContact)
        apptTimeBucketID = AvailableTimeSlots.objects.filter(start=apptTimeBucket)

        if Appointment.objects.filter(date=apptDate, timeBucket__start=apptTimeBucket, type=apptType).exists():
            existingAppt = Appointment.objects.get(date=apptDate, timeBucket=apptTimeBucketID, type=apptType)
            existingAppt.patients.add(p)
            existingAppt.save()

            if existingAppt.patients.count() > 5:
                return Response("Number of patients exceeded 5")

            serializedExistingAppt = AppointmentSerializer(existingAppt)

            return Response(serializedExistingAppt.data)

        else:

            Appointment.objects.create(type=apptType, date=apptDate, doctor=Doctor.objects.get(id=docID),
                                       clinic=Clinic.objects.get(id=clinicID),
                                       timeBucket=AvailableTimeSlots.objects.get(id=apptTimeBucketID)).patients.add(p)

            existingAppt = Appointment.objects.get(date=apptDate, timeBucket=apptTimeBucketID, type=apptType)
            serializedExistingAppt = AppointmentSerializer(existingAppt)

            return Response(serializedExistingAppt.data)

    def update(self, request, *args, **kwargs):
        data=request.DATA
        futureApptDate = data.get('replacementApptDate')
        futureApptTimeBucket = data.get('replacementApptTime') + ":00"
        currentAppt = Appointment.objects.get(id=self.get_object().id)
        patient = Patient.objects.get(contact=data.get('contact'))
        apptType=data.get('type')
        docID=data.get('docID')
        clinicID=data.get('clinicID')

        currentAppt.patients.remove(patient)
        currentAppt.save()

        if currentAppt.patients.count() == 0:
            currentAppt.delete()

        apptTimeBucketID = AvailableTimeSlots.objects.filter(start=futureApptTimeBucket)

        if Appointment.objects.filter(date=futureApptDate, timeBucket__start=futureApptTimeBucket, type=apptType).exists():
            existingFutureAppt = Appointment.objects.get(date=futureApptDate, timeBucket=apptTimeBucketID, type=apptType)
            existingFutureAppt.patients.add(patient)
            existingFutureAppt.save()
            serializedExistingFutureAppt = AppointmentSerializer(existingFutureAppt)
            return Response(serializedExistingFutureAppt.data)
        else:

            Appointment.objects.create(type=apptType, date=futureApptDate, doctor=Doctor.objects.get(id=docID),
                                       clinic=Clinic.objects.get(id=clinicID),
                                       timeBucket=AvailableTimeSlots.objects.get(id=apptTimeBucketID)).patients.add(patient)
            existingFutureAppt = Appointment.objects.get(date=futureApptDate, timeBucket=apptTimeBucketID, type=apptType)

            serializedExistingFutureAppt = AppointmentSerializer(existingFutureAppt)
            return Response(serializedExistingFutureAppt.data)


# API for iScheduling
class AppointmentIScheduleFinder(viewsets.ModelViewSet):
    #renderer_classes = (JSONRenderer,)

    #queryset = AvailableTimeSlots.objects.annotate(num_patients=Count('appointment__patients'))\
    #   .filter(Q(appointment__isnull=True) | Q(num_patients__lt=5))

    queryset = Appointment.objects.annotate(num_patients=Count('patients'))\
        .filter(num_patients__lt=5, date__lte=datetime.now()+timedelta(days=5))\
        .order_by('num_patients')

    serializer_class = AppointmentIScheduleFinderSerializer

"""
class AppointmentIScheduleSwap(viewsets.ModelViewSet):
    #renderer_classes = (JSONRenderer,)
    queryset = Appointment.objects.annotate(num_patients=Count('patients')).filter(num_patients__lt=5)
    serializer_class = AppointmentIScheduleSwapSerializer

    def update(self, request, *args, **kwargs):
        patient = Patient.objects.get(contact=request.query_params.get('patientContact'))
        patientInQueue = Patient.objects.get(contact=request.query_params.get('tempPatientContact'))
        a = Appointment.objects.get(id=self.get_object().id)
        a.patients.remove(patient)
        a.patients.add(patientInQueue)
        a.tempPatients.remove(patientInQueue)
        a.save()
        return Response("Patient Swapped")

    def update(self, request, *args, **kwargs):
        patientInQueue = Patient.objects.get(contact=request.query_params.get('tempPatientContact'))
        a = Appointment.objects.get(id=self.get_object().id)
        a.patients.add(patientInQueue)
        a.tempPatients.remove(patientInQueue)
        a.save()
        return Response("Patient Swapped")

class AnalyticsFilter(django_filters.FilterSet):

    class Meta:
        model = Patient
        fields = ['name', 'contact']
"""

class AnalyticsServer(viewsets.ReadOnlyModelViewSet):
    queryset = Patient.objects

    def list(self, request, *args, **kwargs):
        channel = request.query_params.get('channel')
        month = request.query_params.get('month')
        if not Patient.objects.filter(marketingChannelId__name=channel, registrationDate__month=month).exists():
            return Response({'Name': "DoesNotExist", 'Leads': 0, 'Conversion': 0, 'Rate': 0})
        else:
            leads = Patient.objects.filter(marketingChannelId__name=channel).distinct().count()
            conversion = Patient.objects.filter(marketingChannelId__name=channel, conversion=True).count()
            rate = conversion/leads
            response_data = {'Name': channel, 'Leads': leads, 'Conversion': conversion, 'Rate': rate}
            return Response(response_data)
