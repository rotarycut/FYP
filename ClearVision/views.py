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
from django.db.models import Q, F, FloatField, Max, Avg, Sum, Min, Case, When, CharField, Value, IntegerField, \
    NullBooleanField
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

def waitlist(request):
    return render(request, 'waitlist.html')


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
    # renderer_classes = (JSONRenderer,)
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer
    filter_backends = (filters.DjangoFilterBackend, filters.SearchFilter,)
    search_fields = ('=contact',)


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
    filter_backends = (filters.DjangoFilterBackend, filters.SearchFilter,)
    search_fields = ('name',)
    filter_class = ClinicFilter


# API for Staff

class StaffFilter(django_filters.FilterSet):
    class Meta:
        model = Staff


class StaffList(viewsets.ModelViewSet):
    renderer_classes = (JSONRenderer,)
    queryset = Staff.objects.all()
    serializer_class = StaffSerializer
    filter_backends = (filters.DjangoFilterBackend, filters.SearchFilter,)
    search_fields = ('name',)
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
    filter_backends = (filters.DjangoFilterBackend, filters.SearchFilter,)
    search_fields = ('name',)
    filter_class = DoctorFilter


# API for Appointment

class AppointmentFilter(django_filters.FilterSet):
    appt_time_range_start = django_filters.TimeFilter(name="start", lookup_type='lte')
    appt_time_range_end = django_filters.TimeFilter(name="start", lookup_type='gte')

    class Meta:
        model = Appointment
        fields = ['patients', 'doctor__name', 'clinic', 'appt_time_range_start', 'appt_time_range_end', 'apptType']


class AppointmentList(viewsets.ModelViewSet):
    # renderer_classes = (JSONRenderer,)
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    filter_backends = (filters.DjangoFilterBackend, filters.SearchFilter,)
    filter_class = AppointmentFilter
    search_fields = ('^patients__contact', '^patients__name')


# API for Appointment to Create, Update & Delete
class AppointmentWriter(viewsets.ModelViewSet):
    # renderer_classes = (JSONRenderer,)
    queryset = Appointment.objects.all()
    serializer_class = AppointmentMakerSerializer

    def destroy(self, request, *args, **kwargs):
        data = request.DATA
        num_patients = Appointment.objects.get(id=self.get_object().id).patients.count()

        num_temp_patients = Appointment.objects.get(id=self.get_object().id).tempPatients.count()
        temp_patients = Appointment.objects.get(id=self.get_object().id).tempPatients.values("name", "contact", )

        p = Patient.objects.get(contact=data.get('contact'))
        a = Appointment.objects.get(id=self.get_object().id)
        a.patients.remove(p)
        a.save()

        if num_patients == 1:
            a.delete()
            return Response({})
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
        # isWaitingList = data.get('waitingListFlag')
        remarks = data.get('remarks')

        if not Patient.objects.filter(contact=patientContact).exists():
            Patient.objects.create(name=patientName, gender=patientGender, contact=patientContact,
                                   marketingChannelId=MarketingChannels.objects.get(id=marketingID),
                                   registrationDate=datetime.now())

        p = Patient.objects.get(contact=patientContact)
        apptTimeBucketID = AvailableTimeSlots.objects.filter(start=apptTimeBucket)

        if Appointment.objects.filter(date=apptDate, timeBucket__start=apptTimeBucket, apptType=apptType).exists():
            existingAppt = Appointment.objects.get(date=apptDate, timeBucket=apptTimeBucketID, apptType=apptType)
            existingAppt.patients.add(p)
            existingAppt.save()

            AppointmentRemarks.objects.create(patient=p, appointment=existingAppt, remarks=remarks).save()

            serializedExistingAppt = AppointmentSerializer(existingAppt)

            return Response(serializedExistingAppt.data)

        else:

            Appointment.objects.create(type=apptType, date=apptDate, doctor=Doctor.objects.get(id=docID),
                                       clinic=Clinic.objects.get(id=clinicID),
                                       timeBucket=AvailableTimeSlots.objects.get(id=apptTimeBucketID)).patients.add(p)

            existingAppt = Appointment.objects.get(date=apptDate, timeBucket=apptTimeBucketID, apptType=apptType)
            AppointmentRemarks.objects.create(patient=p, appointment=existingAppt, remarks=remarks).save()
            serializedExistingAppt = AppointmentSerializer(existingAppt)

            return Response(serializedExistingAppt.data)

    def update(self, request, *args, **kwargs):
        data = request.DATA
        futureApptDate = data.get('replacementApptDate')
        futureApptTimeBucket = data.get('replacementApptTime') + ":00"
        currentAppt = Appointment.objects.get(id=self.get_object().id)
        patient = Patient.objects.get(contact=data.get('contact'))
        apptType = data.get('type')
        docID = data.get('docID')
        clinicID = data.get('clinicID')
        newRemarks = data.get('remarks')

        currentAppt.patients.remove(patient)
        currentAppt.save()
        oldRemarks = AppointmentRemarks.objects.get(appointment=currentAppt.id, patient=patient.contact)

        if currentAppt.patients.count() == 0:
            currentAppt.delete()
        apptTimeBucketID = AvailableTimeSlots.objects.filter(start=futureApptTimeBucket)

        if Appointment.objects.filter(date=futureApptDate, timeBucket__start=futureApptTimeBucket,
                                      apptType=apptType).exists():
            existingFutureAppt = Appointment.objects.get(date=futureApptDate, timeBucket=apptTimeBucketID,
                                                         apptType=apptType)
            existingFutureAppt.patients.add(patient)
            existingFutureAppt.save()

            oldRemarks.appointment = existingFutureAppt
            oldRemarks.remarks = newRemarks
            oldRemarks.save()

            serializedExistingFutureAppt = AppointmentSerializer(existingFutureAppt)

            return Response(serializedExistingFutureAppt.data)
        else:

            Appointment.objects.create(apptType=apptType, date=futureApptDate, doctor=Doctor.objects.get(id=docID),
                                       clinic=Clinic.objects.get(id=clinicID),
                                       timeBucket=AvailableTimeSlots.objects.get(id=apptTimeBucketID)).patients.add(
                patient)
            existingFutureAppt = Appointment.objects.get(date=futureApptDate, timeBucket=apptTimeBucketID,
                                                         apptType=apptType)

            oldRemarks.appointment = existingFutureAppt
            oldRemarks.remarks = newRemarks
            oldRemarks.save()

            serializedExistingFutureAppt = AppointmentSerializer(existingFutureAppt)
            return Response(serializedExistingFutureAppt.data)


# API for iScheduling
class AppointmentIScheduleFinder(viewsets.ReadOnlyModelViewSet):
    # queryset = AvailableTimeSlots.objects.annotate(num_patients=Count('appointment__patients')).\
    #   filter(Q(appointment__isnull=True) | Q(num_patients__lt=5))
    # serializer_class = AppointmentIScheduleFinderSerializer

    queryset = FullYearCalendar.objects.none()

    def list(self, request, *args, **kwargs):

        limit = int(request.query_params.get('limit'))
        daysAhead = int(request.query_params.get('daysAhead'))
        type = request.query_params.get('timeslotType')
        upperB = request.query_params.get('upperB')
        lowerB = request.query_params.get('lowerB')
        docID = request.query_params.get('docID')

        if lowerB is None:
            lowerB = 0

        response_data = FullYearCalendar.objects.filter(date__lte=datetime.now()+timedelta(days=daysAhead), date__gte=datetime.now(), availabletimeslots__timeslotType=type).\
                        annotate(title=Count('availabletimeslots__appointment__patients')).\
                        annotate(timeslotType=F('availabletimeslots__timeslotType')).\
                        annotate(start=F('availabletimeslots__start')).\
                        annotate(end=F('availabletimeslots__end')).\
                        filter(title__lte=upperB, title__gte=lowerB,).\
                        values().order_by('title')[:limit]

        for eachObj in response_data:
                eachObj['start'] = str(eachObj['date']) + " " + str(eachObj['start'])
                eachObj['end'] = str(eachObj['date']) + " " + str(eachObj['end'])
                eachObj['title'] = str(eachObj['title']) + " Patient(s)"

        return Response(response_data)

class AnalyticsServer(viewsets.ReadOnlyModelViewSet):
    queryset = Patient.objects.none()

    def list(self, request, *args, **kwargs):
        channel = request.query_params.get('channel')
        month = request.query_params.get('month')

        if channel == 'all':
            response_data = Patient.objects.filter(registrationDate__month=month). \
                annotate(channelname=F('marketingChannelId__name')).values('channelname'). \
                annotate(leads=Count('channelname')).order_by('leads'). \
                annotate(
                convert=Sum(
                    Case(When(conversion=True, then=1), When(conversion=False, then=0), output_field=IntegerField())
                )
                )

            for eachObj in response_data:
                leads = eachObj['leads']
                convert = eachObj['convert']
                rate = convert / leads
                eachObj['rate'] = rate

            return Response(response_data)

        elif not Patient.objects.filter(marketingChannelId__name=channel, registrationDate__month=month).exists():
            return Response({'Name': "DoesNotExist", 'Leads': 0, 'Conversion': 0, 'Rate': 0})
        else:
            response_data = Patient.objects.filter(registrationDate__month=month, marketingChannelId__name=channel). \
                annotate(leads=Count('channelname')).order_by('leads'). \
                annotate(
                convert=Sum(
                    Case(When(conversion=True, then=1), When(conversion=False, then=0), output_field=IntegerField())
                )
            )
            return Response(response_data)


class RemarksFinder(viewsets.ReadOnlyModelViewSet):
    queryset = AppointmentRemarks.objects.none()

    def list(self, request, *args, **kwargs):
        patientID = request.query_params.get('patient')
        apptID = request.query_params.get('appt')

        response_data = AppointmentRemarks.objects.get(patient=patientID, appointment=apptID)

        serialized_response_data = RemarksSerializer(response_data)
        return Response(serialized_response_data.data)

class AppointmentHeatMap(viewsets.ReadOnlyModelViewSet):
    queryset = FullYearCalendar.objects.none()

    def list(self, request, *args, **kwargs):
        limit = int(request.query_params.get('limit'))
        monthsAhead = int(request.query_params.get('monthsAhead'))
        type = request.query_params.get('timeslotType')
        upperB = request.query_params.get('upperB')
        lowerB = request.query_params.get('lowerB')

        response_data = FullYearCalendar.objects.filter(date__lte=datetime.now()+timedelta(days=monthsAhead*30), date__gte=datetime.now(), availabletimeslots__timeslotType=type).\
                        annotate(title=Count('availabletimeslots__appointment__patients')).\
                        annotate(timeslotType=F('availabletimeslots__timeslotType')).\
                        annotate(start=F('availabletimeslots__start')).\
                        annotate(end=F('availabletimeslots__end')).\
                        filter(title__lte=upperB, title__gte=lowerB,).\
                        values().order_by('title')[:limit]

        for eachObj in response_data:
            eachObj['start'] = str(eachObj['date']) + " " + str(eachObj['start'])
            eachObj['end'] = str(eachObj['date']) + " " + str(eachObj['end'])
            eachObj['title'] = str(eachObj['title']) + " Patient(s)"

        return Response(response_data)

class AvaliableTimeSlots(viewsets.ReadOnlyModelViewSet):
    queryset = AvailableTimeSlots.objects.none()
    def list(self, request, *args, **kwargs):
        response_data = AvailableTimeSlots.objects.get(date='2015-08-14', start='11:30:00', timeslotType='Screening').id
        return HttpResponse(response_data)