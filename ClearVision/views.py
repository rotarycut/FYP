from datetime import timedelta
from django.contrib.auth.decorators import login_required
from django.contrib.auth.views import logout_then_login
from django.db.models import Count
from django.shortcuts import render
from django.template import Context
from django.views.decorators.csrf import csrf_exempt
import django_filters
from rest_framework.renderers import JSONRenderer
from .serializers import *
from rest_framework import filters
from rest_framework import generics, viewsets
from rest_framework.response import Response

@login_required
def success(request):
    response = "Hello " + request.user.username + ". You're at the Clearvision home page and successfully logged in."
    context = Context({
        'message': response,
    })
    return render(request, 'success.html', context)
def header(request):
    return render(request, 'header.html')
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
    renderer_classes = (JSONRenderer,)
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
    renderer_classes = (JSONRenderer,)
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    filter_backends = (filters.DjangoFilterBackend, filters.SearchFilter, )
    filter_class = AppointmentFilter

# API for Appointment to Create, Update & Delete
class AppointmentWriter(viewsets.ModelViewSet):
    #renderer_classes = (JSONRenderer,)
    queryset = Appointment.objects.all()
    serializer_class = AppointmentMakerSerializer

    def destroy(self, request, *args, **kwargs):
        p = Patient.objects.get(contact=request.query_params.get('contact'))
        a = Appointment.objects.get(id=self.get_object().id)
        a.patients.remove(p)
        return Response("Patient Removed")

# API for iScheduling
class GetEarliestBlankAppointmentSlot(viewsets.ModelViewSet):
    #renderer_classes = (JSONRenderer,)
    queryset = Appointment.objects.filter(start__lte=datetime.now()+timedelta(days=5))
    serializer_class = AppointmentFinderSerializer
