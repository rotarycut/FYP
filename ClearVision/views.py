import base64
from datetime import timedelta, datetime
import json
from operator import itemgetter

import requests
from django.contrib.auth.decorators import login_required
from django.contrib.auth.views import logout_then_login
from django.http import HttpResponse
from django.shortcuts import render
from django.template import Context
import django_filters
from rest_framework.renderers import JSONRenderer
from rest_framework import filters
from rest_framework import viewsets
from rest_framework.response import Response
from django.db.models import Q, F, Sum, Case, When, IntegerField, Count
from django_socketio import broadcast, broadcast_channel, NoSocket
from .serializers import *


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


def roi(request):
    return render(request, 'roi.html')

def schedule(request):
    return render(request, 'schedule.html')

def waitlist(request):
    return render(request, 'waitlist.html')

def queue(request):
    return render(request, 'queue.html')

def msglog(request):
    return render(request, 'msglog.html')

def changepw(request):
    return render(request, 'registration/changepw.html')


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
    queryset = Appointment.objects.exclude(patients=None).all()
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
        data = request.data
        p = Patient.objects.get(id=data.get('id'))

        a = Appointment.objects.get(id=self.get_object().id)
        num_patients = a.patients.count()

        num_temp_patients = a.tempPatients.count()
        temp_patients = Appointment.objects.get(id=self.get_object().id).tempPatients.values()

        a.patients.remove(p)
        a.save()

        associatedPActions = AssociatedPatientActions.objects.get(appointment=a, patient=p)
        associatedPActions.cancelled = True
        associatedPActions.cancellationReason = CancellationReason.objects.get(id=data.get('cancellationReasonID'))
        associatedPActions.save()

        tempApptSwapperObj = Swapper.objects.filter(patient=p, scheduledAppt=a,)

        # Check whether deleted patient is queued for any other appointments in the tempPatients queue
        if tempApptSwapperObj:
            tempApptSwapperObj.delete()

            getTempApptId = Patient.objects.filter(id=data.get('id')).annotate(tempApptId=F('tempPatients__timeBucket_id__appointment__id')).values()

            if getTempApptId is not None:
                for eachObj in getTempApptId:
                    tempApptId = int(eachObj['tempApptId'])
                tempAppt = Appointment.objects.get(id=tempApptId)

                tempAppt.tempPatients.remove(p)
                tempAppt.save()
        """
        if num_patients == 1:
            a.delete()
        """
        # Inform potential patients in the tempPatients queue, to push into notification basket
        if num_temp_patients >= 1:
            Swapper.objects.filter(patient=temp_patients[0]['id'], tempAppt=a).update(swappable=True)

            response_data = Swapper.objects.filter(patient=temp_patients[0]['id'], tempAppt=a). \
                annotate(patientname=F('patient__name')). \
                annotate(scheduledApptDate=F('scheduledAppt__timeBucket_id__date')). \
                annotate(scheduledApptStart=F('scheduledAppt__timeBucket_id__start')). \
                annotate(scheduledApptDay=F('scheduledAppt__timeBucket_id__date__day')). \
                annotate(tempApptDate=F('tempAppt__timeBucket_id__date')). \
                annotate(tempApptStart=F('tempAppt__timeBucket_id__start')). \
                annotate(tempApptDay=F('tempAppt__timeBucket_id__date__day')). \
                exclude(swappable=False). \
                values('patientname', 'scheduledApptDate', 'scheduledApptStart', 'tempApptDate', 'tempApptStart',
                       'scheduledApptDay', 'tempApptDay', 'swappable')

            return Response(response_data)
        return Response({})

        # else:
        # serializedExistingAppt = AppointmentSerializer(a)
        # return Response(serializedExistingAppt.data)

    def create(self, request, *args, **kwargs):
        data = request.data

        apptDate = data.get('date')
        apptTimeBucket = data.get('time') + ":00"
        apptType = data.get('apptType')
        docID = data.get('docID')
        clinicID = data.get('clinicID')
        patientContact = data.get('contact')
        patientName = data.get('name')
        patientGender = data.get('gender')
        marketingID = data.get('channelID')
        isWaitingList = data.get('waitingListFlag')
        remarks = data.get('remarks')

        if data.get('tempTime') and data.get('tempDate') is not "" and isWaitingList == 'True':
            tempApptTimeBucket = data.get('tempTime') + ":00"
            tempApptDate = data.get('tempDate')

        if not Patient.objects.filter(contact=patientContact, name=patientName).exists():
            Patient.objects.create(name=patientName, gender=patientGender, contact=patientContact,
                                   marketingChannelId=MarketingChannels.objects.get(id=marketingID),
                                   registrationDate=datetime.now())

        p = Patient.objects.get(contact=patientContact, name=patientName)
        apptTimeBucketID = AvailableTimeSlots.objects.get(start=apptTimeBucket, timeslotType=apptType, date=apptDate).id

        if Appointment.objects.filter(date=apptDate, timeBucket__start=apptTimeBucket, apptType=apptType).exists():

            existingAppt = Appointment.objects.get(date=apptDate, timeBucket=apptTimeBucketID, apptType=apptType)

            if existingAppt.patients.filter(contact=patientContact, name=patientName).exists():
                AppointmentRemarks.objects.filter(patient=p, appointment=existingAppt, ).update(remarks=remarks)
                serializedExistingAppt = AppointmentSerializer(existingAppt)
                return Response(serializedExistingAppt.data)

            existingAppt.patients.add(p)
            existingAppt.save()

            AppointmentRemarks.objects.create(patient=p, appointment=existingAppt, remarks=remarks).save()
            AssociatedPatientActions.objects.create(patient=p, appointment=existingAppt)

            serializedExistingAppt = AppointmentSerializer(existingAppt)

            if isWaitingList == 'True':

                tempApptTimeBucketID = AvailableTimeSlots.objects.get(start=tempApptTimeBucket, timeslotType=apptType,
                                                                      date=tempApptDate).id

                if Appointment.objects.filter(date=tempApptDate, timeBucket__start=tempApptTimeBucket,
                                              apptType=apptType).exists():

                    tempExistingAppt = Appointment.objects.get(date=tempApptDate, timeBucket=tempApptTimeBucketID,
                                                               apptType=apptType)
                    tempExistingAppt.tempPatients.add(p)
                    tempExistingAppt.save()

                    Swapper.objects.create(patient=p, scheduledAppt=existingAppt, tempAppt=tempExistingAppt,
                                           swappable=False, hasRead=False).save()
                    AppointmentRemarks.objects.create(patient=p, appointment=tempExistingAppt, remarks=remarks).save()
                else:

                    Appointment.objects.create(apptType=apptType, date=tempApptDate,
                                               doctor=Doctor.objects.get(id=docID),
                                               clinic=Clinic.objects.get(id=clinicID),
                                               timeBucket=AvailableTimeSlots.objects.get(
                                                   id=tempApptTimeBucketID)).tempPatients.add(p)

                    tempExistingAppt = Appointment.objects.get(date=tempApptDate, timeBucket=tempApptTimeBucketID,
                                                               apptType=apptType)

                    Swapper.objects.create(patient=p, scheduledAppt=existingAppt, tempAppt=tempExistingAppt,
                                           swappable=False, hasRead=False).save()
                    AppointmentRemarks.objects.create(patient=p, appointment=tempExistingAppt, remarks=remarks).save()
                django_socketio.broadcast(serializedExistingAppt.data)
            return Response(serializedExistingAppt.data)

        else:

            Appointment.objects.create(apptType=apptType, date=apptDate, doctor=Doctor.objects.get(id=docID),
                                       clinic=Clinic.objects.get(id=clinicID),
                                       timeBucket=AvailableTimeSlots.objects.get(id=apptTimeBucketID)).patients.add(p)

            existingAppt = Appointment.objects.get(date=apptDate, timeBucket=apptTimeBucketID, apptType=apptType)
            AppointmentRemarks.objects.create(patient=p, appointment=existingAppt, remarks=remarks).save()
            AssociatedPatientActions.objects.create(patient=p, appointment=existingAppt)

            if isWaitingList == 'True':

                tempApptTimeBucketID = AvailableTimeSlots.objects.get(start=tempApptTimeBucket, timeslotType=apptType,
                                                                      date=tempApptDate).id

                if Appointment.objects.filter(date=tempApptDate, timeBucket__start=tempApptTimeBucket,
                                              apptType=apptType).exists():

                    tempExistingAppt = Appointment.objects.get(date=tempApptDate, timeBucket=tempApptTimeBucketID,
                                                               apptType=apptType)
                    tempExistingAppt.tempPatients.add(p)
                    tempExistingAppt.save()

                    Swapper.objects.create(patient=p, scheduledAppt=existingAppt, tempAppt=tempExistingAppt,
                                           swappable=False, hasRead=False).save()
                    AppointmentRemarks.objects.create(patient=p, appointment=tempExistingAppt, remarks=remarks).save()
                else:

                    Appointment.objects.create(apptType=apptType, date=tempApptDate,
                                               doctor=Doctor.objects.get(id=docID),
                                               clinic=Clinic.objects.get(id=clinicID),
                                               timeBucket=AvailableTimeSlots.objects.get(
                                                   id=tempApptTimeBucketID)).tempPatients.add(p)

                    tempExistingAppt = Appointment.objects.get(date=tempApptDate, timeBucket=tempApptTimeBucketID,
                                                               apptType=apptType)

                    Swapper.objects.create(patient=p, scheduledAppt=existingAppt, tempAppt=tempExistingAppt,
                                           swappable=False, hasRead=False).save()
                    AppointmentRemarks.objects.create(patient=p, appointment=tempExistingAppt, remarks=remarks).save()

            serializedExistingAppt = AppointmentSerializer(existingAppt)

            return Response(serializedExistingAppt.data)

    def update(self, request, *args, **kwargs):
        data = request.data
        futureApptDate = data.get('replacementApptDate')
        futureApptTimeBucket = data.get('replacementApptTime') + ":00"
        currentAppt = Appointment.objects.get(id=self.get_object().id)
        patient = Patient.objects.get(id=data.get('id'))
        apptType = data.get('type')
        docID = data.get('docID')
        clinicID = data.get('clinicID')
        newRemarks = data.get('remarks')

        currentAppt.patients.remove(patient)
        currentAppt.save()
        oldRemarks = AppointmentRemarks.objects.get(appointment=currentAppt.id, patient=patient.id)

        if currentAppt.patients.count() == 0:
            currentAppt.delete()
        apptTimeBucketID = AvailableTimeSlots.objects.filter(start=futureApptTimeBucket, date=futureApptDate,
                                                             timeslotType=apptType)

        if Appointment.objects.filter(date=futureApptDate, timeBucket__start=futureApptTimeBucket,
                                      apptType=apptType, timeBucket__id=apptTimeBucketID).exists():
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
    queryset = FullYearCalendar.objects.none()

    def list(self, request, *args, **kwargs):

        limit = int(request.query_params.get('limit'))
        daysAhead = int(request.query_params.get('daysAhead'))
        type = request.query_params.get('timeslotType')
        upperB = request.query_params.get('upperB')
        lowerB = request.query_params.get('lowerB')
        docName = request.query_params.get('docName')

        if lowerB is None:
            lowerB = 0

        response_data = FullYearCalendar.objects.filter(date__lte=datetime.now() + timedelta(days=daysAhead),
                                                        date__gte=datetime.now(), availabletimeslots__timeslotType=type,
                                                        availabletimeslots__doctors__name=docName). \
                            annotate(title=Count('availabletimeslots__appointment__patients')). \
                            annotate(timeslotType=F('availabletimeslots__timeslotType')). \
                            annotate(start=F('availabletimeslots__start')). \
                            annotate(end=F('availabletimeslots__end')). \
                            annotate(apptId=F('availabletimeslots__appointment__id')). \
                            filter(title__lte=upperB, title__gte=lowerB, ). \
                            values().order_by('title')[:limit]

        for eachObj in response_data:
            eachObj['start'] = str(eachObj['date']) + " " + str(eachObj['start'])
            eachObj['end'] = str(eachObj['date']) + " " + str(eachObj['end'])
            eachObj['title'] = str(eachObj['title']) + " Patient(s)"

        return Response(response_data)


class AnalyticsServer(viewsets.ReadOnlyModelViewSet):
    queryset = Patient.objects.none()

    def list(self, request, *args, **kwargs):
        timelineFlag = request.query_params.get('timelineFlag')
        filterFlag = request.query_params.get('filterFlag')

        month = request.query_params.get('month')
        channels = request.query_params.get('channels')

        if filterFlag == 'True':
            channels = channels.split(',')

        startDate = request.query_params.get('startDate')
        endDate = request.query_params.get('endDate')

        if filterFlag == 'True':
            if timelineFlag == 'False':
                response_data = Patient.objects.filter(registrationDate__gte=startDate, registrationDate__lte=endDate). \
                    annotate(channelname=F('marketingChannelId__name')).filter(channelname__in=channels).values(
                    'channelname'). \
                    annotate(leads=Count('channelname')).order_by('leads'). \
                    annotate(
                    convert=Sum(
                        Case(When(conversion=True, then=1), When(conversion=False, then=0), output_field=IntegerField())
                    )
                )

                for eachObj in response_data:
                    leads = eachObj['leads']
                    convert = eachObj['convert']
                    rate = float(convert) / float(leads) * 100
                    eachObj['rate'] = rate

                return Response(response_data)

            else:
                marketed_list = Patient.objects.filter(registrationDate__gte=startDate, registrationDate__lte=endDate). \
                    annotate(channelname=F('marketingChannelId__name')).filter(channelname__in=channels).values()
                date_range = FullYearCalendar.objects.filter(date__gte=startDate, date__lte=endDate).values('date')

                marketing_channels = []

                for eachObj in date_range:
                    for eachObj2 in marketed_list:
                        if eachObj['date'] == eachObj2['registrationDate'].date():
                            mktname = eachObj2['channelname']
                            try:
                                eachObj[mktname] += 1
                                if mktname not in marketing_channels:
                                    marketing_channels.append(mktname)
                            except KeyError:
                                eachObj[mktname] = 1
                                if mktname not in marketing_channels:
                                    marketing_channels.append(mktname)

                for eachObj in date_range:
                    for eachChannel in marketing_channels:
                        try:
                            eachObj[eachChannel]
                        except KeyError:
                            eachObj[eachChannel] = 0

                return Response(date_range)
        else:

            if channels == 'all':
                response_data = Patient.objects.filter(registrationDate__month=month). \
                    annotate(channelname=F('marketingChannelId__name')).values(
                    'channelname'). \
                    annotate(leads=Count('channelname')).order_by('leads'). \
                    annotate(
                    convert=Sum(
                        Case(When(conversion=True, then=1), When(conversion=False, then=0), output_field=IntegerField())
                    )
                )

                set_channels = []

                for eachObj in response_data:
                    leads = eachObj['leads']
                    convert = eachObj['convert']
                    rate = float(convert) / float(leads)
                    eachObj['rate'] = rate * 100
                    set_channels.append(eachObj['channelname'])

                response_data = list(response_data)
                allmarketingchannels = list(MarketingChannels.objects.all().values())

                for eachchannel in allmarketingchannels:
                    if eachchannel['name'] not in set_channels:
                        response_data.append({
                            "channelname": eachchannel['name'],
                            "leads": 0,
                            "convert": 0,
                            "rate": 0.0
                        })

                return Response(response_data)

            else:
                marketed_list = Patient.objects.filter(registrationDate__month=month). \
                    annotate(channelname=F('marketingChannelId__name')).values()
                date_range = FullYearCalendar.objects.filter(date__month=month).values('date')

                for eachObj in date_range:
                    for eachObj2 in marketed_list:
                        if eachObj['date'] == eachObj2['registrationDate'].date():
                            mktname = eachObj2['channelname']
                            try:
                                eachObj[mktname] += 1
                            except KeyError:
                                eachObj[mktname] = 1

                date_range = list(date_range)
                allmarketingchannels = list(MarketingChannels.objects.all().values())

                for eachObj in date_range:
                    for eachChannel in allmarketingchannels:
                        try:
                            eachObj[eachChannel['name']]
                        except KeyError:
                            eachObj[eachChannel['name']] = 0

                return Response(date_range)


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
        monthsAhead = int(request.query_params.get('monthsAhead'))
        type = request.query_params.get('timeslotType')
        upperB = request.query_params.get('upperB')
        lowerB = request.query_params.get('lowerB')
        docName = request.query_params.get('docName')

        response_data = FullYearCalendar.objects.filter(date__lte=datetime.now() + timedelta(days=monthsAhead * 30),
                                                        date__gte=datetime.now(),
                                                        availabletimeslots__timeslotType=type,
                                                        availabletimeslots__doctors__name=docName). \
            annotate(title=Count('availabletimeslots__appointment__patients')). \
            annotate(timeslotType=F('availabletimeslots__timeslotType')). \
            annotate(start=F('availabletimeslots__start')). \
            annotate(end=F('availabletimeslots__end')). \
            annotate(apptId=F('availabletimeslots__appointment__id')). \
            filter(title__lte=upperB, title__gte=lowerB, ). \
            values('day', 'date', 'start', 'end', 'apptId', 'timeslotType', 'title').order_by('date', 'start')

        for eachObj in response_data:
            eachObj['start'] = str(eachObj['date']) + " " + str(eachObj['start'])
            eachObj['end'] = str(eachObj['date']) + " " + str(eachObj['end'])
            eachObj['tooltip'] = str(eachObj['title']) + " Patient(s)"
            del eachObj['title']

        return Response(response_data)


class AvaliableTimeSlots(viewsets.ReadOnlyModelViewSet):
    queryset = AvailableTimeSlots.objects.none()

    def list(self, request, *args, **kwargs):
        response_data = AvailableTimeSlots.objects.get(date='2015-09-07', start='15:00:00',
                                                       timeslotType='Surgery', doctors=2).id
        return HttpResponse(response_data)


class iScheduleSwapper(viewsets.ModelViewSet):
    queryset = Patient.objects.none()
    serializer_class = AppointmentSerializer

    def list(self, request, *args, **kwargs):
        temp_response_data = Patient.objects. \
            annotate(canswap=F('swapper__swappable')). \
            annotate(tempApptDate=F('tempPatients__timeBucket_id__date')). \
            annotate(tempApptStart=F('tempPatients__timeBucket_id__start')). \
            annotate(tempApptType=F('tempPatients__timeBucket__timeslotType')). \
            annotate(tempApptDay=F('tempPatients__timeBucket_id__date__day')). \
            annotate(patientname=F('name')). \
            annotate(patientcontact=F('contact')). \
            annotate(doctor=F('tempPatients__timeBucket_id__appointment__doctor__name')). \
            annotate(tempApptId=F('tempPatients__timeBucket_id__appointment__id')). \
            exclude(tempApptDate=None). \
            values('tempApptDate', 'tempApptStart', 'tempApptType', 'tempApptDay', 'doctor', 'patientname',
                   'patientcontact', 'tempApptId', 'canswap')

        scheduled_response_data = Patient.objects. \
            annotate(scheduledApptDate=F('patients__timeBucket_id__date')). \
            annotate(scheduledApptStart=F('patients__timeBucket_id__start')). \
            annotate(scheduledApptType=F('patients__timeBucket__timeslotType')). \
            annotate(scheduledApptDay=F('patients__timeBucket_id__date__day')). \
            annotate(patientcontact=F('contact')). \
            annotate(scheduledApptId=F('patients__timeBucket_id__appointment__id')). \
            exclude(scheduledApptDate=None). \
            values('scheduledApptDate', 'scheduledApptStart', 'scheduledApptType', 'scheduledApptDay', 'patientcontact',
                   'scheduledApptId')

        for eachObj in temp_response_data:
            for eachObj2 in scheduled_response_data:
                if eachObj2['patientcontact'] == eachObj['patientcontact']:
                    try:
                        toAdd = {"scheduledApptId": eachObj2['scheduledApptId'],
                                 "scheduledApptDate": eachObj2['scheduledApptDate'],
                                 "scheduledApptDay": eachObj2['scheduledApptDay'],
                                 "scheduledApptStart": eachObj2['scheduledApptStart']}
                        eachObj['scheduledAppointments'].append(toAdd)
                    except KeyError:
                        eachObj['scheduledAppointments'] = []
                        toAdd = {"scheduledApptId": eachObj2['scheduledApptId'],
                                 "scheduledApptDate": eachObj2['scheduledApptDate'],
                                 "scheduledApptDay": eachObj2['scheduledApptDay'],
                                 "scheduledApptStart": eachObj2['scheduledApptStart']}
                        eachObj['scheduledAppointments'].append(toAdd)

        return Response(temp_response_data)

    def create(self, request, *args, **kwargs):
        data = request.data
        scheduledApptId = data.get('scheduledApptId')
        tempApptId = data.get('tempApptId')
        patientId = data.get('patientId')

        p = Patient.objects.get(id=patientId)
        scheduledAppt = Appointment.objects.get(id=scheduledApptId)
        scheduledAppt.patients.remove(p)
        scheduledAppt.save()

        tempAppt = Appointment.objects.get(id=tempApptId)
        tempAppt.patients.add(p)
        tempAppt.tempPatients.remove(p)
        tempAppt.save()

        Swapper.objects.filter(patient=p, tempAppt=tempAppt, scheduledAppt=scheduledAppt).delete()

        if scheduledAppt.patients.count() == 0:
            scheduledAppt.delete()

        serializedAppt = AppointmentSerializer(tempAppt)
        return Response(serializedAppt.data)


class SearchBarFilter(viewsets.ReadOnlyModelViewSet):
    # renderer_classes = (JSONRenderer,)
    queryset = Patient.objects.none()

    def list(self, request, *args, **kwargs):
        searchstring = request.query_params.get('search')
        limit = request.query_params.get('limit')

        if searchstring is not None:
            response_data = Patient.objects.filter(
                Q(contact__icontains=searchstring) | Q(name__icontains=searchstring)). \
                                annotate(apptId=F('patients__timeBucket__appointment__id')). \
                                annotate(apptType=F('patients__timeBucket__appointment__apptType')). \
                                annotate(apptStart=F('patients__timeBucket__start')). \
                                annotate(apptDate=F('patients__timeBucket__date')). \
                                annotate(doctorname=F('patients__timeBucket__appointment__doctor__name')). \
                                exclude(apptId=None). \
                                values('apptId', 'contact', 'name', 'apptStart', 'apptDate', 'doctorname', 'apptType')[
                            :limit]

            return Response(response_data)
        else:
            response_data = Patient.objects.all().values()
            return Response(response_data)


class ViewSwapperTable(viewsets.ModelViewSet):
    queryset = Swapper.objects.none()
    serializer_class = SwapperSerializer

    def list(self, request, *args, **kwargs):
        response_data = Swapper.objects.all().values('tempAppt__timeBucket__date', 'tempAppt__timeBucket__start',
                                                     'scheduledAppt__timeBucket__date', 'scheduledAppt__timeBucket__start',
                                                     'patient__contact', 'patient_id', 'scheduledAppt__apptType', 'swappable',
                                                     'scheduledAppt__doctor__name', 'patient__name', 'tempAppt_id', 'scheduledAppt_id', 'id')

        return Response(response_data)

    def create(self, request, *args, **kwargs):
        data = request.data

        preferredApptDate = data.get('tempAppt__timeBucket__date')
        preferredApptTime = data.get('tempAppt__timeBucket__start')
        scheduledApptDate = data.get('scheduledAppt__timeBucket__date')
        scheduledApptTime = data.get('scheduledAppt__timeBucket__start')
        patientName = data.get('patient__name')
        apptType = data.get('scheduledAppt__apptType')
        patientContact = data.get('patient__contact')
        swapperID = data.get('swapperID')

        encoded = base64.b64encode('AnthonyS:ClearVision2')
        headers = {'Authorization': 'Basic ' + encoded, 'Content-Type': 'application/json', 'Accept': 'application/json'}
        payload = {'from': 'Clearvision', 'to': '65' + patientContact, 'text': 'Hi ' + patientName +
                ', Swap is possible for ' + apptType.upper() + '.\nPreferred: ' + preferredApptDate + ', ' + preferredApptTime +
                '.\nScheduled: ' + scheduledApptDate + ', ' + scheduledApptTime + '.\nReply swap<<space>>' + str(swapperID) + ' to swap appointments.'}

        requests.post("https://api.infobip.com/sms/1/text/single", json=payload, headers=headers)
        return HttpResponse('Success')


class ViewApptTimeslots(viewsets.ReadOnlyModelViewSet):
    queryset = AvailableTimeSlots.objects.none()

    def list(self, request, *args, **kwargs):
        apptType = request.query_params.get('apptType')
        docName = request.query_params.get('docName')

        response_data = AvailableTimeSlots.objects.filter(timeslotType=apptType, doctors__name=docName). \
            values('start', ).distinct().order_by('start')

        timings = []

        for eachObj in response_data:
            timing = eachObj['start']
            timings.append(str(timing)[:-3])

        return Response(timings)


class ViewNotifications(viewsets.ModelViewSet):
    queryset = Patient.objects.none()
    serializer_class = PatientSerializer

    def list(self, request, *args, **kwargs):
        temp_response_data = Patient.objects. \
            annotate(canswap=F('swapper__swappable')). \
            annotate(notified=F('swapper__hasRead')). \
            annotate(swapperid=F('swapper__id')). \
            annotate(creationtime=F('swapper__creationTime')). \
            annotate(tempApptDate=F('tempPatients__timeBucket_id__date')). \
            annotate(tempApptStart=F('tempPatients__timeBucket_id__start')). \
            annotate(tempApptType=F('tempPatients__timeBucket__timeslotType')). \
            annotate(tempApptDay=F('tempPatients__timeBucket_id__date__day')). \
            annotate(patientname=F('name')). \
            annotate(patientcontact=F('contact')). \
            annotate(doctor=F('tempPatients__timeBucket_id__appointment__doctor__name')). \
            annotate(tempApptId=F('tempPatients__timeBucket_id__appointment__id')). \
            exclude(tempApptDate=None). \
            filter(canswap=True). \
            values('tempApptDate', 'tempApptStart', 'tempApptType', 'tempApptDay', 'doctor', 'patientname',
                   'patientcontact', 'tempApptId', 'canswap', 'notified', 'creationtime', 'swapperid').order_by(
            '-creationtime')

        scheduled_response_data = Patient.objects. \
            annotate(scheduledApptDate=F('patients__timeBucket_id__date')). \
            annotate(scheduledApptStart=F('patients__timeBucket_id__start')). \
            annotate(scheduledApptType=F('patients__timeBucket__timeslotType')). \
            annotate(scheduledApptDay=F('patients__timeBucket_id__date__day')). \
            annotate(patientcontact=F('contact')). \
            annotate(scheduledApptId=F('patients__timeBucket_id__appointment__id')). \
            exclude(scheduledApptDate=None). \
            values('scheduledApptDate', 'scheduledApptStart', 'scheduledApptType', 'scheduledApptDay', 'patientcontact',
                   'scheduledApptId')

        for eachObj in temp_response_data:
            for eachObj2 in scheduled_response_data:
                if eachObj2['patientcontact'] == eachObj['patientcontact']:
                    try:
                        toAdd = {"scheduledApptId": eachObj2['scheduledApptId'],
                                 "scheduledApptDate": eachObj2['scheduledApptDate'],
                                 "scheduledApptDay": eachObj2['scheduledApptDay'],
                                 "scheduledApptStart": eachObj2['scheduledApptStart']}
                        eachObj['scheduledAppointments'].append(toAdd)
                    except KeyError:
                        eachObj['scheduledAppointments'] = []
                        toAdd = {"scheduledApptId": eachObj2['scheduledApptId'],
                                 "scheduledApptDate": eachObj2['scheduledApptDate'],
                                 "scheduledApptDay": eachObj2['scheduledApptDay'],
                                 "scheduledApptStart": eachObj2['scheduledApptStart']}
                        eachObj['scheduledAppointments'].append(toAdd)

        return Response(temp_response_data)

    def create(self, request, *args, **kwargs):

        Swapper.objects.filter(swappable=True).update(hasRead=True)

        return HttpResponse(status=200)

class ViewTodayPatients(viewsets.ModelViewSet):
    queryset = Appointment.objects.none()
    serializer_class = AppointmentSerializer

    def list(self, request, *args, **kwargs):
        response_data = Appointment.objects.filter(timeBucket__date=datetime.today(), associatedpatientactions__cancelled=None).values('associatedpatientactions__appointment__doctor__name',
                                                                                             'associatedpatientactions__patient__name',
                                                                                             'associatedpatientactions__patient__contact',
                                                                                             'associatedpatientactions__appointment__apptType',
                                                                                             'associatedpatientactions__appointment__timeBucket__start',
                                                                                             'associatedpatientactions__addedToQueue',
                                                                                             'associatedpatientactions__appointment__clinic',
                                                                                             'associatedpatientactions__appointment__timeBucket',
                                                                                             'associatedpatientactions__patient_id',
                                                                                             'associatedpatientactions__appointment__doctor_id',
                                                                                             'associatedpatientactions__appointment_id',
                                                                                             'associatedpatientactions__cancelled')
        return Response(response_data)

    def create(self, request, *args, **kwargs):
        data = request.data

        apptId = data.get('apptId')
        apptType = data.get('apptType')
        clinic = data.get('clinic')
        doctor = data.get('doctor')
        timeBucket = data.get('timeBucket')
        patient = data.get('patient')
        attended = data.get('attended')

        a = Appointment.objects.get(id=apptId)
        p = Patient.objects.get(id=patient)

        associatedPAction = AssociatedPatientActions.objects.get(appointment=a, patient=p)

        if attended == 'True':
            associatedPAction.addedToQueue = True
            associatedPAction.save()
            AttendedAppointment.objects.create(apptType=apptType, patient=Patient.objects.get(id=patient),
                                               timeBucket=AvailableTimeSlots.objects.get(id=timeBucket),
                                               clinic=Clinic.objects.get(id=clinic),
                                               doctor=Doctor.objects.get(id=doctor), attended=True, originalAppt=a,
                                               )
        else:
            associatedPAction.addedToQueue = False
            associatedPAction.save()
            AttendedAppointment.objects.create(apptType=apptType, patient=Patient.objects.get(id=patient),
                                               timeBucket=AvailableTimeSlots.objects.get(id=timeBucket),
                                               clinic=Clinic.objects.get(id=clinic),
                                               doctor=Doctor.objects.get(id=doctor), attended=False, originalAppt=a,
                                               )

        return HttpResponse("Success")

class ViewNoShow(viewsets.ModelViewSet):
    queryset = AttendedAppointment.objects.none()
    serializer_class = AttendedAppointmentSerializer

    def list(self, request, *args, **kwargs):
        response_data = AttendedAppointment.objects.filter(attended=False).values('patient_id', 'patient__name',
                                                                                  'originalAppt_id', 'last_modified',
                                                                                  'originalAppt__timeBucket__start',
                                                                                  'originalAppt__apptType', 'originalAppt__doctor__name',
                                                                                  'remarks', 'id', 'originalAppt__timeBucket__date',
                                                                                  'patient__contact')

        return Response(response_data)

    def create(self, request, *args, **kwargs):
        data = request.data

        attendedApptId = data.get('attendedApptId')
        remarks = data.get('remarks')

        toAddRemarks = AttendedAppointment.objects.get(id=attendedApptId)

        toAddRemarks.remarks = remarks
        toAddRemarks.save()

        return HttpResponse('Success')

class ViewArchive(viewsets.ModelViewSet):
    queryset = Blacklist.objects.none()
    serializer_class = BlacklistSerializer

    def list(self, request, *args, **kwargs):
        response_data = Blacklist.objects.all().values('patient__name', 'patient__contact', 'apptType', 'doctor__name',
                                                       'timeBucket__date', 'timeBucket__start', 'blacklistReason__reason', 'patient_id', 'remarks')

        return Response(response_data)

    def create(self, request, *args, **kwargs):
        data = request.data

        attendedAppointmentId = data.get('attendedAppointmentId')

        reference = AttendedAppointment.objects.get(id=attendedAppointmentId)

        Blacklist.objects.create(blacklistReason=CancellationReason.objects.get(id=data.get('cancellationReasonID')), timeBucket=reference.timeBucket, apptType=reference.apptType,
                                 doctor=reference.doctor, patient=reference.patient, remarks=reference.remarks)

        reference.delete()

        return HttpResponse('Success')

    def destroy(self, request, *args, **kwargs):
        data = request.data

        archiveId = data.get('archiveId')
        Blacklist.objects.get(id=archiveId).delete()

        return HttpResponse('Success')

class PatientQueue(viewsets.ModelViewSet):
    queryset = AttendedAppointment.objects.none()
    serializer_class = AttendedAppointmentSerializer

    def create(self, request, *args, **kwargs):
        data = request.data

        apptId = data.get('apptId')
        patient = data.get('patient')

        AttendedAppointment.objects.get(patient=patient, originalAppt__id=apptId).delete()

        p = Patient.objects.get(id=patient)
        associatedPAction = AssociatedPatientActions.objects.get(appointment__id=apptId, patient=p)
        associatedPAction.addedToQueue = None
        associatedPAction.save()

        return HttpResponse("Success")

    def list(self, request, *args, **kwargs):
        response_data = AttendedAppointment.objects.filter(attended=True, timeBucket__date=datetime.now().date()).\
            values('patient_id', 'patient__name', 'originalAppt_id', 'last_modified', 'remarks')

        return Response(response_data)

def recievemsg(request):
    payload = request.GET

    message = payload['Text']
    messageArray = message.split()
    messagePt1 = messageArray[0]
    messagePt2 = messageArray[1]
    origin = payload['Sender']

    origin = origin[2:]

    swap = Swapper.objects.get(id=messagePt2)
    p = swap.patient
    scheduledApptId = swap.scheduledAppt_id
    tempApptId = swap.tempAppt_id

    if messagePt1 == 'swap':
        scheduledAppt = Appointment.objects.get(id=scheduledApptId)
        scheduledAppt.patients.remove(p)
        scheduledAppt.save()

        tempAppt = Appointment.objects.get(id=tempApptId)
        tempAppt.patients.add(p)
        tempAppt.tempPatients.remove(p)
        tempAppt.save()

        Swapper.objects.filter(patient=p, tempAppt=tempAppt, scheduledAppt=scheduledAppt).delete()

        if scheduledAppt.patients.count() == 0:
            scheduledAppt.delete()

        encoded = base64.b64encode('AnthonyS:ClearVision2')
        headers = {'Authorization': 'Basic ' + encoded, 'Content-Type': 'application/json', 'Accept': 'application/json'}
        payload = {'from': 'Clearvision', 'to': '65' + origin, 'text': 'Hi ' + p.name +
                ', \'swap\'  ' + messagePt2 + '\'acknowledged on ' + str(datetime.now())}

        requests.post("https://api.infobip.com/sms/1/text/single", json=payload, headers=headers)

        return HttpResponse('Success')
    else:
        return HttpResponse('Reply not configured')

def ViewAllSMS(request):
    encoded = base64.b64encode('AnthonyS:ClearVision2')
    headers = {'Authorization': 'Basic '+encoded, 'Content-Type': 'application/json', 'Accept': 'application/json'}

    response_data = requests.get("https://api.infobip.com/sms/1/inbox/logs", headers=headers)

    return HttpResponse(response_data)

def RecordUserActionsTimeIn(request):
    payload = request.body
    payload_clean = json.loads(payload)

    currentUser = payload_clean['user']
    action = payload_clean['action']
    timeIn = payload_clean['timeIn']

    staff = Staff.objects.get(name=currentUser)

    UserTracking.objects.create(user=staff, action=action, timeOut=None, timeIn=timeIn)

    return HttpResponse('Success')

def RecordUserActionsTimeOut(request):
    payload = request.body
    payload_clean = json.loads(payload)

    currentUser = payload_clean['user']
    action = payload_clean['action']
    timeOut = payload_clean['timeOut']

    toUpdateTimeOut = UserTracking.objects.get(user__name=currentUser, action=action,)
    toUpdateTimeOut.timeOut = timeOut
    toUpdateTimeOut.save()

    return HttpResponse('Success')

class ViewCancellationReasons(viewsets.ReadOnlyModelViewSet):
    queryset = CancellationReason.objects.none()

    def list(self, request, *args, **kwargs):
        allReasons = CancellationReason.objects.all().values()

        return Response(allReasons)

class NoShowPerChannel(viewsets.ReadOnlyModelViewSet):
    queryset = MarketingChannels.objects.none()

    def list(self, request, *args, **kwargs):

        allchannels = MarketingChannels.objects.all().values()

        noShow = Blacklist.objects.values('patient__marketingChannelId',)

        for eachChannel in allchannels:
            counter = 0
            for eachNoShow in noShow:
                if eachChannel['id'] == eachNoShow['patient__marketingChannelId']:
                    counter += 1

            if counter != 0:
                eachChannel['NoShowCount'] = counter

        return Response(allchannels)

class AppointmentAnalysisStackedChart(viewsets.ReadOnlyModelViewSet):
    queryset = Blacklist.objects.none()

    def list(self, request, *args, **kwargs):
        month = request.query_params.get('month')
        customFilter = request.query_params.get('customFilter')
        startDate = request.query_params.get('startDate')
        endDate = request.query_params.get('endDate')
        sortValue = request.query_params.get('sortValue')

        apptTypes = AppointmentType.objects.all().values()
        toReturnResponse = []

        if customFilter == 'True':
            apptTypes = request.query_params.getlist('apptTypes')
            for eachApptType in apptTypes:
                tillNowBlacklisted = Blacklist.objects.filter(timeBucket__date__date__gte=startDate, timeBucket__date__date__lte=endDate, timeBucket__timeslotType=eachApptType).values().count()
                tillNowAttended = AttendedAppointment.objects.filter(attended=True, timeBucket__date__date__gte=startDate, timeBucket__date__date__lte=endDate, timeBucket__timeslotType=eachApptType).values().count()
                totalPatientsForMonth = Appointment.objects.filter(timeBucket__date__date__gte=startDate, timeBucket__date__date__lte=endDate, timeBucket__timeslotType=eachApptType).values('patients').count()
                totalCancelledForMonth = AssociatedPatientActions.objects.filter(appointment__timeBucket__date__date__gte=startDate, appointment__timeBucket__date__date__lte=endDate, cancelled=True, appointment__timeBucket__timeslotType=eachApptType).values().count()

                toAdd = {'apptType': eachApptType, 'Appeared': tillNowAttended, 'NoShow': tillNowBlacklisted, 'Cancelled': totalCancelledForMonth, 'Pending': totalPatientsForMonth-tillNowBlacklisted-tillNowAttended}
                toReturnResponse.append(toAdd)
        else:

            for eachApptType in apptTypes:
                tillNowBlacklisted = Blacklist.objects.filter(timeBucket__date__date__month=month, timeBucket__timeslotType=eachApptType['name']).values().count()
                tillNowAttended = AttendedAppointment.objects.filter(attended=True, timeBucket__date__date__month=month, timeBucket__timeslotType=eachApptType['name']).values().count()
                totalPatientsForMonth = Appointment.objects.filter(timeBucket__date__date__month=month, timeBucket__timeslotType=eachApptType['name']).exclude(patients=None).values('patients').count()
                totalCancelledForMonth = AssociatedPatientActions.objects.filter(appointment__timeBucket__date__date__month=month, cancelled=True, appointment__timeBucket__timeslotType=eachApptType['name']).values().count()

                toAdd = {'apptType': eachApptType['name'], 'Appeared': tillNowAttended, 'NoShow': tillNowBlacklisted, 'Cancelled': totalCancelledForMonth, 'Pending': totalPatientsForMonth-tillNowBlacklisted-tillNowAttended}
                toReturnResponse.append(toAdd)

        if sortValue == 'Turn Up':
            return Response(sorted(toReturnResponse, key=itemgetter('Appeared'), reverse=True))
        elif sortValue == 'No Show':
            return Response(sorted(toReturnResponse, key=itemgetter('NoShow'), reverse=True))
        elif sortValue == 'Cancelled':
            return Response(sorted(toReturnResponse, key=itemgetter('Cancelled'), reverse=True))
        elif sortValue == 'Undecided':
            return Response(sorted(toReturnResponse, key=itemgetter('Pending'), reverse=True))
        else:
            return Response(toReturnResponse)

class AppointmentAnalysisPiechartApptTypeTab(viewsets.ReadOnlyModelViewSet):
    queryset = Blacklist.objects.none()

    def list(self, request, *args, **kwargs):
        month = request.query_params.get('month')
        piechartType = request.query_params.get('piechartType')
        customFilter = request.query_params.get('customFilter')
        startDate = request.query_params.get('startDate')
        endDate = request.query_params.get('endDate')

        apptTypes = AppointmentType.objects.all().values()

        toReturnResponse = []

        if piechartType == 'Cancelled':
            if customFilter == 'True':
                apptTypes = request.query_params.getlist('apptTypes')
                totalCancelledPerMonth = AssociatedPatientActions.objects.filter(appointment__timeBucket__date__date__gte=startDate,
                                                                                 appointment__timeBucket__date__date__lte=endDate,
                                                                                 appointment__apptType__in=apptTypes,
                                                                                 cancelled=True,).values().count()

                if totalCancelledPerMonth == 0:
                    return Response({})

                for eachApptType in apptTypes:
                    totalCancelledPerApptType = AssociatedPatientActions.objects.filter(appointment__timeBucket__date__date__gte=startDate,
                                                                                        appointment__timeBucket__date__date__lte=endDate,
                                                                                        cancelled=True,
                                                                                        appointment__timeBucket__timeslotType=eachApptType).values().count()
                    percentage = float(totalCancelledPerApptType)/float(totalCancelledPerMonth) * 100
                    toAdd = {eachApptType: percentage}
                    toReturnResponse.append(toAdd)

            else:
                totalCancelledPerMonth = AssociatedPatientActions.objects.filter(appointment__timeBucket__date__date__month=month, cancelled=True,).values().count()

                if totalCancelledPerMonth == 0:
                    return Response({})

                for eachApptType in apptTypes:
                    totalCancelledPerApptType = AssociatedPatientActions.objects.filter(appointment__timeBucket__date__date__month=month, cancelled=True, appointment__timeBucket__timeslotType=eachApptType['name']).values().count()
                    percentage = float(totalCancelledPerApptType)/float(totalCancelledPerMonth) * 100
                    toAdd = {eachApptType['name']: percentage}
                    toReturnResponse.append(toAdd)

            return Response(toReturnResponse)
        elif piechartType == 'NoShow':
            if customFilter == 'True':
                apptTypes = request.query_params.getlist('apptTypes')
                totalNoShowPerMonth = Blacklist.objects.filter(timeBucket__date__date__gte=startDate,
                                                               timeBucket__date__date__lte=endDate,
                                                               apptType__in=apptTypes).values().count()

                if totalNoShowPerMonth == 0:
                    return Response({})

                for eachApptType in apptTypes:
                    totalNoShowPerApptType = Blacklist.objects.filter(timeBucket__date__date__gte=startDate,
                                                                      timeBucket__date__date__lte=endDate,
                                                                      apptType=eachApptType).values().count()
                    percentage = float(totalNoShowPerApptType)/float(totalNoShowPerMonth)
                    toAdd = {eachApptType: percentage}
                    toReturnResponse.append(toAdd)
            else:
                totalNoShowPerMonth = Blacklist.objects.filter(timeBucket__date__date__month=month,).values().count()

                if totalNoShowPerMonth == 0:
                    return Response({})

                for eachApptType in apptTypes:
                    totalNoShowPerApptType = Blacklist.objects.filter(timeBucket__date__date__month=month, apptType=eachApptType['name']).values().count()
                    percentage = float(totalNoShowPerApptType)/float(totalNoShowPerMonth)
                    toAdd = {eachApptType['name']: percentage}
                    toReturnResponse.append(toAdd)

            return Response(toReturnResponse)
        elif piechartType == 'Combined':
            if customFilter == 'True':
                apptTypes = request.query_params.getlist('apptTypes')
                totalCancelledPerMonth = AssociatedPatientActions.objects.filter(appointment__timeBucket__date__date__gte=startDate,
                                                                                 appointment__timeBucket__date__date__lte=endDate,
                                                                                 appointment__apptType__in=apptTypes,
                                                                                 cancelled=True,).values().count()
                totalNoShowPerMonth = Blacklist.objects.filter(timeBucket__date__date__gte=startDate,
                                                               timeBucket__date__date__lte=endDate,
                                                               apptType__in=apptTypes).values().count()

                totalCombined = totalCancelledPerMonth + totalNoShowPerMonth
                if totalCombined == 0:
                    return Response({})

                for eachApptType in apptTypes:
                    totalCancelledPerApptType = AssociatedPatientActions.objects.filter(appointment__timeBucket__date__date__gte=startDate, appointment__timeBucket__date__date__lte=endDate,
                                                                                        cancelled=True, appointment__timeBucket__timeslotType=eachApptType).values().count()
                    totalNoShowPerApptType = Blacklist.objects.filter(timeBucket__date__date__gte=startDate, timeBucket__date__date__lte=endDate,
                                                                      apptType=eachApptType).values().count()
                    totalCombinedPerApptType = totalNoShowPerApptType + totalCancelledPerApptType
                    percentage = float(totalCombinedPerApptType)/float(totalCombined)
                    toAdd = {eachApptType: percentage}
                    toReturnResponse.append(toAdd)
            else:
                totalCancelledPerMonth = AssociatedPatientActions.objects.filter(appointment__timeBucket__date__date__month=month, cancelled=True,).values().count()
                totalNoShowPerMonth = Blacklist.objects.filter(timeBucket__date__date__month=month,).values().count()

                totalCombined = totalCancelledPerMonth + totalNoShowPerMonth
                if totalCombined == 0:
                    return Response({})

                for eachApptType in apptTypes:
                    totalNoShowPerApptType = Blacklist.objects.filter(timeBucket__date__date__month=month, apptType=eachApptType['name']).values().count()
                    totalCancelledPerApptType = AssociatedPatientActions.objects.filter(appointment__timeBucket__date__date__month=month, cancelled=True, appointment__timeBucket__timeslotType=eachApptType['name']).values().count()
                    totalCombinedPerApptType = totalNoShowPerApptType + totalCancelledPerApptType
                    percentage = float(totalCombinedPerApptType)/float(totalCombined)
                    toAdd = {eachApptType['name']: percentage}
                    toReturnResponse.append(toAdd)

            return Response(toReturnResponse)

        else:
            return Response("Invalid Request")

class AppointmentAnalysisPiechartMarketingChannelsTab(viewsets.ReadOnlyModelViewSet):
    queryset = Blacklist.objects.none()

    def list(self, request, *args, **kwargs):
        month = request.query_params.get('month')
        piechartType = request.query_params.get('piechartType')
        customFilter = request.query_params.get('customFilter')
        startDate = request.query_params.get('startDate')
        endDate = request.query_params.get('endDate')

        allmarketingchannels = MarketingChannels.objects.all().values()

        toReturnResponse = []

        if piechartType == 'Cancelled':
            if customFilter == 'True':
                apptTypes = request.query_params.getlist('apptTypes')
                totalCancelledPerMonth = AssociatedPatientActions.objects.filter(appointment__timeBucket__date__date__gte=startDate,
                                                                                 appointment__timeBucket__date__date__lte=endDate,
                                                                                 appointment__timeBucket__timeslotType__in=apptTypes,
                                                                                 cancelled=True,).values().count()
                if totalCancelledPerMonth == 0:
                    return Response({})

                for eachMarketingChannel in allmarketingchannels:
                    totalCancelledPerMarketingChannel = AssociatedPatientActions.objects.filter(appointment__timeBucket__date__date__gte=startDate,
                                                                                                appointment__timeBucket__date__date__lte=endDate,
                                                                                                cancelled=True,
                                                                                                appointment__timeBucket__timeslotType__in=apptTypes,
                                                                                                patient__marketingChannelId__name=eachMarketingChannel['name']).values().count()
                    percentage = float(totalCancelledPerMarketingChannel)/float(totalCancelledPerMonth)
                    toAdd = {eachMarketingChannel['name']: percentage}
                    toReturnResponse.append(toAdd)
            else:
                totalCancelledPerMonth = AssociatedPatientActions.objects.filter(appointment__timeBucket__date__date__month=month, cancelled=True,).values().count()

                if totalCancelledPerMonth == 0:
                    return Response({})

                for eachMarketingChannel in allmarketingchannels:
                    totalCancelledPerMarketingChannel = AssociatedPatientActions.objects.filter(appointment__timeBucket__date__date__month=month,
                                                                                                cancelled=True, patient__marketingChannelId__name=eachMarketingChannel['name']).values().count()
                    percentage = float(totalCancelledPerMarketingChannel)/float(totalCancelledPerMonth)
                    toAdd = {eachMarketingChannel['name']: percentage}
                    toReturnResponse.append(toAdd)

            return Response(toReturnResponse)

        elif piechartType == 'NoShow':
            if customFilter == 'True':
                apptTypes = request.query_params.getlist('apptTypes')
                totalNoShowPerMonth = Blacklist.objects.filter(timeBucket__date__date__gte=startDate,
                                                               timeBucket__date__date__lte=endDate,
                                                               apptType__in=apptTypes).values().count()
                if totalNoShowPerMonth == 0:
                    return Response({})

                for eachMarketingChannel in allmarketingchannels:
                    totalNoShowPerMarketingChannel = Blacklist.objects.filter(timeBucket__date__date__gte=startDate,
                                                                              timeBucket__date__date__lte=endDate,
                                                                              apptType__in=apptTypes,
                                                                              patient__marketingChannelId__name=eachMarketingChannel['name']).values().count()
                    percentage = float(totalNoShowPerMarketingChannel)/float(totalNoShowPerMonth)
                    toAdd = {eachMarketingChannel['name']: percentage}
                    toReturnResponse.append(toAdd)
            else:
                totalNoShowPerMonth = Blacklist.objects.filter(timeBucket__date__date__month=month,).values().count()
                if totalNoShowPerMonth == 0:
                    return Response({})

                for eachMarketingChannel in allmarketingchannels:
                    totalNoShowPerMarketingChannel = Blacklist.objects.filter(timeBucket__date__date__month=month,
                                                                            patient__marketingChannelId__name=eachMarketingChannel['name']).values().count()
                    percentage = float(totalNoShowPerMarketingChannel)/float(totalNoShowPerMonth)
                    toAdd = {eachMarketingChannel['name']: percentage}
                    toReturnResponse.append(toAdd)

            return Response(toReturnResponse)

        elif piechartType == 'Combined':
            if customFilter == 'True':
                apptTypes = request.query_params.getlist('apptTypes')
                totalCancelledPerMonth = AssociatedPatientActions.objects.filter(appointment__timeBucket__date__date__gte=startDate,
                                                                                 appointment__timeBucket__date__date__lte=endDate,
                                                                                 appointment__timeBucket__timeslotType__in=apptTypes,
                                                                                 cancelled=True,).values().count()
                totalNoShowPerMonth = Blacklist.objects.filter(timeBucket__date__date__gte=startDate,
                                                               timeBucket__date__date__lte=endDate,
                                                               apptType__in=apptTypes).values().count()
                totalCombined = totalCancelledPerMonth + totalNoShowPerMonth

                if totalCombined == 0:
                    return Response({})

                for eachMarketingChannel in allmarketingchannels:
                    totalCancelledPerMarketingChannel = AssociatedPatientActions.objects.filter(appointment__timeBucket__date__date__gte=startDate,
                                                                                                appointment__timeBucket__date__date__lte=endDate,
                                                                                                cancelled=True,
                                                                                                appointment__timeBucket__timeslotType__in=apptTypes,
                                                                                                patient__marketingChannelId__name=eachMarketingChannel['name']).values().count()
                    totalNoShowPerMarketingChannel = Blacklist.objects.filter(timeBucket__date__date__gte=startDate,
                                                                              timeBucket__date__date__lte=endDate,
                                                                              apptType__in=apptTypes,
                                                                              patient__marketingChannelId__name=eachMarketingChannel['name']).values().count()
                    totalCombinedPerMarketingChannel = totalCancelledPerMarketingChannel + totalNoShowPerMarketingChannel
                    percentage = float(totalCombinedPerMarketingChannel)/float(totalCombined)
                    toAdd = {eachMarketingChannel['name']: percentage}
                    toReturnResponse.append(toAdd)
            else:
                totalCancelledPerMonth = AssociatedPatientActions.objects.filter(appointment__timeBucket__date__date__month=month, cancelled=True,).values().count()
                totalNoShowPerMonth = Blacklist.objects.filter(timeBucket__date__date__month=month,).values().count()
                totalCombined = totalCancelledPerMonth + totalNoShowPerMonth

                if totalCombined == 0:
                    return Response({})

                for eachMarketingChannel in allmarketingchannels:
                    totalCancelledPerMarketingChannel = AssociatedPatientActions.objects.filter(appointment__timeBucket__date__date__month=month,
                                                                                    cancelled=True, patient__marketingChannelId__name=eachMarketingChannel['name']).values().count()
                    totalNoShowPerMarketingChannel = Blacklist.objects.filter(timeBucket__date__date__month=month,
                                                                            patient__marketingChannelId__name=eachMarketingChannel['name']).values().count()
                    totalCombinedPerMarketingChannel = totalCancelledPerMarketingChannel + totalNoShowPerMarketingChannel
                    percentage = float(totalCombinedPerMarketingChannel)/float(totalCombined)
                    toAdd = {eachMarketingChannel['name']: percentage}
                    toReturnResponse.append(toAdd)

            return Response(toReturnResponse)

class AppointmentAnalysisPiechartReasonsTab(viewsets.ReadOnlyModelViewSet):
    queryset = AssociatedPatientActions.objects.none()

    def list(self, request, *args, **kwargs):
        month = request.query_params.get('month')
        piechartType = request.query_params.get('piechartType')
        customFilter = request.query_params.get('customFilter')
        startDate = request.query_params.get('startDate')
        endDate = request.query_params.get('endDate')

        allreasons = CancellationReason.objects.all().values()

        toReturnResponse = []

        if piechartType == 'Cancelled':
            if customFilter == 'True':
                apptTypes = request.query_params.getlist('apptTypes')
                totalCancelledPerMonth = AssociatedPatientActions.objects.filter(cancelled=True,
                                                                                 appointment__timeBucket__date__date__gte=startDate,
                                                                                 appointment__timeBucket__date__date__lte=endDate,
                                                                                 appointment__apptType__in=apptTypes).values().count()

                if totalCancelledPerMonth == 0:
                    return Response({})

                for eachReason in allreasons:
                    totalCancelledPerReason = AssociatedPatientActions.objects.filter(cancelled=True, appointment__timeBucket__date__date__gte=startDate,
                                                                                      appointment__timeBucket__date__date__lte=endDate,
                                                                                      appointment__apptType__in=apptTypes,
                                                                                      cancellationReason__id=eachReason['id']).values().count()
                    percentage = float(totalCancelledPerReason)/float(totalCancelledPerMonth)
                    toAdd = {eachReason['reason']: percentage}
                    toReturnResponse.append(toAdd)
            else:
                totalCancelledPerMonth = AssociatedPatientActions.objects.filter(cancelled=True, appointment__timeBucket__date__date__month=month,).values().count()

                if totalCancelledPerMonth == 0:
                    return Response({})

                for eachReason in allreasons:
                    totalCancelledPerReason = AssociatedPatientActions.objects.filter(cancelled=True, appointment__timeBucket__date__date__month=month,
                                                                                  cancellationReason__id=eachReason['id']).values().count()
                    percentage = float(totalCancelledPerReason)/float(totalCancelledPerMonth)
                    toAdd = {eachReason['reason']: percentage}
                    toReturnResponse.append(toAdd)
            return Response(toReturnResponse)

        if piechartType == 'NoShow':
            if customFilter == 'True':
                apptTypes = request.query_params.getlist('apptTypes')
                totalNoShowPerMonth = Blacklist.objects.filter(timeBucket__date__date__gte=startDate,
                                                               timeBucket__date__date__lte=endDate,
                                                               apptType__in=apptTypes).values().count()

                if totalNoShowPerMonth == 0:
                    return Response({})

                for eachReason in allreasons:
                    totalNoShowPerReason = Blacklist.objects.filter(timeBucket__date__date__gte=startDate,
                                                                    timeBucket__date__date__lte=endDate,
                                                                    apptType__in=apptTypes,
                                                                    blacklistReason=eachReason['id']).values().count()
                    percentage = float(totalNoShowPerReason)/float(totalNoShowPerMonth)
                    toAdd = {eachReason['reason']: percentage}
                    toReturnResponse.append(toAdd)
            else:
                totalNoShowPerMonth = Blacklist.objects.filter(timeBucket__date__date__month=month,).values().count()

                if totalNoShowPerMonth == 0:
                    return Response({})

                for eachReason in allreasons:
                    totalNoShowPerReason = Blacklist.objects.filter(timeBucket__date__date__month=month, blacklistReason=eachReason['id']).values().count()
                    percentage = float(totalNoShowPerReason)/float(totalNoShowPerMonth)
                    toAdd = {eachReason['reason']: percentage}
                    toReturnResponse.append(toAdd)
            return Response(toReturnResponse)

        if piechartType == 'Combined':
            if customFilter == 'True':
                apptTypes = request.query_params.getlist('apptTypes')
                totalCancelledPerMonth = AssociatedPatientActions.objects.filter(cancelled=True,
                                                                                 appointment__timeBucket__date__date__gte=startDate,
                                                                                 appointment__timeBucket__date__date__lte=endDate,
                                                                                 appointment__apptType__in=apptTypes).values().count()
                totalNoShowPerMonth = Blacklist.objects.filter(timeBucket__date__date__gte=startDate,
                                                               timeBucket__date__date__lte=endDate,
                                                               apptType__in=apptTypes).values().count()
                totalCombined = totalCancelledPerMonth + totalNoShowPerMonth

                if totalCombined == 0:
                    return Response({})

                for eachReason in allreasons:
                    totalCancelledPerReason = AssociatedPatientActions.objects.filter(cancelled=True, appointment__timeBucket__date__date__gte=startDate,
                                                                                      appointment__timeBucket__date__date__lte=endDate,
                                                                                      appointment__apptType__in=apptTypes,
                                                                                      cancellationReason__id=eachReason['id']).values().count()
                    totalNoShowPerReason = Blacklist.objects.filter(timeBucket__date__date__gte=startDate,
                                                                    timeBucket__date__date__lte=endDate,
                                                                    apptType__in=apptTypes,
                                                                    blacklistReason=eachReason['id']).values().count()
                    totalCombinedPerReason = totalCancelledPerReason + totalNoShowPerReason
                    percentage = float(totalCombinedPerReason)/float(totalCombined)
                    toAdd = {eachReason['reason']: percentage}
                    toReturnResponse.append(toAdd)
            else:
                totalCancelledPerMonth = AssociatedPatientActions.objects.filter(cancelled=True, appointment__timeBucket__date__date__month=month,).values().count()
                totalNoShowPerMonth = Blacklist.objects.filter(timeBucket__date__date__month=month,).values().count()
                totalCombined = totalCancelledPerMonth + totalNoShowPerMonth

                if totalCombined == 0:
                    return Response({})

                for eachReason in allreasons:
                    totalCancelledPerReason = AssociatedPatientActions.objects.filter(cancelled=True, appointment__timeBucket__date__date__month=month,
                                                                                  cancellationReason__id=eachReason['id']).values().count()
                    totalNoShowPerReason = Blacklist.objects.filter(timeBucket__date__date__month=month, blacklistReason=eachReason['id']).values().count()
                    totalCombinedPerReason = totalCancelledPerReason + totalNoShowPerReason
                    percentage = float(totalCombinedPerReason)/float(totalCombined)
                    toAdd = {eachReason['reason']: percentage}
                    toReturnResponse.append(toAdd)

            return Response(toReturnResponse)

        return Response({})

class AppointmentAnalysisPartPieApptType(viewsets.ReadOnlyModelViewSet):
    queryset = Blacklist.objects.none()

    def list(self, request, *args, **kwargs):
        month = request.query_params.get('month')
        apptType = request.query_params.get('apptType')
        pieChart = request.query_params.get('pieChart')
        pieChartTab = request.query_params.get('pieChartTab')
        channel = request.query_params.get('channel')
        reason = request.query_params.get('reason')

        customFilter = request.query_params.get('customFilter')
        startDate = request.query_params.get('startDate')
        endDate = request.query_params.get('endDate')

        toReturnResponse = []
        allmarketingchannels = MarketingChannels.objects.all().values()
        allApptTypes = AppointmentType.objects.all().values()
        allReasons = CancellationReason.objects.all().values()

        if pieChart == 'Appointment Type' and pieChartTab == 'Cancelled':
            if customFilter == 'True':
                firstPie = []
                secondPie = []
                totalCancelledPerApptType = AssociatedPatientActions.objects.filter(appointment__timeBucket__date__date__gte=startDate,
                                                                                    appointment__timeBucket__date__date__lte=endDate,
                                                                                    cancelled=True, appointment__timeBucket__timeslotType=apptType).values().count()
                if totalCancelledPerApptType == 0:
                    return Response({})

                for eachMarketingChannel in allmarketingchannels:
                    totalCancelledPerApptTypePerChannel = AssociatedPatientActions.objects.filter(appointment__timeBucket__date__date__gte=startDate,
                                                                                                  appointment__timeBucket__date__date__lte=endDate,
                                                                                    cancelled=True, appointment__timeBucket__timeslotType=apptType,
                                                                                    patient__marketingChannelId__name=eachMarketingChannel['name']).values().count()

                    percentage = float(totalCancelledPerApptTypePerChannel)/float(totalCancelledPerApptType) * 100
                    toAdd = {eachMarketingChannel['name']: percentage}
                    firstPie.append(toAdd)
                toReturnResponse.append(firstPie)

                for eachReason in allReasons:
                    totalCancelledPerApptTypePerReason = AssociatedPatientActions.objects.filter(appointment__timeBucket__date__date__gte=startDate,
                                                                                                 appointment__timeBucket__date__date__lte=endDate,
                                                                                cancelled=True, appointment__timeBucket__timeslotType=apptType,
                                                                                cancellationReason__reason=eachReason['reason']).values().count()
                    percentage = float(totalCancelledPerApptTypePerReason)/float(totalCancelledPerApptType) * 100
                    toAdd = {eachReason['reason']: percentage}
                    secondPie.append(toAdd)
                toReturnResponse.append(secondPie)
            else:
                firstPie = []
                secondPie = []
                totalCancelledPerApptType = AssociatedPatientActions.objects.filter(appointment__timeBucket__date__date__month=month,
                                                                                cancelled=True, appointment__timeBucket__timeslotType=apptType).values().count()
                if totalCancelledPerApptType == 0:
                    return Response({})

                for eachMarketingChannel in allmarketingchannels:
                    totalCancelledPerApptTypePerChannel = AssociatedPatientActions.objects.filter(appointment__timeBucket__date__date__month=month,
                                                                                    cancelled=True, appointment__timeBucket__timeslotType=apptType,
                                                                                    patient__marketingChannelId__name=eachMarketingChannel['name']).values().count()

                    percentage = float(totalCancelledPerApptTypePerChannel)/float(totalCancelledPerApptType) * 100
                    toAdd = {eachMarketingChannel['name']: percentage}
                    firstPie.append(toAdd)
                toReturnResponse.append(firstPie)

                for eachReason in allReasons:
                    totalCancelledPerApptTypePerReason = AssociatedPatientActions.objects.filter(appointment__timeBucket__date__date__month=month,
                                                                                cancelled=True, appointment__timeBucket__timeslotType=apptType,
                                                                                cancellationReason__reason=eachReason['reason']).values().count()
                    percentage = float(totalCancelledPerApptTypePerReason)/float(totalCancelledPerApptType) * 100
                    toAdd = {eachReason['reason']: percentage}
                    secondPie.append(toAdd)
                toReturnResponse.append(secondPie)

            return Response(toReturnResponse)

        elif pieChart == 'Appointment Type' and pieChartTab == 'NoShow':
            if customFilter == 'True':
                firstPie = []
                secondPie = []
                totalNoShowPerApptType = Blacklist.objects.filter(timeBucket__date__date__gte=startDate, timeBucket__date__date__lte=endDate, apptType=apptType).values().count()

                if totalNoShowPerApptType == 0:
                    return Response({})

                for eachMarketingChannel in allmarketingchannels:
                    totalNoShowPerApptTypePerChannel = Blacklist.objects.filter(timeBucket__date__date__gte=startDate,
                                                                                timeBucket__date__date__lte=endDate,
                                                                            patient__marketingChannelId__name=eachMarketingChannel['name'],
                                                                            apptType=apptType).values().count()
                    percentage = float(totalNoShowPerApptTypePerChannel)/float(totalNoShowPerApptType) * 100
                    toAdd = {eachMarketingChannel['name']: percentage}
                    firstPie.append(toAdd)
                toReturnResponse.append(firstPie)

                for eachReason in allReasons:
                    totalNoShowPerApptTypePerReason = Blacklist.objects.filter(timeBucket__date__date__gte=startDate, apptType=apptType,
                                                                               timeBucket__date__date__lte=endDate,
                                                                               blacklistReason__reason=eachReason['reason']).values().count()
                    percentage = float(totalNoShowPerApptTypePerReason)/float(totalNoShowPerApptType) * 100
                    toAdd = {eachReason['reason']: percentage}
                    secondPie.append(toAdd)
                toReturnResponse.append(secondPie)
            else:
                firstPie = []
                secondPie = []
                totalNoShowPerApptType = Blacklist.objects.filter(timeBucket__date__date__month=month, apptType=apptType).values().count()

                if totalNoShowPerApptType == 0:
                    return Response({})

                for eachMarketingChannel in allmarketingchannels:
                    totalNoShowPerApptTypePerChannel = Blacklist.objects.filter(timeBucket__date__date__month=month,
                                                                            patient__marketingChannelId__name=eachMarketingChannel['name'],
                                                                            apptType=apptType).values().count()
                    percentage = float(totalNoShowPerApptTypePerChannel)/float(totalNoShowPerApptType) * 100
                    toAdd = {eachMarketingChannel['name']: percentage}
                    firstPie.append(toAdd)
                toReturnResponse.append(firstPie)

                for eachReason in allReasons:
                    totalNoShowPerApptTypePerReason = Blacklist.objects.filter(timeBucket__date__date__month=month, apptType=apptType,
                                                                           blacklistReason__reason=eachReason['reason']).values().count()
                    percentage = float(totalNoShowPerApptTypePerReason)/float(totalNoShowPerApptType) * 100
                    toAdd = {eachReason['reason']: percentage}
                    secondPie.append(toAdd)
                toReturnResponse.append(secondPie)

            return Response(toReturnResponse)

        elif pieChart == 'Appointment Type' and pieChartTab == 'Combined':
            if customFilter == 'True':
                firstPie = []
                secondPie = []
                totalCancelledPerApptType = AssociatedPatientActions.objects.filter(appointment__timeBucket__date__date__gte=startDate,
                                                                                    appointment__timeBucket__date__date__lte=endDate,
                                                                                cancelled=True, appointment__timeBucket__timeslotType=apptType).values().count()
                totalNoShowPerApptType = Blacklist.objects.filter(timeBucket__date__date__gte=startDate,
                                                                  timeBucket__date__date__lte=endDate,
                                                                  apptType=apptType).values().count()
                totalCombined = totalCancelledPerApptType + totalNoShowPerApptType

                if totalCombined == 0:
                    return Response({})

                for eachMarketingChannel in allmarketingchannels:
                    totalCancelledPerApptTypePerChannel = AssociatedPatientActions.objects.filter(appointment__timeBucket__date__date__gte=startDate,
                                                                                                  appointment__timeBucket__date__date__lte=endDate,
                                                                                cancelled=True, appointment__timeBucket__timeslotType=apptType,
                                                                                patient__marketingChannelId__name=eachMarketingChannel['name']).values().count()
                    totalNoShowPerApptTypePerChannel = Blacklist.objects.filter(timeBucket__date__date__gte=startDate,
                                                                                timeBucket__date__date__lte=endDate,
                                                                            patient__marketingChannelId__name=eachMarketingChannel['name'],
                                                                            apptType=apptType).values().count()
                    totalCombinedPerApptTypePerChannel = totalCancelledPerApptTypePerChannel + totalNoShowPerApptTypePerChannel
                    percentage = float(totalCombinedPerApptTypePerChannel)/float(totalCombined) * 100
                    toAdd = {eachMarketingChannel['name']: percentage}
                    firstPie.append(toAdd)
                toReturnResponse.append(firstPie)

                for eachReason in allReasons:
                    totalNoShowPerApptTypePerReason = Blacklist.objects.filter(timeBucket__date__date__gte=startDate, apptType=apptType,
                                                                               timeBucket__date__date__lte=endDate,
                                                                               blacklistReason__reason=eachReason['reason']).values().count()
                    totalCancelledPerApptTypePerReason = AssociatedPatientActions.objects.filter(appointment__timeBucket__date__date__gte=startDate,
                                                                                                 appointment__timeBucket__date__date__lte=endDate,
                                                                                cancelled=True, appointment__timeBucket__timeslotType=apptType,
                                                                                cancellationReason__reason=eachReason['reason']).values().count()
                    totalCombinedPerApptTypePerReason = totalNoShowPerApptTypePerReason + totalCancelledPerApptTypePerReason
                    percentage = float(totalCombinedPerApptTypePerReason)/float(totalCombined) * 100
                    toAdd = {eachReason['reason']: percentage}
                    secondPie.append(toAdd)
                toReturnResponse.append(secondPie)
            else:
                firstPie = []
                secondPie = []
                totalCancelledPerApptType = AssociatedPatientActions.objects.filter(appointment__timeBucket__date__date__month=month,
                                                                                cancelled=True, appointment__timeBucket__timeslotType=apptType).values().count()
                totalNoShowPerApptType = Blacklist.objects.filter(timeBucket__date__date__month=month, apptType=apptType).values().count()
                totalCombined = totalCancelledPerApptType + totalNoShowPerApptType

                if totalCombined == 0:
                    return Response({})

                for eachMarketingChannel in allmarketingchannels:
                    totalCancelledPerApptTypePerChannel = AssociatedPatientActions.objects.filter(appointment__timeBucket__date__date__month=month,
                                                                                cancelled=True, appointment__timeBucket__timeslotType=apptType,
                                                                                patient__marketingChannelId__name=eachMarketingChannel['name']).values().count()
                    totalNoShowPerApptTypePerChannel = Blacklist.objects.filter(timeBucket__date__date__month=month,
                                                                            patient__marketingChannelId__name=eachMarketingChannel['name'],
                                                                            apptType=apptType).values().count()
                    totalCombinedPerApptTypePerChannel = totalCancelledPerApptTypePerChannel + totalNoShowPerApptTypePerChannel
                    percentage = float(totalCombinedPerApptTypePerChannel)/float(totalCombined) * 100
                    toAdd = {eachMarketingChannel['name']: percentage}
                    firstPie.append(toAdd)
                toReturnResponse.append(firstPie)

                for eachReason in allReasons:
                    totalNoShowPerApptTypePerReason = Blacklist.objects.filter(timeBucket__date__date__month=month, apptType=apptType,
                                                                           blacklistReason__reason=eachReason['reason']).values().count()
                    totalCancelledPerApptTypePerReason = AssociatedPatientActions.objects.filter(appointment__timeBucket__date__date__month=month,
                                                                                cancelled=True, appointment__timeBucket__timeslotType=apptType,
                                                                                cancellationReason__reason=eachReason['reason']).values().count()
                    totalCombinedPerApptTypePerReason = totalNoShowPerApptTypePerReason + totalCancelledPerApptTypePerReason
                    percentage = float(totalCombinedPerApptTypePerReason)/float(totalCombined) * 100
                    toAdd = {eachReason['reason']: percentage}
                    secondPie.append(toAdd)
                toReturnResponse.append(secondPie)

            return Response(toReturnResponse)

        elif pieChart == 'Marketing Channels' and pieChartTab == 'Cancelled':
            if customFilter == 'True':
                firstPie = []
                secondPie = []
                totalCancelledPerChannel = AssociatedPatientActions.objects.filter(cancelled=True, appointment__timeBucket__date__date__gte=startDate,
                                                                                   appointment__timeBucket__date__date__lte=endDate,
                                                                               patient__marketingChannelId__name=channel,).values().count()
                if totalCancelledPerChannel == 0:
                    return Response({})

                for eachApptType in allApptTypes:
                    totalCancelledPerChannelPerApptType = AssociatedPatientActions.objects.filter(cancelled=True, appointment__timeBucket__date__date__gte=startDate,
                                                                                                  appointment__timeBucket__date__date__lte=endDate,
                                                                                              patient__marketingChannelId__name=channel,
                                                                                              appointment__timeBucket__timeslotType=eachApptType['name']).values().count()
                    percentage = float(totalCancelledPerChannelPerApptType)/float(totalCancelledPerChannel) * 100
                    toAdd = {eachApptType['name']: percentage}
                    firstPie.append(toAdd)
                toReturnResponse.append(firstPie)

                for eachReason in allReasons:
                    totalCancelledPerChannelPerReason = AssociatedPatientActions.objects.filter(cancelled=True, appointment__timeBucket__date__date__gte=startDate,
                                                                                                appointment__timeBucket__date__date__lte=endDate,
                                                                               patient__marketingChannelId__name=channel, cancellationReason__reason=eachReason['reason']).values().count()
                    percentage = float(totalCancelledPerChannelPerReason)/float(totalCancelledPerChannel) * 100
                    toAdd = {eachReason['reason']:percentage}
                    secondPie.append(toAdd)
                toReturnResponse.append(secondPie)
            else:
                firstPie = []
                secondPie = []
                totalCancelledPerChannel = AssociatedPatientActions.objects.filter(cancelled=True, appointment__timeBucket__date__date__month=month,
                                                                               patient__marketingChannelId__name=channel,).values().count()
                if totalCancelledPerChannel == 0:
                    return Response({})

                for eachApptType in allApptTypes:
                    totalCancelledPerChannelPerApptType = AssociatedPatientActions.objects.filter(cancelled=True, appointment__timeBucket__date__date__month=month,
                                                                                              patient__marketingChannelId__name=channel,
                                                                                              appointment__timeBucket__timeslotType=eachApptType['name']).values().count()
                    percentage = float(totalCancelledPerChannelPerApptType)/float(totalCancelledPerChannel) * 100
                    toAdd = {eachApptType['name']: percentage}
                    firstPie.append(toAdd)
                toReturnResponse.append(firstPie)

                for eachReason in allReasons:
                    totalCancelledPerChannelPerReason = AssociatedPatientActions.objects.filter(cancelled=True, appointment__timeBucket__date__date__month=month,
                                                                               patient__marketingChannelId__name=channel, cancellationReason__reason=eachReason['reason']).values().count()
                    percentage = float(totalCancelledPerChannelPerReason)/float(totalCancelledPerChannel) * 100
                    toAdd = {eachReason['reason']:percentage}
                    secondPie.append(toAdd)
                toReturnResponse.append(secondPie)

            return Response(toReturnResponse)

        elif pieChart == 'Marketing Channels' and pieChartTab == 'NoShow':
            if customFilter == 'True':
                firstPie = []
                secondPie = []
                totalNoShowPerChannel = Blacklist.objects.filter(timeBucket__date__date__gte=startDate, timeBucket__date__date__lte=endDate,
                                                                 patient__marketingChannelId__name=channel,).values().count()

                if totalNoShowPerChannel == 0:
                    return Response({})

                for eachApptType in allApptTypes:
                    totalNoShowPerChannelPerApptType = Blacklist.objects.filter(timeBucket__date__date__gte=startDate,
                                                                                timeBucket__date__date__lte=endDate,
                                                                            patient__marketingChannelId__name=channel,
                                                                            apptType=eachApptType['name']).values().count()
                    percentage = float(totalNoShowPerChannelPerApptType)/float(totalNoShowPerChannel) * 100
                    toAdd = {eachApptType['name']: percentage}
                    firstPie.append(toAdd)
                toReturnResponse.append(firstPie)

                for eachReason in allReasons:
                    totalNoShowPerChannelPerReason = Blacklist.objects.filter(timeBucket__date__date__gte=startDate,
                                                                              timeBucket__date__date__lte=endDate,
                                                                              patient__marketingChannelId__name=channel,
                                                                              blacklistReason__reason=eachReason['reason']).values().count()
                    percentage = float(totalNoShowPerChannelPerReason)/float(totalNoShowPerChannel)
                    toAdd = {eachReason['reason']: percentage}
                    secondPie.append(toAdd)
                toReturnResponse.append(secondPie)
            else:
                firstPie = []
                secondPie = []
                totalNoShowPerChannel = Blacklist.objects.filter(timeBucket__date__date__month=month, patient__marketingChannelId__name=channel,).values().count()

                if totalNoShowPerChannel == 0:
                    return Response({})

                for eachApptType in allApptTypes:
                    totalNoShowPerChannelPerApptType = Blacklist.objects.filter(timeBucket__date__date__month=month,
                                                                            patient__marketingChannelId__name=channel,
                                                                            apptType=eachApptType['name']).values().count()
                    percentage = float(totalNoShowPerChannelPerApptType)/float(totalNoShowPerChannel) * 100
                    toAdd = {eachApptType['name']: percentage}
                    firstPie.append(toAdd)
                toReturnResponse.append(firstPie)

                for eachReason in allReasons:
                    totalNoShowPerChannelPerReason = Blacklist.objects.filter(timeBucket__date__date__month=month, patient__marketingChannelId__name=channel,
                                                                          blacklistReason__reason=eachReason['reason']).values().count()
                    percentage = float(totalNoShowPerChannelPerReason)/float(totalNoShowPerChannel)
                    toAdd = {eachReason['reason']: percentage}
                    secondPie.append(toAdd)
                toReturnResponse.append(secondPie)

            return Response(toReturnResponse)

        elif pieChart == 'Marketing Channels' and pieChartTab == 'Combined':
            if customFilter == 'True':
                firstPie = []
                secondPie = []
                totalCancelledPerChannel = AssociatedPatientActions.objects.filter(cancelled=True, appointment__timeBucket__date__date__gte=startDate,
                                                                                   appointment__timeBucket__date__date__lte=endDate,
                                                                               patient__marketingChannelId__name=channel,).values().count()
                totalNoShowPerChannel = Blacklist.objects.filter(timeBucket__date__date__gte=startDate,
                                                                 timeBucket__date__date__lte=endDate,
                                                                 patient__marketingChannelId__name=channel,).values().count()
                totalCombinedPerChannel = totalCancelledPerChannel + totalNoShowPerChannel

                if totalCombinedPerChannel == 0:
                    return Response({})

                for eachApptType in allApptTypes:
                    totalCancelledPerChannelPerApptType = AssociatedPatientActions.objects.filter(cancelled=True, appointment__timeBucket__date__date__gte=startDate,
                                                                                                  appointment__timeBucket__date__date__lte=endDate,
                                                                                              patient__marketingChannelId__name=channel,
                                                                                              appointment__timeBucket__timeslotType=eachApptType['name']).values().count()
                    totalNoShowPerChannelPerApptType = Blacklist.objects.filter(timeBucket__date__date__gte=startDate,
                                                                                timeBucket__date__date__lte=endDate,
                                                                            patient__marketingChannelId__name=channel,
                                                                            apptType=eachApptType['name']).values().count()

                    totalCombinedPerChannelPerApptType = totalCancelledPerChannelPerApptType + totalNoShowPerChannelPerApptType
                    percentage = float(totalCombinedPerChannelPerApptType)/float(totalCombinedPerChannel) * 100
                    toAdd = {eachApptType['name']: percentage}
                    firstPie.append(toAdd)
                toReturnResponse.append(firstPie)

                for eachReason in allReasons:
                    totalCancelledPerChannelPerReason = AssociatedPatientActions.objects.filter(cancelled=True, appointment__timeBucket__date__date__gte=startDate,
                                                                                                appointment__timeBucket__date__date__lte=endDate,
                                                                               patient__marketingChannelId__name=channel, cancellationReason__reason=eachReason['reason']).values().count()
                    totalNoShowPerChannelPerReason = Blacklist.objects.filter(timeBucket__date__date__gte=startDate,
                                                                              timeBucket__date__date__lte=endDate,
                                                                              patient__marketingChannelId__name=channel,
                                                                              blacklistReason__reason=eachReason['reason']).values().count()
                    totalCombinedPerChannelPerReason = totalCancelledPerChannelPerReason + totalNoShowPerChannelPerReason
                    percentage = float(totalCombinedPerChannelPerReason)/float(totalCombinedPerChannel)
                    toAdd = {eachReason['reason']: percentage}
                    secondPie.append(toAdd)
                toReturnResponse.append(secondPie)
            else:
                firstPie = []
                secondPie = []
                totalCancelledPerChannel = AssociatedPatientActions.objects.filter(cancelled=True, appointment__timeBucket__date__date__month=month,
                                                                               patient__marketingChannelId__name=channel,).values().count()
                totalNoShowPerChannel = Blacklist.objects.filter(timeBucket__date__date__month=month, patient__marketingChannelId__name=channel,).values().count()
                totalCombinedPerChannel = totalCancelledPerChannel + totalNoShowPerChannel

                if totalCombinedPerChannel == 0:
                    return Response({})

                for eachApptType in allApptTypes:
                    totalCancelledPerChannelPerApptType = AssociatedPatientActions.objects.filter(cancelled=True, appointment__timeBucket__date__date__month=month,
                                                                                              patient__marketingChannelId__name=channel,
                                                                                              appointment__timeBucket__timeslotType=eachApptType['name']).values().count()
                    totalNoShowPerChannelPerApptType = Blacklist.objects.filter(timeBucket__date__date__month=month,
                                                                            patient__marketingChannelId__name=channel,
                                                                            apptType=eachApptType['name']).values().count()

                    totalCombinedPerChannelPerApptType = totalCancelledPerChannelPerApptType + totalNoShowPerChannelPerApptType
                    percentage = float(totalCombinedPerChannelPerApptType)/float(totalCombinedPerChannel) * 100
                    toAdd = {eachApptType['name']: percentage}
                    firstPie.append(toAdd)
                toReturnResponse.append(firstPie)

                for eachReason in allReasons:
                    totalCancelledPerChannelPerReason = AssociatedPatientActions.objects.filter(cancelled=True, appointment__timeBucket__date__date__month=month,
                                                                               patient__marketingChannelId__name=channel, cancellationReason__reason=eachReason['reason']).values().count()
                    totalNoShowPerChannelPerReason = Blacklist.objects.filter(timeBucket__date__date__month=month, patient__marketingChannelId__name=channel,
                                                                          blacklistReason__reason=eachReason['reason']).values().count()
                    totalCombinedPerChannelPerReason = totalCancelledPerChannelPerReason + totalNoShowPerChannelPerReason
                    percentage = float(totalCombinedPerChannelPerReason)/float(totalCombinedPerChannel)
                    toAdd = {eachReason['reason']: percentage}
                    secondPie.append(toAdd)
                toReturnResponse.append(secondPie)

            return Response(toReturnResponse)

        elif pieChart == 'Reasons' and pieChartTab == 'Cancelled':
            if customFilter == 'True':
                firstPie = []
                secondPie = []
                totalCancelledPerReason = AssociatedPatientActions.objects.filter(cancelled=True, appointment__timeBucket__date__date__gte=startDate,
                                                                                  appointment__timeBucket__date__date__lte=endDate,
                                                                              cancellationReason__reason=reason).values().count()

                if totalCancelledPerReason == 0:
                    return Response({})

                for eachApptType in allApptTypes:
                    totalCancelledPerReasonPerApptType = AssociatedPatientActions.objects.filter(cancelled=True, appointment__timeBucket__date__date__gte=startDate,
                                                                                                 appointment__timeBucket__date__date__lte=endDate,
                                                                              cancellationReason__reason=reason, appointment__timeBucket__timeslotType=eachApptType['name'],).values().count()
                    percentage = float(totalCancelledPerReasonPerApptType)/float(totalCancelledPerReason) * 100
                    toAdd = {eachApptType['name']: percentage}
                    firstPie.append(toAdd)

                toReturnResponse.append(firstPie)

                for eachMarketingChannel in allmarketingchannels:
                    totalCancelledPerReasonPerChannel = AssociatedPatientActions.objects.filter(cancelled=True, appointment__timeBucket__date__date__gte=startDate,
                                                                                                appointment__timeBucket__date__date__lte=endDate,
                                                                              cancellationReason__reason=reason, patient__marketingChannelId__name=eachMarketingChannel['name'],).values().count()
                    percentage = float(totalCancelledPerReasonPerChannel)/float(totalCancelledPerReason) * 100
                    toAdd = {eachMarketingChannel['name']: percentage}
                    secondPie.append(toAdd)
                toReturnResponse.append(secondPie)
            else:
                firstPie = []
                secondPie = []
                totalCancelledPerReason = AssociatedPatientActions.objects.filter(cancelled=True, appointment__timeBucket__date__date__month=month,
                                                                              cancellationReason__reason=reason).values().count()

                if totalCancelledPerReason == 0:
                    return Response({})

                for eachApptType in allApptTypes:
                    totalCancelledPerReasonPerApptType = AssociatedPatientActions.objects.filter(cancelled=True, appointment__timeBucket__date__date__month=month,
                                                                              cancellationReason__reason=reason, appointment__timeBucket__timeslotType=eachApptType['name'],).values().count()
                    percentage = float(totalCancelledPerReasonPerApptType)/float(totalCancelledPerReason) * 100
                    toAdd = {eachApptType['name']: percentage}
                    firstPie.append(toAdd)

                toReturnResponse.append(firstPie)

                for eachMarketingChannel in allmarketingchannels:
                    totalCancelledPerReasonPerChannel = AssociatedPatientActions.objects.filter(cancelled=True, appointment__timeBucket__date__date__month=month,
                                                                              cancellationReason__reason=reason, patient__marketingChannelId__name=eachMarketingChannel['name'],).values().count()
                    percentage = float(totalCancelledPerReasonPerChannel)/float(totalCancelledPerReason) * 100
                    toAdd = {eachMarketingChannel['name']: percentage}
                    secondPie.append(toAdd)
                toReturnResponse.append(secondPie)

            return Response(toReturnResponse)

        elif pieChart == 'Reasons' and pieChartTab == 'NoShow':
            if customFilter == 'True':
                firstPie = []
                secondPie = []
                totalNoShowPerReason = Blacklist.objects.filter(blacklistReason__reason=reason, timeBucket__date__date__gte=startDate,
                                                                timeBucket__date__date__lte=endDate).values().count()

                if totalNoShowPerReason == 0:
                    return Response({})

                for eachApptType in allApptTypes:
                    totalNoShowPerReasonPerApptType = Blacklist.objects.filter(blacklistReason__reason=reason, timeBucket__date__date__gte=startDate,
                                                                               timeBucket__date__date__lte=endDate,
                                                                           apptType=eachApptType['name']).values().count()
                    percentage = float(totalNoShowPerReasonPerApptType)/float(totalNoShowPerReason)
                    toAdd = {eachApptType['name']: percentage}
                    firstPie.append(toAdd)
                toReturnResponse.append(firstPie)

                for eachMarketingChannel in allmarketingchannels:
                    totalNoShowPerReasonPerChannel = Blacklist.objects.filter(blacklistReason__reason=reason, timeBucket__date__date__gte=startDate,
                                                                              timeBucket__date__date__lte=endDate,
                                                                          patient__marketingChannelId__name=eachMarketingChannel['name']).values().count()
                    percentage = float(totalNoShowPerReasonPerChannel)/float(totalNoShowPerReason)
                    toAdd = {eachMarketingChannel['name']: percentage}
                    secondPie.append(toAdd)
                toReturnResponse.append(secondPie)
            else:
                firstPie = []
                secondPie = []
                totalNoShowPerReason = Blacklist.objects.filter(blacklistReason__reason=reason, timeBucket__date__date__month=month).values().count()

                if totalNoShowPerReason == 0:
                    return Response({})

                for eachApptType in allApptTypes:
                    totalNoShowPerReasonPerApptType = Blacklist.objects.filter(blacklistReason__reason=reason, timeBucket__date__date__month=month,
                                                                           apptType=eachApptType['name']).values().count()
                    percentage = float(totalNoShowPerReasonPerApptType)/float(totalNoShowPerReason)
                    toAdd = {eachApptType['name']: percentage}
                    firstPie.append(toAdd)
                toReturnResponse.append(firstPie)

                for eachMarketingChannel in allmarketingchannels:
                    totalNoShowPerReasonPerChannel = Blacklist.objects.filter(blacklistReason__reason=reason, timeBucket__date__date__month=month,
                                                                          patient__marketingChannelId__name=eachMarketingChannel['name']).values().count()
                    percentage = float(totalNoShowPerReasonPerChannel)/float(totalNoShowPerReason)
                    toAdd = {eachMarketingChannel['name']: percentage}
                    secondPie.append(toAdd)
                toReturnResponse.append(secondPie)

            return Response(toReturnResponse)

        elif pieChart == 'Reasons' and pieChartTab == 'Combined':
            if customFilter == 'True':
                firstPie = []
                secondPie = []
                totalCancelledPerReason = AssociatedPatientActions.objects.filter(cancelled=True, appointment__timeBucket__date__date__gte=startDate,
                                                                                  appointment__timeBucket__date__date__lte=endDate,
                                                                              cancellationReason__reason=reason).values().count()
                totalNoShowPerReason = Blacklist.objects.filter(blacklistReason__reason=reason, timeBucket__date__date__gte=startDate,
                                                                timeBucket__date__date__lte=endDate).values().count()
                totalCombinedPerReason = totalCancelledPerReason + totalNoShowPerReason

                if totalCombinedPerReason == 0:
                    return Response({})

                for eachApptType in allApptTypes:
                    totalCancelledPerReasonPerApptType = AssociatedPatientActions.objects.filter(cancelled=True, appointment__timeBucket__date__date__gte=startDate,
                                                                                                 appointment__timeBucket__date__date__lte=endDate,
                                                                                                 cancellationReason__reason=reason,
                                                                                                 appointment__timeBucket__timeslotType=eachApptType['name'],).values().count()
                    totalNoShowPerReasonPerApptType = Blacklist.objects.filter(blacklistReason__reason=reason, timeBucket__date__date__gte=startDate,
                                                                               timeBucket__date__date__lte=endDate,
                                                                               apptType=eachApptType['name']).values().count()
                    totalCombinedPerReasonPerApptType = totalCancelledPerReasonPerApptType + totalNoShowPerReasonPerApptType
                    percentage = float(totalCombinedPerReasonPerApptType)/float(totalCombinedPerReason)
                    toAdd = {eachApptType['name']: percentage}
                    firstPie.append(toAdd)
                toReturnResponse.append(firstPie)

                for eachMarketingChannel in allmarketingchannels:
                    totalCancelledPerReasonPerChannel = AssociatedPatientActions.objects.filter(cancelled=True, appointment__timeBucket__date__date__gte=startDate,
                                                                                                appointment__timeBucket__date__date__lte=endDate,
                                                                                                cancellationReason__reason=reason,
                                                                                                patient__marketingChannelId__name=eachMarketingChannel['name'],).values().count()
                    totalNoShowPerReasonPerChannel = Blacklist.objects.filter(blacklistReason__reason=reason, timeBucket__date__date__gte=startDate,
                                                                              timeBucket__date__date__lte=endDate,
                                                                              patient__marketingChannelId__name=eachMarketingChannel['name']).values().count()
                    totalCombinedPerReasonPerChannel = totalCancelledPerReasonPerChannel + totalNoShowPerReasonPerChannel
                    percentage = float(totalCombinedPerReasonPerChannel)/float(totalCombinedPerReason)
                    toAdd = {eachMarketingChannel['name']: percentage}
                    secondPie.append(toAdd)
                toReturnResponse.append(secondPie)
            else:
                firstPie = []
                secondPie = []
                totalCancelledPerReason = AssociatedPatientActions.objects.filter(cancelled=True, appointment__timeBucket__date__date__month=month,
                                                                              cancellationReason__reason=reason).values().count()
                totalNoShowPerReason = Blacklist.objects.filter(blacklistReason__reason=reason, timeBucket__date__date__month=month).values().count()
                totalCombinedPerReason = totalCancelledPerReason + totalNoShowPerReason

                if totalCombinedPerReason == 0:
                    return Response({})

                for eachApptType in allApptTypes:
                    totalCancelledPerReasonPerApptType = AssociatedPatientActions.objects.filter(cancelled=True, appointment__timeBucket__date__date__month=month,
                                                                              cancellationReason__reason=reason, appointment__timeBucket__timeslotType=eachApptType['name'],).values().count()
                    totalNoShowPerReasonPerApptType = Blacklist.objects.filter(blacklistReason__reason=reason, timeBucket__date__date__month=month,
                                                                           apptType=eachApptType['name']).values().count()
                    totalCombinedPerReasonPerApptType = totalCancelledPerReasonPerApptType + totalNoShowPerReasonPerApptType
                    percentage = float(totalCombinedPerReasonPerApptType)/float(totalCombinedPerReason)
                    toAdd = {eachApptType['name']: percentage}
                    firstPie.append(toAdd)
                toReturnResponse.append(firstPie)

                for eachMarketingChannel in allmarketingchannels:
                    totalCancelledPerReasonPerChannel = AssociatedPatientActions.objects.filter(cancelled=True, appointment__timeBucket__date__date__month=month,
                                                                              cancellationReason__reason=reason, patient__marketingChannelId__name=eachMarketingChannel['name'],).values().count()
                    totalNoShowPerReasonPerChannel = Blacklist.objects.filter(blacklistReason__reason=reason, timeBucket__date__date__month=month,
                                                                          patient__marketingChannelId__name=eachMarketingChannel['name']).values().count()
                    totalCombinedPerReasonPerChannel = totalCancelledPerReasonPerChannel + totalNoShowPerReasonPerChannel
                    percentage = float(totalCombinedPerReasonPerChannel)/float(totalCombinedPerReason)
                    toAdd = {eachMarketingChannel['name']: percentage}
                    secondPie.append(toAdd)
                toReturnResponse.append(secondPie)

            return Response(toReturnResponse)

        return Response({})

class ViewSavedCustomFilters(viewsets.ModelViewSet):
    queryset = CustomFilter.objects.none()
    serializer_class = CustomFilterSerializer

    def list(self, request, *args, **kwargs):
        response_data = CustomFilter.objects.all().values('apptType__name', 'id', 'name', 'startDate', 'endDate')
        return Response(response_data)

    def create(self, request, *args, **kwargs):
        payload = request.data

        name = payload.get('name')
        apptTypes = payload.get('apptTypes')
        startDate = payload.get('startDate')
        endDate = payload.get('endDate')

        newCustomFilter = CustomFilter.objects.create(startDate=startDate, endDate=endDate, name=name,)
        newCustomFilter.apptType = apptTypes

        return Response("Success")

class ViewAllApptTypes(viewsets.ReadOnlyModelViewSet):
    queryset = AppointmentType.objects.none()

    def list(self, request, *args, **kwargs):
        allApptTypes = AppointmentType.objects.all().values()
        return Response(allApptTypes)
