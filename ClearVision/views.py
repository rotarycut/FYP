import base64
from datetime import timedelta, datetime, date
from itertools import chain
import json
from operator import itemgetter
import os
from django.core.exceptions import ObjectDoesNotExist
from django.views.decorators.csrf import csrf_exempt
from monthdelta import monthdelta
import requests
from django.contrib.auth.decorators import login_required
from django.contrib.auth.views import logout_then_login, redirect_to_login
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.template import Context
import django_filters
from rest_framework.renderers import JSONRenderer
from rest_framework import filters
from rest_framework import viewsets
from rest_framework.response import Response
from django.db.models import Q, F, Sum, Case, When, IntegerField, Count, Avg
from .serializers import *
import csv
from django.core.mail import EmailMessage
import StringIO
from django.conf import settings
from django.contrib.auth.models import User
import pusher
pusher = pusher.Pusher(
                app_id='144985',
                key='6cb577c1e7b97150346b',
                secret='e960c0e8a1aefdb7d282',
                ssl=True,
                port=443
            )

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

def conversion(request):
    return render(request, 'conversion.html')

def schedule(request):
    return render(request, 'schedule.html')

def expenditure(request):
    return render(request, 'expenditure.html')

def kpi(request):
    return render(request, 'kpi.html')

def managechannels(request):
    return render(request, 'managechannels.html')

def waitlist(request):
    return render(request, 'waitlist.html')

def queue(request):
    return render(request, 'queue.html')

def msglog(request):
    return render(request, 'msglog.html')

def adminconfig(request):
    return render(request, 'adminconfig.html')

def changepw(request):
    return render(request, 'registration/changepw.html')

@login_required
def changepassword(request):
    payload = request.body
    payload_clean = json.loads(payload)

    old_password = payload_clean['oldpassword']

    error = {'error': 'Wrong old password / New passwords do not match'}
    success = {'error': 'Password changed successfully!Login using your new password now.'}

    if request.user.check_password(old_password):
        new_password = payload_clean['newpassword']
        confirm_new_password = payload_clean['confirmnewpassword']
        if new_password == confirm_new_password:
            request.user.set_password(new_password)
            request.user.save()
            return HttpResponse(success)
        else:
            return HttpResponse(json.dumps(error))
    else:
        return HttpResponse(json.dumps(error))

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
"""
class ClinicFilter(django_filters.FilterSet):
    start_time = django_filters.TimeFilter(name="startHr", lookup_type='lte')
    end_time = django_filters.TimeFilter(name="endHr", lookup_type='gte')

    class Meta:
        model = Clinic
        fields = ['start_time', 'end_time']
"""

class ClinicList(viewsets.ModelViewSet):
    queryset = Clinic.objects.all()
    serializer_class = ClinicSerializer

    def create(self, request, *args, **kwargs):
        payload = request.data

        name = payload.get('name')
        mondayStart = payload.get('mondayStart')
        mondayEnd = payload.get('mondayEnd')
        tuesdayStart = payload.get('tuesdayStart')
        tuesdayEnd = payload.get('tuesdayEnd')
        wednesdayStart = payload.get('wednesdayStart')
        wednesdayEnd = payload.get('wednesdayEnd')
        thursdayStart = payload.get('thursdayStart')
        thursdayEnd = payload.get('thursdayEnd')
        fridayStart = payload.get('fridayStart')
        fridayEnd = payload.get('fridayEnd')
        saturdayStart = payload.get('saturdayStart')
        saturdayEnd = payload.get('saturdayEnd')

        Clinic.objects.create(name=name, mondayStart=mondayStart, mondayEnd=mondayEnd,
                              tuesdayStart=tuesdayStart, tuesdayEnd=tuesdayEnd,
                              wednesdayStart=wednesdayStart, wednesdayEnd=wednesdayEnd,
                              thursdayStart=thursdayStart, thursdayEnd=thursdayEnd,
                              fridayStart=fridayStart, fridayEnd=fridayEnd,
                              saturdayStart=saturdayStart, saturdayEnd=saturdayEnd)

        return Response("Successfully created Clinic")

    def update(self, request, *args, **kwargs):
        payload = request.data

        name = payload.get('name')
        day = payload.get('day')
        start = payload.get('start')
        end = payload.get('end')

        editClinic = Clinic.objects.get(id=self.get_object().id)

        if name is not None:
            editClinic.name = name
        else:
            start += ":00"
            end += ":00"

            if day == 'Monday':
                editClinic.mondayStart = start
                editClinic.mondayEnd = end
            elif day == 'Tuesday':
                editClinic.tuesdayStart = start
                editClinic.tuesdayEnd = end
            elif day == 'Wednesday':
                editClinic.wednesdayStart = start
                editClinic.wednesdayEnd = end
            elif day == 'Thursday':
                editClinic.thursdayStart = start
                editClinic.thursdayEnd = end
            elif day == 'Friday':
                editClinic.fridayStart = start
                editClinic.fridayEnd = end
            elif day == 'Saturday':
                editClinic.saturdayStart = start
                editClinic.saturdayEnd = end

        editClinic.save()

        return Response("Successfully edited a Clinic")

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
        fields = ['contact', 'clinic']


class DoctorList(viewsets.ModelViewSet):
    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer
    filter_backends = (filters.DjangoFilterBackend, filters.OrderingFilter,)
    search_fields = ('name',)
    ordering = ('id',)
    filter_class = DoctorFilter

    def create(self, request, *args, **kwargs):
        pusher.trigger('freezeinstances', 'statusupdate', {'message': True})

        payload = request.data

        name = payload.get('name')
        contact =payload.get('contact')
        isDoctor = payload.get('isDoctor')

        Doctor.objects.create(name=name, contact=contact, isDoctor=isDoctor)

        doc = Doctor.objects.get(name=name, contact=contact, isDoctor=isDoctor)

        clinic = payload.get('clinic')
        apptType = payload.get('apptType')

        for eachClinic in clinic:
            doc.clinic.add(Clinic.objects.get(id=eachClinic))

        apptTypeChars = []
        for eachApptType in apptType:
            appointmentType = AppointmentType.objects.get(id=eachApptType.get('id'))
            doc.apptType.add(appointmentType)
            apptTypeChars.append(appointmentType.name)

            daysTimeslots = eachApptType.get('days')
            mondayArray = daysTimeslots[0]
            tuesdayArray = daysTimeslots[1]
            wednesdayArray = daysTimeslots[2]
            thursdayArray = daysTimeslots[3]
            fridayArray = daysTimeslots[4]
            saturdayArray = daysTimeslots[5]

            monday = ",".join(str(eachTimeSlot + ":00") for eachTimeSlot in mondayArray)
            tuesday = ",".join(str(eachTimeSlot + ":00") for eachTimeSlot in tuesdayArray)
            wednesday = ",".join(str(eachTimeSlot + ":00") for eachTimeSlot in wednesdayArray)
            thursday = ",".join(str(eachTimeSlot + ":00") for eachTimeSlot in thursdayArray)
            friday = ",".join(str(eachTimeSlot + ":00") for eachTimeSlot in fridayArray)
            saturday = ",".join(str(eachTimeSlot + ":00") for eachTimeSlot in saturdayArray)

            DoctorDayTimeSlots.objects.create(doctor=doc, apptType=appointmentType,
                                          monday=monday, tuesday=tuesday, wednesday=wednesday, thursday=thursday,
                                          friday=friday, saturday=saturday)

        for eachApptTypeName in apptTypeChars:

            command = "python ClearVision/AvailableTimeSlotsGenerator.py " + str(doc.id) + " \"" + eachApptTypeName + "\""
            os.system(command)

            command = "python manage.py loaddata NewDoctorAvailableTimeSlotsDump"
            os.system(command)

        pusher.trigger('freezeinstances', 'statusupdate', {'message': False})
        return Response('Doctor created successfully')

    def destroy(self, request, *args, **kwargs):
        payload = request.data

        password = payload.get('password')

        if User.objects.get(username='admin').check_password(password):
            deathRowDoctor = Doctor.objects.get(id=self.get_object().id)
            deathRowDoctor.delete()

            return Response("Doctor Deleted Successfully")
        else:
            return Response("Invalid Admin Password!")

class EditDoctorAppointmentTypes(viewsets.ModelViewSet):
    queryset = Doctor.objects.none()
    serializer_class = DoctorSerializer

    #Add Appt type to doctor, also create doctor timeslots in 1 single POST
    def create(self, request, *args, **kwargs):
        pusher.trigger('freezeinstances', 'statusupdate', {'message': True})
        payload = request.data

        doctorID = payload.get('doctorID')
        apptTypeID = payload.get('apptTypeID')

        hotshotdoctor = Doctor.objects.get(id=doctorID)
        apptObj = AppointmentType.objects.get(id=apptTypeID)

        hotshotdoctor.apptType.add(apptObj)
        hotshotdoctor.save()

        year = datetime.today().year

        command = "python ClearVision/AvailableTimeSlotsGenerator.py " + str(year) + " " + str(hotshotdoctor.id) + " \"" + str(apptObj.name) + "\""
        os.system(command)

        command = "python manage.py loaddata NewDoctorAvailableTimeSlotsDump"
        os.system(command)

        mondayArray = payload.get('monday')
        tuesdayArray = payload.get('tuesday')
        wednesdayArray = payload.get('wednesday')
        thursdayArray = payload.get('thursday')
        fridayArray = payload.get('friday')
        saturdayArray = payload.get('saturday')

        monday = ",".join(str(eachTimeSlot + ":00") for eachTimeSlot in mondayArray)
        tuesday = ",".join(str(eachTimeSlot + ":00") for eachTimeSlot in tuesdayArray)
        wednesday = ",".join(str(eachTimeSlot + ":00") for eachTimeSlot in wednesdayArray)
        thursday = ",".join(str(eachTimeSlot + ":00") for eachTimeSlot in thursdayArray)
        friday = ",".join(str(eachTimeSlot + ":00") for eachTimeSlot in fridayArray)
        saturday = ",".join(str(eachTimeSlot + ":00") for eachTimeSlot in saturdayArray)

        DoctorDayTimeSlots.objects.create(doctor=hotshotdoctor, apptType=apptObj,
                                          monday=monday, tuesday=tuesday, wednesday=wednesday, thursday=thursday,
                                          friday=friday, saturday=saturday)
        pusher.trigger('freezeinstances', 'statusupdate', {'message': False})
        return Response('Appointment type added successfully')

    def destroy(self, request, *args, **kwargs):
        payload = request.data

        doctorID = payload.get('doctorID')
        apptTypeID = payload.get('apptTypeID')
        password = payload.get('password')

        if User.objects.get(username='admin').check_password(password):
            coldshotdoctor = Doctor.objects.get(id=doctorID)
            coldshotappttype = AppointmentType.objects.get(id=apptTypeID)

            DoctorDayTimeSlots.objects.get(doctor=coldshotdoctor, apptType=coldshotappttype).delete()

            AvailableTimeSlots.objects.filter(timeslotType=coldshotappttype.name, doctors=coldshotdoctor).delete()

            coldshotdoctor.apptType.remove(coldshotappttype)
            coldshotdoctor.save()

            return Response("Successfully removed appointment type")
        else:
            return Response("Invalid Admin Password!")

class AppointmentTypeNotTaggedToDoctor(viewsets.ReadOnlyModelViewSet):
    queryset = Doctor.objects.none()

    def list(self, request, *args, **kwargs):
        doctorID = request.query_params.get('doctorID')

        allApptTypes = AppointmentType.objects.all()
        doctorApptTypes = Doctor.objects.get(id=doctorID).apptType.all() #NOTE for manyTOmany relationships!!!

        AppointmentTypeNotTaggedToDoctor = []

        for eachApptType in allApptTypes:
            if eachApptType not in doctorApptTypes:
                AppointmentTypeNotTaggedToDoctor.append({"id": eachApptType.id, "name": eachApptType.name})

        return Response(AppointmentTypeNotTaggedToDoctor)

class CheckFutureNumberOfAppointmentsUnderDoctor(viewsets.ModelViewSet):
    queryset = Appointment.objects.none()
    serializer_class = AppointmentSerializer

    def list(self, request, *args, **kwargs):
        doctorID = request.query_params.get('doctorID')

        allApptsCount = Appointment.objects.filter(doctor__id=doctorID, timeBucket__date__gte=date.today()).\
        exclude(patients__isnull=True).count()

        return Response(allApptsCount)

    def create(self, request, *args, **kwargs):
        payload = request.data

        emailAddress = payload.get('emailAddress')
        doctorID = payload.get('doctorID')

        futureApptsForDoc = Appointment.objects.filter(timeBucket__date__gte=date.today(), doctor__id=doctorID).\
                                           values('patients__contact', 'patients__name', 'patients__gender', 'timeBucket__date', 'timeBucket__start', 'apptType', 'id', 'doctor__name', 'clinic', 'doctor').\
                                           exclude(patients__isnull=True)

        csvfile = StringIO.StringIO()
        csvwriter = csv.writer(csvfile)

        csvwriter.writerow(['patients_contact', 'patients__name', 'patients__gender', 'timeBucket__date', 'timeBucket__start',
                        'apptType', 'id', 'doctor__name', 'clinic', 'doctor'])

        for eachObj in futureApptsForDoc:
            csvwriter.writerow([eachObj['patients__contact'], eachObj['patients__name'], eachObj['patients__gender'], eachObj['timeBucket__date'],
                                eachObj['timeBucket__start'], eachObj['apptType'], eachObj['id'], eachObj['doctor__name'],
                                eachObj['clinic'], eachObj['doctor']])

        message = EmailMessage("Appointment backlog for  " + str(Doctor.objects.get(id=doctorID).name), "", to=[emailAddress])
        message.attach('apptBacklog.csv', csvfile.getvalue(), 'text/csv')

        message.send()

        return Response('Email sent successfully')

class DoctorCalendarSideTab(viewsets.ReadOnlyModelViewSet):
    queryset = Doctor.objects.none()

    def list(self, request, *args, **kwargs):
        docs = Doctor.objects.all().order_by('id')

        toReturn = []
        counter = 0

        for eachDoc in docs:
            apptTypesEachDoc = eachDoc.apptType.all()

            appointmentTypeArray = []
            appointmentTypeSourceArray = []
            appointmentTypeColorArray = []

            for EachApptTypesEachDoc in apptTypesEachDoc:
                appointmentTypeArray.append(EachApptTypesEachDoc.name)
                appointmentTypeSourceArray.append(eachDoc.name.replace(" ", "") + EachApptTypesEachDoc.name.replace(" ", ""))
                appointmentTypeColorArray.append({"type": eachDoc.name.replace(" ", "") + EachApptTypesEachDoc.name.replace(" ", ""),
                                                   "color": CalendarColorSettings.objects.get(apptType__id=EachApptTypesEachDoc.id).hex,
                                                   "textColor": "White", "name": EachApptTypesEachDoc.name})

            toReturn.append({"doctorId": eachDoc.id,
                             "appointmentTypeArray": appointmentTypeArray,
                             "doctorAppointmentSource": eachDoc.name.replace(" ", "") + "appointments",
                             "appointmentTypeSourceArray": appointmentTypeSourceArray,
                             "appointmentTypeColorArray": appointmentTypeColorArray,
                             "calendarTag": counter,
                             "title": eachDoc.name,
                             "calendar": eachDoc.name.replace(" ", "") + "calendar",
                             "changeCalendar": "myCalendar" + str(counter),
                             "active": "false",
                             "disable": "false"})
            counter += 1

        return Response(toReturn)

def WriteDatabaseFullYear(request):
    payload = request.GET

    year = payload['year']

    command = "python ClearVision/loadCalendarData.py " + year

    os.system(command)

    command = "python manage.py loaddata calendardump"

    os.system(command)

    return HttpResponse("Success")

class AppointmentFilter(django_filters.FilterSet):
    startDate = django_filters.DateFilter(name='timeBucket__date__date', lookup_type='gte',)
    endDate = django_filters.CharFilter(name='timeBucket__date__date', lookup_type='lte',)
    year = django_filters.CharFilter(name='timeBucket__date__date', lookup_type='year')

    class Meta:
        model = Appointment
        fields = {'patients', 'doctor', 'clinic', 'year', 'endDate', 'apptType', 'startDate'}


class AppointmentList(viewsets.ModelViewSet):
    # renderer_classes = (JSONRenderer,)
    queryset = Appointment.objects.exclude(patients=None).all()
    serializer_class = AppointmentSerializer
    filter_backends = (filters.DjangoFilterBackend, filters.SearchFilter,)
    filter_class = AppointmentFilter
    """
    def list(self, request, *args, **kwargs):
        appointments = Appointment.objects.filter(timeBucket__date__lte=date.today() + timedelta(days=30)).values('patients__contact', 'patients__name',
                                                                                                              'patients__gender', 'timeBucket__date',
                                                                                                              'timeBucket__start', 'apptType', 'id',
                                                                                                              'timeBucket', 'doctor__name', 'clinic',
                                                                                                              'doctor').\
            exclude(patients__isnull=True)
        return Response(appointments)
    """
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
            #Swapper.objects.filter(patient=temp_patients[0]['id'], tempAppt=a).update(swappable=True)
            Swapper.objects.filter(tempAppt=a).update(swappable=True)

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

        serializedExistingAppt = AppointmentSerializer(a)
        socketId = data.get('socketId')
        pusher.trigger('appointmentsCUD', 'deleteAppt', {'message': json.dumps(serializedExistingAppt.data)}, socketId)
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
        smsOptOut = data.get('smsOptOut')

        socketId = data.get('socketId')

        if data.get('tempTime') and data.get('tempDate') is not "" and isWaitingList == 'True':
            tempApptTimeBucket = data.get('tempTime') + ":00"
            tempApptDate = data.get('tempDate')

        if not Patient.objects.filter(contact=patientContact, name=patientName).exists():     #DAMN IMPT SHIT
            Patient.objects.create(name=patientName, gender=patientGender, contact=patientContact,
                                   marketingChannelId=MarketingChannels.objects.get(id=marketingID),
                                   registrationDate=datetime.today(), smsOptOut=smsOptOut)

        p = Patient.objects.get(contact=patientContact, name=patientName)
        apptTimeBucketID = AvailableTimeSlots.objects.get(start=apptTimeBucket, timeslotType=apptType, date=apptDate, doctors=docID).id

        if Appointment.objects.filter(date=apptDate, timeBucket__start=apptTimeBucket, apptType=apptType, doctor=docID).exists():

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
                                                                      date=tempApptDate, doctors=docID).id

                if Appointment.objects.filter(date=tempApptDate, timeBucket__start=tempApptTimeBucket,
                                              apptType=apptType).exists():

                    tempExistingAppt = Appointment.objects.get(date=tempApptDate, timeBucket=tempApptTimeBucketID,
                                                               apptType=apptType)
                    tempExistingAppt.tempPatients.add(p)
                    tempExistingAppt.save()

                    if Swapper.objects.filter(tempAppt=tempExistingAppt, swappable=True).exists():
                        Swapper.objects.create(patient=p, scheduledAppt=existingAppt, tempAppt=tempExistingAppt,
                                               swappable=True, hasRead=False, sentSMSTime=None).save()
                    else:
                        Swapper.objects.create(patient=p, scheduledAppt=existingAppt, tempAppt=tempExistingAppt,
                                               swappable=False, hasRead=False, sentSMSTime=None).save()
                    AppointmentRemarks.objects.create(patient=p, appointment=tempExistingAppt, remarks=remarks).save()
                else:

                    Appointment.objects.create(apptType=apptType, date=tempApptDate,
                                               doctor=Doctor.objects.get(id=docID),
                                               clinic=Clinic.objects.get(id=clinicID),
                                               timeBucket=AvailableTimeSlots.objects.get(
                                                   id=tempApptTimeBucketID)).tempPatients.add(p)

                    tempExistingAppt = Appointment.objects.get(date=tempApptDate, timeBucket=tempApptTimeBucketID,
                                                               apptType=apptType)
                    if Swapper.objects.filter(tempAppt=tempExistingAppt, swappable=True).exists():
                        Swapper.objects.create(patient=p, scheduledAppt=existingAppt, tempAppt=tempExistingAppt,
                                               swappable=True, hasRead=False, sentSMSTime=None).save()
                    else:
                        Swapper.objects.create(patient=p, scheduledAppt=existingAppt, tempAppt=tempExistingAppt,
                                               swappable=False, hasRead=False, sentSMSTime=None).save()
                    AppointmentRemarks.objects.create(patient=p, appointment=tempExistingAppt, remarks=remarks).save()

            pusher.trigger('appointmentsCUD', 'createAppt', {'message': json.dumps(serializedExistingAppt.data)}, socketId)
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
                                                                      date=tempApptDate, doctors=docID).id

                if Appointment.objects.filter(date=tempApptDate, timeBucket__start=tempApptTimeBucket,
                                              apptType=apptType).exists():

                    tempExistingAppt = Appointment.objects.get(date=tempApptDate, timeBucket=tempApptTimeBucketID,
                                                               apptType=apptType)
                    tempExistingAppt.tempPatients.add(p)
                    tempExistingAppt.save()

                    if Swapper.objects.filter(tempAppt=tempExistingAppt, swappable=True).exists():
                        Swapper.objects.create(patient=p, scheduledAppt=existingAppt, tempAppt=tempExistingAppt,
                                               swappable=True, hasRead=False, sentSMSTime=None).save()
                    else:
                        Swapper.objects.create(patient=p, scheduledAppt=existingAppt, tempAppt=tempExistingAppt,
                                               swappable=False, hasRead=False, sentSMSTime=None).save()
                    AppointmentRemarks.objects.create(patient=p, appointment=tempExistingAppt, remarks=remarks).save()
                else:

                    Appointment.objects.create(apptType=apptType, date=tempApptDate,
                                               doctor=Doctor.objects.get(id=docID),
                                               clinic=Clinic.objects.get(id=clinicID),
                                               timeBucket=AvailableTimeSlots.objects.get(
                                                   id=tempApptTimeBucketID)).tempPatients.add(p)

                    tempExistingAppt = Appointment.objects.get(date=tempApptDate, timeBucket=tempApptTimeBucketID,
                                                               apptType=apptType)

                    if Swapper.objects.filter(tempAppt=tempExistingAppt, swappable=True).exists():
                        Swapper.objects.create(patient=p, scheduledAppt=existingAppt, tempAppt=tempExistingAppt,
                                               swappable=True, hasRead=False, sentSMSTime=None).save()
                    else:
                        Swapper.objects.create(patient=p, scheduledAppt=existingAppt, tempAppt=tempExistingAppt,
                                               swappable=False, hasRead=False, sentSMSTime=None).save()
                    AppointmentRemarks.objects.create(patient=p, appointment=tempExistingAppt, remarks=remarks).save()

            serializedExistingAppt = AppointmentSerializer(existingAppt)
            pusher.trigger('appointmentsCUD', 'createAppt', {'message': json.dumps(serializedExistingAppt.data)}, socketId)
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
        newPatientName = data.get('patientName')
        newPatientContact = data.get('patientContact')
        smsOptOut = data.get('smsOptOut')

        socketId = data.get('socketId')

        patient.name = newPatientName
        patient.contact = newPatientContact
        patient.smsOptOut = smsOptOut
        patient.save()

        currentAppt.patients.remove(patient)
        currentAppt.save()
        oldRemarks = AppointmentRemarks.objects.get(appointment=currentAppt.id, patient=patient.id)

        if currentAppt.tempPatients.count() >= 1:
            #Swapper.objects.filter(patient=currentAppt.tempPatients.first(), tempAppt=currentAppt).update(swappable=True)
            Swapper.objects.filter(tempAppt=currentAppt).update(swappable=True)

        if currentAppt.apptType != apptType:
            tempApptSwapperObj = Swapper.objects.filter(patient=patient, scheduledAppt=currentAppt,)
            tempApptSwapperObj.delete()

        if AttendedAppointment.objects.filter(patient=patient, originalAppt=currentAppt, attended=False, doctor=docID).exists():
            AttendedAppointment.objects.filter(patient=patient, originalAppt=currentAppt, attended=False, doctor=docID).delete()

        setQueueToNone = AssociatedPatientActions.objects.get(patient=patient, appointment=currentAppt)
        setQueueToNone.addedToQueue = None
        setQueueToNone.save()

        """
        if currentAppt.patients.count() == 0:
            currentAppt.delete()
        """

        apptTimeBucketID = AvailableTimeSlots.objects.filter(start=futureApptTimeBucket, date=futureApptDate,
                                                             timeslotType=apptType, doctors=docID)

        if Appointment.objects.filter(date=futureApptDate, timeBucket__start=futureApptTimeBucket,
                                      apptType=apptType, timeBucket__id=apptTimeBucketID).exists():
            existingFutureAppt = Appointment.objects.get(date=futureApptDate, timeBucket=apptTimeBucketID,
                                                         apptType=apptType)
            existingFutureAppt.patients.add(patient)
            existingFutureAppt.save()

            oldRemarks.appointment = existingFutureAppt
            oldRemarks.remarks = newRemarks
            oldRemarks.save()

            toUpdateNewAppt = AssociatedPatientActions.objects.get(patient=patient, appointment=currentAppt)
            toUpdateNewAppt.appointment = existingFutureAppt
            toUpdateNewAppt.save()

            serializedExistingFutureAppt = AppointmentSerializer(existingFutureAppt)
            pusher.trigger('appointmentsCUD', 'updateAppt', {'message': json.dumps(serializedExistingFutureAppt.data)}, socketId)
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

            toUpdateNewAppt = AssociatedPatientActions.objects.get(patient=patient, appointment=currentAppt)
            toUpdateNewAppt.appointment = existingFutureAppt
            toUpdateNewAppt.save()

            serializedExistingFutureAppt = AppointmentSerializer(existingFutureAppt)
            pusher.trigger('appointmentsCUD', 'updateAppt', {'message': json.dumps(serializedExistingFutureAppt.data)}, socketId)
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

        year = request.query_params.get('year')
        month = request.query_params.get('month')
        channels = request.query_params.get('channels')

        sortValue = request.query_params.get('sortValue')

        if filterFlag == 'True':
            channels = channels.split(',')

        startDate = request.query_params.get('startDate')
        endDate = request.query_params.get('endDate')

        if filterFlag == 'True':
            if timelineFlag == 'False':
                """
                response_data = Patient.objects.filter(registrationDate__gte=startDate, registrationDate__lte=endDate). \
                    annotate(channelname=F('marketingChannelId__name')).filter(channelname__in=channels).values(
                    'channelname'). \
                    annotate(leads=Count('channelname')).order_by('leads'). \
                    annotate(
                    convert=Sum(
                        Case(When(conversion=True, then=1), When(conversion=False, then=0), output_field=IntegerField())
                    )
                )
                """
                response_data = Patient.objects.filter(registrationDate__gte=startDate, registrationDate__lte=endDate)\
                                               .annotate(channelname=F('marketingChannelId__name')).filter(channelname__in=channels).values('channelname')\
                                               .annotate(leads=Count('channelname')).order_by('leads')

                patientBucket = Patient.objects.filter(registrationDate__gte=startDate, registrationDate__lte=endDate)\
                                               .annotate(channelname=F('marketingChannelId__name')).filter(channelname__in=channels).values('channelname','id')\
                                               .annotate(leads=Count('channelname')).order_by('leads')

                apptType = AppointmentType.objects.get(id=3)  #Surgery Appt

                for eachObj2 in response_data:
                    eachObj2['convert'] = 0

                for eachObj in patientBucket:
                    try:
                        AttendedAppointment.objects.get(patient=eachObj.get('id'), apptType=apptType.name)
                        for eachObj2 in response_data:
                            if eachObj['channelname'] == eachObj2['channelname']:
                                eachObj2['convert'] += 1
                    except ObjectDoesNotExist:
                        pass

                set_channels = []

                for eachObj in response_data:
                    leads = eachObj['leads']
                    convert = eachObj['convert']
                    rate = float(convert) / float(leads) * 100
                    eachObj['rate'] = rate
                    set_channels.append(eachObj['channelname'])

                response_data = list(response_data)

                for eachchannel in channels:
                    if eachchannel not in set_channels:
                        response_data.append({
                            "channelname": eachchannel,
                            "leads": 0,
                            "convert": 0,
                            "rate": 0.0
                        })

                if sortValue == 'Leads':
                    return Response(sorted(response_data, key=itemgetter('leads'), reverse=True))
                elif sortValue == 'Convert':
                    return Response(sorted(response_data, key=itemgetter('convert'), reverse=True))
                elif sortValue == 'Rate':
                    return Response(sorted(response_data, key=itemgetter('rate'), reverse=True))
                else:
                    return Response(response_data)

            else:
                marketed_list = Patient.objects.filter(registrationDate__gte=startDate, registrationDate__lte=endDate). \
                    annotate(channelname=F('marketingChannelId__name')).filter(channelname__in=channels).values()
                date_range = FullYearCalendar.objects.filter(date__gte=startDate, date__lte=endDate).values('date')

                marketing_channels = []

                for eachObj in date_range:
                    for eachObj2 in marketed_list:
                        if eachObj['date'] == eachObj2['registrationDate']:
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
                """
                response_data = Patient.objects.filter(registrationDate__month=month). \
                    annotate(channelname=F('marketingChannelId__name')).values(
                    'channelname'). \
                    annotate(leads=Count('channelname')).order_by('leads'). \
                    annotate(
                    convert=Sum(
                        Case(When(conversion=True, then=1), When(conversion=False, then=0), output_field=IntegerField())
                    )
                )
                """
                response_data = Patient.objects.filter(registrationDate__month=month, registrationDate__year=year)\
                                               .annotate(channelname=F('marketingChannelId__name')).values('channelname')\
                                               .annotate(leads=Count('channelname')).order_by('leads')

                patientBucket = Patient.objects.filter(registrationDate__month=month, registrationDate__year=year)\
                                               .annotate(channelname=F('marketingChannelId__name')).values('channelname','id')\
                                               .annotate(leads=Count('channelname')).order_by('leads')

                apptType = AppointmentType.objects.get(id=3)  #Surgery Appt

                for eachObj2 in response_data:
                    eachObj2['convert'] = 0

                for eachObj in patientBucket:
                    try:
                        AttendedAppointment.objects.get(patient=eachObj.get('id'), apptType=apptType.name)
                        for eachObj2 in response_data:
                            if eachObj['channelname'] == eachObj2['channelname']:
                                eachObj2['convert'] += 1
                    except ObjectDoesNotExist:
                        pass

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

                if sortValue == 'Leads':
                    return Response(sorted(response_data, key=itemgetter('leads'), reverse=True))
                elif sortValue == 'Convert':
                    return Response(sorted(response_data, key=itemgetter('convert'), reverse=True))
                elif sortValue == 'Rate':
                    return Response(sorted(response_data, key=itemgetter('rate'), reverse=True))
                else:
                    return Response(response_data)

            else:
                marketed_list = Patient.objects.filter(registrationDate__month=month, registrationDate__year=year). \
                    annotate(channelname=F('marketingChannelId__name')).values()
                date_range = FullYearCalendar.objects.filter(date__month=month, date__year=year).values('date')

                for eachObj in date_range:
                    for eachObj2 in marketed_list:
                        if eachObj['date'] == eachObj2['registrationDate']:
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

class ViewROIChart(viewsets.ReadOnlyModelViewSet):
    queryset = MarketingChannels.objects.none()

    def list(self, request, *args, **kwargs):
        channel = request.query_params.getlist('channel')
        default = request.query_params.get('default')
        month = request.query_params.get('month')
        year = request.query_params.get('year')
        sortValue = request.query_params.get('sortValue')

        toReturnResponse = []

        if default == 'True':
            allMarketingChannels = MarketingChannels.objects.filter(datePurchased__month=month, datePurchased__year=year).values()
            for eachChannel in allMarketingChannels:
                totalCost = eachChannel['cost']
                """
                totalPatientCount = Patient.objects.filter(conversion=True, registrationDate__month=month,
                                                           marketingChannelId__name=eachChannel['name']).values().count()
                """
                apptType = AppointmentType.objects.get(id=3)
                totalPatientCount = AttendedAppointment.objects.filter(patient__registrationDate__month=month,
                                                                       patient__registrationDate__year=year,
                                                                       patient__marketingChannelId__name=eachChannel['name'],
                                                                       apptType=apptType.name).values().count()
                if totalCost != 0:
                    roi = (totalPatientCount * 3388) / totalCost
                else:
                    roi = (totalPatientCount * 3388)
                toReturnResponse.append({'channelname': eachChannel['name'], 'roi': roi, 'Expenditure': totalCost, 'Revenue': totalPatientCount * 3388})
        else:
            for eachChannel in channel:
                try:
                    totalCost = MarketingChannels.objects.get(name=eachChannel, datePurchased__month=month, datePurchased__year=year).cost
                    """
                    totalPatientCount = Patient.objects.filter(conversion=True, marketingChannelId__name=eachChannel,
                                                           registrationDate__month=month).values().count()
                    """
                    apptType = AppointmentType.objects.get(id=3)
                    totalPatientCount = AttendedAppointment.objects.filter(patient__registrationDate__month=month,
                                                                           patient__registrationDate__year=year,
                                                                           patient__marketingChannelId__name=eachChannel,
                                                                           apptType=apptType.name).values().count()
                    if totalCost != 0:
                        roi = (totalPatientCount * 3388) / totalCost
                    else:
                        roi = (totalPatientCount * 3388)

                    toReturnResponse.append({'channelname': eachChannel, 'roi': roi, 'Expenditure': totalCost, 'Revenue': totalPatientCount * 3388})
                except ObjectDoesNotExist:
                    continue
        if sortValue == 'roi':
            return Response(sorted(toReturnResponse, key=itemgetter('roi'), reverse=True))
        elif sortValue == 'Expenditure':
            return Response(sorted(toReturnResponse, key=itemgetter('Expenditure'), reverse=True))
        elif sortValue == 'Revenue':
            return Response(sorted(toReturnResponse, key=itemgetter('Revenue'), reverse=True))
        else:
            return Response(toReturnResponse)

class ViewSavedROICustomFilters(viewsets.ModelViewSet):
    queryset = CustomFilterROI.objects.none()
    serializer_class = CustomFilterROISerializer

    def list(self, request, *args, **kwargs):
        response_data = CustomFilterROI.objects.all().values()
        return Response(response_data)

    def create(self, request, *args, **kwargs):
        payload = request.data

        name = payload.get('name')
        channelTypes = payload.get('channelTypes')
        month = payload.get('month')
        year = payload.get('year')

        newCustomFilter = CustomFilterROI.objects.create(name=name, month=month, year=year)
        newCustomFilter.channelType = channelTypes

        return Response("Success")

class EditSavedROICustomFilters(viewsets.ModelViewSet):
    queryset = CustomFilterROI.objects.all()
    serializer_class = CustomFilterROISerializer

    def list(self, request, *args, **kwargs):
        id = request.query_params.get('id')

        customfilter = CustomFilterROI.objects.get(id=id)

        return Response(CustomFilterROISerializer(customfilter).data)

    def create(self, request, *args, **kwargs):
        payload = request.data

        customfilterID = payload.get('customfilterID')
        name = payload.get('name')
        month = payload.get('month')
        year = payload.get('year')
        channelTypes = payload.get('channelTypes')

        customfilter = CustomFilterROI.objects.get(id=customfilterID)
        customfilter.name = name
        customfilter.month = month
        customfilter.year = year
        customfilter.channelType = channelTypes
        customfilter.save()

        return Response("Success")

    def destroy(self, request, *args, **kwargs):
        CustomFilterROI.objects.get(id=self.get_object().id).delete()

        return Response("Success")

class ViewApplicableROIChannels(viewsets.ReadOnlyModelViewSet):
    queryset = CustomFilterROI.objects.none()

    def list(self, request, *args, **kwargs):
        month = request.query_params.get('month')
        year = request.query_params.get('year')

        """
        surgeryAppt = AppointmentType.objects.get(id=3)
        applicableChannels = AttendedAppointment.objects.filter(apptType=surgeryAppt.name,
                                                                patient__registrationDate__month=month,
                                                                patient__registrationDate__year=year,)\
                                                        .values('patient__marketingChannelId__name', 'patient__marketingChannelId').distinct()
        applicableChannelsFormatted = []
        for eachObj in applicableChannels:
            applicableChannelsFormatted.append({'id': eachObj['patient__marketingChannelId'], 'name': eachObj['patient__marketingChannelId__name']})
        """

        applicableChannels = MarketingChannels.objects.filter(datePurchased__month=month, datePurchased__year=year).values()
        return Response(applicableChannels)

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

        doctordaytimeslot = DoctorDayTimeSlots.objects.get(doctor=docName, apptType__name=type)

        MONDAY_SLOTS = filter(None, doctordaytimeslot.monday.split(','))
        TUESDAY_SLOTS = filter(None, doctordaytimeslot.tuesday.split(','))
        WEDNESDAY_SLOTS = filter(None, doctordaytimeslot.wednesday.split(','))
        THURSDAY_SLOTS = filter(None, doctordaytimeslot.thursday.split(','))
        FRIDAY_SLOTS = filter(None, doctordaytimeslot.friday.split(','))
        SATURDAY_SLOTS = filter(None, doctordaytimeslot.saturday.split(','))

        response_data = []

        monday = FullYearCalendar.objects.filter(date__lte=datetime.now() + timedelta(days=monthsAhead * 30),
                                                            date__gte=datetime.now(),
                                                            availabletimeslots__timeslotType=type,
                                                            availabletimeslots__doctors=docName, day='Monday',
                                                            availabletimeslots__start__in=MONDAY_SLOTS). \
            annotate(title=Count('availabletimeslots__appointment__patients')). \
            annotate(timeslotType=F('availabletimeslots__timeslotType')). \
            annotate(start=F('availabletimeslots__start')). \
            annotate(end=F('availabletimeslots__end')). \
            annotate(apptId=F('availabletimeslots__appointment__id')). \
            filter(title__lte=upperB, title__gte=lowerB, ). \
            values('day', 'date', 'start', 'end', 'apptId', 'timeslotType', 'title').order_by('date', 'start')

        tuesday = FullYearCalendar.objects.filter(date__lte=datetime.now() + timedelta(days=monthsAhead * 30),
                                                            date__gte=datetime.now(),
                                                            availabletimeslots__timeslotType=type,
                                                            availabletimeslots__doctors=docName, day='Tuesday',
                                                            availabletimeslots__start__in=TUESDAY_SLOTS). \
            annotate(title=Count('availabletimeslots__appointment__patients')). \
            annotate(timeslotType=F('availabletimeslots__timeslotType')). \
            annotate(start=F('availabletimeslots__start')). \
            annotate(end=F('availabletimeslots__end')). \
            annotate(apptId=F('availabletimeslots__appointment__id')). \
            filter(title__lte=upperB, title__gte=lowerB, ). \
            values('day', 'date', 'start', 'end', 'apptId', 'timeslotType', 'title').order_by('date', 'start')

        wednesday = FullYearCalendar.objects.filter(date__lte=datetime.now() + timedelta(days=monthsAhead * 30),
                                                            date__gte=datetime.now(),
                                                            availabletimeslots__timeslotType=type,
                                                            availabletimeslots__doctors=docName, day='Wednesday',
                                                            availabletimeslots__start__in=WEDNESDAY_SLOTS). \
            annotate(title=Count('availabletimeslots__appointment__patients')). \
            annotate(timeslotType=F('availabletimeslots__timeslotType')). \
            annotate(start=F('availabletimeslots__start')). \
            annotate(end=F('availabletimeslots__end')). \
            annotate(apptId=F('availabletimeslots__appointment__id')). \
            filter(title__lte=upperB, title__gte=lowerB, ). \
            values('day', 'date', 'start', 'end', 'apptId', 'timeslotType', 'title').order_by('date', 'start')

        thursday = FullYearCalendar.objects.filter(date__lte=datetime.now() + timedelta(days=monthsAhead * 30),
                                                            date__gte=datetime.now(),
                                                            availabletimeslots__timeslotType=type,
                                                            availabletimeslots__doctors=docName, day='Thursday',
                                                            availabletimeslots__start__in=THURSDAY_SLOTS). \
            annotate(title=Count('availabletimeslots__appointment__patients')). \
            annotate(timeslotType=F('availabletimeslots__timeslotType')). \
            annotate(start=F('availabletimeslots__start')). \
            annotate(end=F('availabletimeslots__end')). \
            annotate(apptId=F('availabletimeslots__appointment__id')). \
            filter(title__lte=upperB, title__gte=lowerB, ). \
            values('day', 'date', 'start', 'end', 'apptId', 'timeslotType', 'title').order_by('date', 'start')

        friday = FullYearCalendar.objects.filter(date__lte=datetime.now() + timedelta(days=monthsAhead * 30),
                                                            date__gte=datetime.now(),
                                                            availabletimeslots__timeslotType=type,
                                                            availabletimeslots__doctors=docName, day='Friday',
                                                            availabletimeslots__start__in=FRIDAY_SLOTS). \
            annotate(title=Count('availabletimeslots__appointment__patients')). \
            annotate(timeslotType=F('availabletimeslots__timeslotType')). \
            annotate(start=F('availabletimeslots__start')). \
            annotate(end=F('availabletimeslots__end')). \
            annotate(apptId=F('availabletimeslots__appointment__id')). \
            filter(title__lte=upperB, title__gte=lowerB, ). \
            values('day', 'date', 'start', 'end', 'apptId', 'timeslotType', 'title').order_by('date', 'start')

        saturday = FullYearCalendar.objects.filter(date__lte=datetime.now() + timedelta(days=monthsAhead * 30),
                                                            date__gte=datetime.now(),
                                                            availabletimeslots__timeslotType=type,
                                                            availabletimeslots__doctors=docName, day='Saturday',
                                                            availabletimeslots__start__in=SATURDAY_SLOTS). \
            annotate(title=Count('availabletimeslots__appointment__patients')). \
            annotate(timeslotType=F('availabletimeslots__timeslotType')). \
            annotate(start=F('availabletimeslots__start')). \
            annotate(end=F('availabletimeslots__end')). \
            annotate(apptId=F('availabletimeslots__appointment__id')). \
            filter(title__lte=upperB, title__gte=lowerB, ). \
            values('day', 'date', 'start', 'end', 'apptId', 'timeslotType', 'title').order_by('date', 'start')

        response_data = chain(monday, tuesday, wednesday, thursday, friday, saturday)

        response_data = list(response_data)
        response_data_orig = list(response_data)

        allheatmapcolors = HeatMapColorSettings.objects.all()

        for eachObj in response_data_orig:
            eachObj['start'] = str(eachObj['date']) + " " + str(eachObj['start'])
            eachObj['end'] = str(eachObj['date']) + " " + str(eachObj['end'])
            eachObj['title'] = str(eachObj['title']) + " Patient(s)"
            count = eachObj['title']
            for eachColour in allheatmapcolors:
                if eachColour.count == count:
                    eachObj['hex'] = eachColour.hex
            #del eachObj['title']

            heatMapSlotTime = datetime.strptime(eachObj['start'], '%Y-%m-%d %H:%M:%S')
            if heatMapSlotTime < datetime.now():
                response_data.remove(eachObj)
        return Response(response_data)

class SuggestedTimeSlots(viewsets.ReadOnlyModelViewSet):
    queryset = FullYearCalendar.objects.all()

    def list(self, request, *args, **kwargs):
        apptTypeId = request.query_params.get('apptTypeId')
        doctorId = request.query_params.get('doctorId')

        apptType = AppointmentType.objects.get(id=apptTypeId)

        horizon = DoctorDayTimeSlots.objects.get(doctor=doctorId, apptType=apptTypeId)
        monday = horizon.monday.split(',')
        tuesday = horizon.tuesday.split(',')
        wednesday = horizon.wednesday.split(',')
        thursday = horizon.thursday.split(',')
        friday = horizon.friday.split(',')
        saturday = horizon.saturday.split(',')

        mondayArray = []
        tuesdayArray = []
        wednesdayArray = []
        thursdayArray = []
        fridayArray = []
        saturdayArray = []

        if monday != ['']:
            for eachTimeSlot in monday:
                allExistingAppts = AvailableTimeSlots.objects.filter(timeslotType=apptType.name, doctors=doctorId,
                                                                     date__lte=datetime.today(),
                                                                     date__gte=datetime.today()-timedelta(days=90),
                                                                     start=eachTimeSlot,
                                                                     date__day='Monday')\
                                                             .annotate(patientcount=Count('appointment__patients'))\
                                                             .values('patientcount', 'date', 'start')

                allExistingApptsAhead = AvailableTimeSlots.objects.filter(timeslotType=apptType.name, doctors=doctorId,
                                                                          date__gte=datetime.today(),
                                                                          date__lte=datetime.today()+timedelta(days=14),
                                                                          start=eachTimeSlot,
                                                                          date__day='Monday')\
                                                                  .annotate(patientcount=Count('appointment__patients'))\
                                                                  .values('patientcount', 'date', 'start')

                totalpatients = 0
                for eachObj in allExistingAppts:
                    totalpatients += eachObj.get('patientcount')

                if allExistingAppts.count() != 0:
                    averagePatients = totalpatients/allExistingAppts.count()
                else:
                    averagePatients = 0

                for eachObj in allExistingApptsAhead:
                    if datetime.combine(eachObj['date'], eachObj['start']) < datetime.now():
                        continue
                    if averagePatients >= eachObj.get('patientcount'):
                        eachObj['difference'] = averagePatients - eachObj.get('patientcount')
                        mondayArray.append(eachObj)

        if tuesday != ['']:
            for eachTimeSlot in tuesday:
                allExistingAppts = AvailableTimeSlots.objects.filter(timeslotType=apptType.name, doctors=doctorId,
                                                                     date__lte=datetime.today(),
                                                                     date__gte=datetime.today()-timedelta(days=90),
                                                                     start=eachTimeSlot,
                                                                     date__day='Tuesday')\
                                                             .annotate(patientcount=Count('appointment__patients'))\
                                                             .values('patientcount', 'date', 'start')

                allExistingApptsAhead = AvailableTimeSlots.objects.filter(timeslotType=apptType.name, doctors=doctorId,
                                                                          date__gte=datetime.today(),
                                                                          date__lte=datetime.today()+timedelta(days=14),
                                                                          start=eachTimeSlot,
                                                                          date__day='Tuesday')\
                                                                  .annotate(patientcount=Count('appointment__patients'))\
                                                                  .values('patientcount', 'date', 'start')

                totalpatients = 0
                for eachObj in allExistingAppts:
                    totalpatients += eachObj.get('patientcount')

                if allExistingAppts.count() != 0:
                    averagePatients = totalpatients/allExistingAppts.count()
                else:
                    averagePatients = 0

                for eachObj in allExistingApptsAhead:
                    if datetime.combine(eachObj['date'], eachObj['start']) < datetime.now():
                        continue
                    if averagePatients >= eachObj.get('patientcount'):
                        eachObj['difference'] = averagePatients - eachObj.get('patientcount')
                        tuesdayArray.append(eachObj)
        if wednesday != ['']:
            for eachTimeSlot in wednesday:
                allExistingAppts = AvailableTimeSlots.objects.filter(timeslotType=apptType.name, doctors=doctorId,
                                                                     date__lte=datetime.today(),
                                                                     date__gte=datetime.today()-timedelta(days=90),
                                                                     start=eachTimeSlot,
                                                                     date__day='Wednesday')\
                                                             .annotate(patientcount=Count('appointment__patients'))\
                                                             .values('patientcount', 'date', 'start')

                allExistingApptsAhead = AvailableTimeSlots.objects.filter(timeslotType=apptType.name, doctors=doctorId,
                                                                          date__gte=datetime.today(),
                                                                          date__lte=datetime.today()+timedelta(days=14),
                                                                          start=eachTimeSlot,
                                                                          date__day='Wednesday')\
                                                                  .annotate(patientcount=Count('appointment__patients'))\
                                                                  .values('patientcount', 'date', 'start')

                totalpatients = 0
                for eachObj in allExistingAppts:
                    totalpatients += eachObj.get('patientcount')

                if allExistingAppts.count() != 0:
                    averagePatients = totalpatients/allExistingAppts.count()
                else:
                    averagePatients = 0

                for eachObj in allExistingApptsAhead:
                    if datetime.combine(eachObj['date'], eachObj['start']) < datetime.now():
                        continue
                    if averagePatients >= eachObj.get('patientcount'):
                        eachObj['difference'] = averagePatients - eachObj.get('patientcount')
                        wednesdayArray.append(eachObj)

        if thursday != ['']:
            for eachTimeSlot in thursday:
                allExistingAppts = AvailableTimeSlots.objects.filter(timeslotType=apptType.name, doctors=doctorId,
                                                                     date__lte=datetime.today(),
                                                                     date__gte=datetime.today()-timedelta(days=90),
                                                                     start=eachTimeSlot,
                                                                     date__day='Thursday')\
                                                             .annotate(patientcount=Count('appointment__patients'))\
                                                             .values('patientcount', 'date', 'start')

                allExistingApptsAhead = AvailableTimeSlots.objects.filter(timeslotType=apptType.name, doctors=doctorId,
                                                                          date__gte=datetime.today(),
                                                                          date__lte=datetime.today()+timedelta(days=14),
                                                                          start=eachTimeSlot,
                                                                          date__day='Thursday')\
                                                                  .annotate(patientcount=Count('appointment__patients'))\
                                                                  .values('patientcount', 'date', 'start')

                totalpatients = 0
                for eachObj in allExistingAppts:
                    totalpatients += eachObj.get('patientcount')

                if allExistingAppts.count() != 0:
                    averagePatients = totalpatients/allExistingAppts.count()
                else:
                    averagePatients = 0

                for eachObj in allExistingApptsAhead:
                    if datetime.combine(eachObj['date'], eachObj['start']) < datetime.now():
                        continue
                    if averagePatients >= eachObj.get('patientcount'):
                        eachObj['difference'] = averagePatients - eachObj.get('patientcount')
                        thursdayArray.append(eachObj)

        if friday != ['']:
            for eachTimeSlot in friday:
                allExistingAppts = AvailableTimeSlots.objects.filter(timeslotType=apptType.name, doctors=doctorId,
                                                                     date__lte=datetime.today(),
                                                                     date__gte=datetime.today()-timedelta(days=90),
                                                                     start=eachTimeSlot,
                                                                     date__day='Friday')\
                                                             .annotate(patientcount=Count('appointment__patients'))\
                                                             .values('patientcount', 'date', 'start')

                allExistingApptsAhead = AvailableTimeSlots.objects.filter(timeslotType=apptType.name, doctors=doctorId,
                                                                          date__gte=datetime.today(),
                                                                          date__lte=datetime.today()+timedelta(days=14),
                                                                          start=eachTimeSlot,
                                                                          date__day='Friday')\
                                                                  .annotate(patientcount=Count('appointment__patients'))\
                                                                  .values('patientcount', 'date', 'start')

                totalpatients = 0
                for eachObj in allExistingAppts:
                    totalpatients += eachObj.get('patientcount')

                if allExistingAppts.count() != 0:
                    averagePatients = totalpatients/allExistingAppts.count()
                else:
                    averagePatients = 0

                for eachObj in allExistingApptsAhead:
                    if datetime.combine(eachObj['date'], eachObj['start']) < datetime.now():
                        continue
                    if averagePatients >= eachObj.get('patientcount'):
                        eachObj['difference'] = averagePatients - eachObj.get('patientcount')
                        fridayArray.append(eachObj)

        if saturday != ['']:
            for eachTimeSlot in saturday:
                allExistingAppts = AvailableTimeSlots.objects.filter(timeslotType=apptType.name, doctors=doctorId,
                                                                     date__lte=datetime.today(),
                                                                     date__gte=datetime.today()-timedelta(days=90),
                                                                     start=eachTimeSlot,
                                                                     date__day='Saturday')\
                                                             .annotate(patientcount=Count('appointment__patients'))\
                                                             .values('patientcount', 'date', 'start')

                allExistingApptsAhead = AvailableTimeSlots.objects.filter(timeslotType=apptType.name, doctors=doctorId,
                                                                          date__gte=datetime.today(),
                                                                          date__lte=datetime.today()+timedelta(days=14),
                                                                          start=eachTimeSlot,
                                                                          date__day='Saturday')\
                                                                  .annotate(patientcount=Count('appointment__patients'))\
                                                                  .values('patientcount', 'date', 'start')

                totalpatients = 0
                for eachObj in allExistingAppts:
                    totalpatients += eachObj.get('patientcount')

                if allExistingAppts.count() != 0:
                    averagePatients = totalpatients/allExistingAppts.count()
                else:
                    averagePatients = 0

                for eachObj in allExistingApptsAhead:
                    if datetime.combine(eachObj['date'], eachObj['start']) < datetime.now():
                        continue
                    if averagePatients >= eachObj.get('patientcount'):
                        eachObj['difference'] = averagePatients - eachObj.get('patientcount')
                        saturdayArray.append(eachObj)

        ranked = chain(mondayArray, tuesdayArray, wednesdayArray, thursdayArray, fridayArray, saturdayArray)

        ranked = sorted(ranked, key=itemgetter('difference', 'date'), reverse=True)[-5:]

        return Response(ranked)

class DoctorTimeSlot(viewsets.ModelViewSet):
    queryset = DoctorDayTimeSlots.objects.none()
    serializer_class = DoctorTimeSlotSerializer

    def list(self, request, *args, **kwargs):
        doctorId = request.query_params.get('doctorId')
        apptType = request.query_params.get('apptType')

        doctordaytimeslot = DoctorDayTimeSlots.objects.get(doctor=doctorId, apptType=apptType)

        monday = doctordaytimeslot.monday.split(',')
        tuesday = doctordaytimeslot.tuesday.split(',')
        wednesday = doctordaytimeslot.wednesday.split(',')
        thursday = doctordaytimeslot.thursday.split(',')
        friday = doctordaytimeslot.friday.split(',')
        saturday = doctordaytimeslot.saturday.split(',')

        monday = [s[:-3] for s in monday]
        tuesday = [s[:-3] for s in tuesday]
        wednesday = [s[:-3] for s in wednesday]
        thursday = [s[:-3] for s in thursday]
        friday = [s[:-3] for s in friday]
        saturday = [s[:-3] for s in saturday]

        monSat = [sorted(monday), sorted(tuesday), sorted(wednesday), sorted(thursday), sorted(friday), sorted(saturday)]

        return Response(monSat)

    def update(self, request, *args, **kwargs):
        payload = request.data

        apptType = payload.get('apptType')
        doctorId = payload.get('doctorId')
        day = payload.get('day')
        timeslots = payload.get('timeslots')

        doctordaytimeslot = DoctorDayTimeSlots.objects.get(doctor=doctorId, apptType=apptType)

        timeslotsString = ""
        for eachSlot in timeslots[:-1]:
            timeslotsString += eachSlot + ":00,"
        timeslotsString += timeslots[-1] + ":00"

        if day == 'Monday':
            doctordaytimeslot.monday = timeslotsString
        if day == 'Tuesday':
            doctordaytimeslot.tuesday = timeslotsString
        if day == 'Wednesday':
            doctordaytimeslot.wednesday = timeslotsString
        if day == 'Thursday':
            doctordaytimeslot.thursday = timeslotsString
        if day == 'Friday':
            doctordaytimeslot.friday = timeslotsString
        if day == 'Saturday':
            doctordaytimeslot.saturday = timeslotsString

        doctordaytimeslot.save()

        return Response('Successfully edited Appointment Timings')

    def create(self, request, *args, **kwargs):
        payload = request.data

        apptType = payload.get('apptType')
        doctorId = payload.get('doctorId')
        monday = payload.get('monday')
        tuesday = payload.get('tuesday')
        wednesday = payload.get('wednesday')
        thursday = payload.get('thursday')
        friday = payload.get('friday')
        saturday = payload.get('saturday')

        DoctorDayTimeSlots.objects.create(doctor=Doctor.objects.get(id=doctorId), apptType=AppointmentType.objects.get(id=apptType),
                                          monday=monday, tuesday=tuesday, wednesday=wednesday, thursday=thursday,
                                          friday=friday, saturday=saturday)

        return Response('Successfully created Appointment Timings')

class AvaliableTimeSlots(viewsets.ReadOnlyModelViewSet):
    queryset = AvailableTimeSlots.objects.none()

    def list(self, request, *args, **kwargs):
        response_data = AvailableTimeSlots.objects.get(date='2015-10-07', start='15:00:00',
                                                       timeslotType='Screening', doctors=1).id
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

        updateNewApptToSwapped = AssociatedPatientActions.objects.get(appointment=scheduledAppt, patient=p)
        updateNewApptToSwapped.appointment = tempAppt
        updateNewApptToSwapped.save()

        swapperObj = Swapper.objects.get(patient=p, tempAppt=tempAppt, scheduledAppt=scheduledAppt)
        swapperObj.inbox = True
        swapperObj.save()
        """
        if scheduledAppt.patients.count() == 0:
            scheduledAppt.delete()
        """
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
                                values('apptId', 'contact', 'name', 'apptStart', 'apptDate', 'doctorname', 'apptType').\
                                order_by('-apptDate')[:limit]

            return Response(response_data)
        else:
            response_data = Patient.objects.all().values()
            return Response(response_data)


class ViewSwapperTable(viewsets.ModelViewSet):
    queryset = Swapper.objects.none()
    serializer_class = SwapperSerializer

    def list(self, request, *args, **kwargs):
        response_data = Swapper.objects.all().filter(scheduledAppt__timeBucket__date__gte=datetime.now(), inbox=False,
                                                     tempAppt__timeBucket__date__gte=datetime.now()).\
                                                     values('tempAppt__timeBucket__date', 'tempAppt__timeBucket__start',
                                                     'scheduledAppt__timeBucket__date', 'scheduledAppt__timeBucket__start',
                                                     'patient__contact', 'patient_id', 'scheduledAppt__apptType', 'swappable',
                                                     'scheduledAppt__doctor__name', 'patient__name', 'tempAppt_id', 'scheduledAppt_id', 'id',
                                                     'sentSMS', 'sentSMSTime')

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
        payload = {'from': '6583517576', 'to': '65' + patientContact, 'text': 'Hi ' + patientName +
                ', Swap is possible for ' + apptType.upper() + '.\nPreferred: ' + preferredApptDate + ', ' + preferredApptTime +
                '.\nScheduled: ' + scheduledApptDate + ', ' + scheduledApptTime + '.\nReply swap<<space>>' + str(swapperID) + ' to swap appointments.'}

        requests.post("https://api.infobip.com/sms/1/text/single", json=payload, headers=headers)

        swapperObj = Swapper.objects.get(id=swapperID)
        swapperObj.sentSMS = True
        swapperObj.sentSMSTime = datetime.now()
        swapperObj.save()

        return HttpResponse('Success')

class ViewSwappedPatientsInInbox(viewsets.ReadOnlyModelViewSet):
    queryset = Swapper.objects.none()

    def list(self, request, *args, **kwargs):
        response_data = Swapper.objects.all().filter(inbox=True,).\
                                                     values('tempAppt__timeBucket__date', 'tempAppt__timeBucket__start',
                                                     'scheduledAppt__timeBucket__date', 'scheduledAppt__timeBucket__start',
                                                     'patient__contact', 'patient_id', 'scheduledAppt__apptType', 'swappable',
                                                     'scheduledAppt__doctor__name', 'patient__name', 'tempAppt_id', 'scheduledAppt_id', 'id',
                                                     'sentSMS', 'sentSMSTime')

        return Response(response_data)

class EditSwapperTable(viewsets.ModelViewSet):
    queryset = Swapper.objects.none()
    serializer_class = SwapperSerializer

    def create(self, request, *args, **kwargs):
        data = request.data

        swapperId = data.get('swapperId')

        swapperObj = Swapper.objects.get(id=swapperId)
        patient = swapperObj.patient
        tempAppt = swapperObj.tempAppt

        tempAppt.tempPatients.remove(patient)

        swapperObj.delete()
        return Response('Success')

class ViewApptTimeslots(viewsets.ReadOnlyModelViewSet):
    queryset = AvailableTimeSlots.objects.none()

    def list(self, request, *args, **kwargs):
        apptType = request.query_params.get('apptType')
        docName = request.query_params.get('docName')
        day = request.query_params.get('day')

        response_data = []

        doctordaytimeslot = DoctorDayTimeSlots.objects.get(doctor=docName, apptType__name=apptType)

        MONDAY_SLOTS = filter(None, doctordaytimeslot.monday.split(','))
        TUESDAY_SLOTS = filter(None, doctordaytimeslot.tuesday.split(','))
        WEDNESDAY_SLOTS = filter(None, doctordaytimeslot.wednesday.split(','))
        THURSDAY_SLOTS = filter(None, doctordaytimeslot.thursday.split(','))
        FRIDAY_SLOTS = filter(None, doctordaytimeslot.friday.split(','))
        SATURDAY_SLOTS = filter(None, doctordaytimeslot.saturday.split(','))

        if day == 'Monday':
                response_data = AvailableTimeSlots.objects.filter(timeslotType=apptType, doctors=docName, date__day=day,
                                                                  start__in=MONDAY_SLOTS). \
                    values('start', ).distinct().order_by('start')
        elif day == 'Tuesday':
                response_data = AvailableTimeSlots.objects.filter(timeslotType=apptType, doctors=docName, date__day=day,
                                                                  start__in=TUESDAY_SLOTS). \
                    values('start', ).distinct().order_by('start')
        elif day == 'Wednesday':
                response_data = AvailableTimeSlots.objects.filter(timeslotType=apptType, doctors=docName, date__day=day,
                                                                  start__in=WEDNESDAY_SLOTS). \
                    values('start', ).distinct().order_by('start')
        elif day == 'Thursday':
                response_data = AvailableTimeSlots.objects.filter(timeslotType=apptType, doctors=docName, date__day=day,
                                                                  start__in=THURSDAY_SLOTS). \
                    values('start', ).distinct().order_by('start')
        elif day == 'Friday':
                response_data = AvailableTimeSlots.objects.filter(timeslotType=apptType, doctors=docName, date__day=day,
                                                                  start__in=FRIDAY_SLOTS). \
                    values('start', ).distinct().order_by('start')
        elif day == 'Saturday':
                response_data = AvailableTimeSlots.objects.filter(timeslotType=apptType, doctors=docName, date__day=day,
                                                                  start__in=SATURDAY_SLOTS). \
                    values('start', ).distinct().order_by('start')

        """
        if apptType == 'Surgery':
            if day == 'Monday':
                response_data = AvailableTimeSlots.objects.filter(timeslotType=apptType, doctors=docName, date__day=day,
                                                                  start__in=settings.MONDAY_SLOTS_SURGERY). \
                    values('start', ).distinct().order_by('start')
            elif day == 'Tuesday':
                response_data = AvailableTimeSlots.objects.filter(timeslotType=apptType, doctors=docName, date__day=day,
                                                                  start__in=settings.TUESDAY_SLOTS_SURGERY). \
                    values('start', ).distinct().order_by('start')
            elif day == 'Wednesday':
                response_data = AvailableTimeSlots.objects.filter(timeslotType=apptType, doctors=docName, date__day=day,
                                                                  start__in=settings.WEDNESDAY_SLOTS_SURGERY). \
                    values('start', ).distinct().order_by('start')
            elif day == 'Thursday':
                response_data = AvailableTimeSlots.objects.filter(timeslotType=apptType, doctors=docName, date__day=day,
                                                                  start__in=settings.THURSDAY_SLOTS_SURGERY). \
                    values('start', ).distinct().order_by('start')
            elif day == 'Friday':
                response_data = AvailableTimeSlots.objects.filter(timeslotType=apptType, doctors=docName, date__day=day,
                                                                  start__in=settings.FRIDAY_SLOTS_SURGERY). \
                    values('start', ).distinct().order_by('start')
            elif day == 'Saturday':
                response_data = AvailableTimeSlots.objects.filter(timeslotType=apptType, doctors=docName, date__day=day,
                                                                  start__in=settings.SATURDAY_SLOTS_SURGERY). \
                    values('start', ).distinct().order_by('start')
        else:
            if day == 'Monday':
                response_data = AvailableTimeSlots.objects.filter(timeslotType=apptType, doctors=docName, date__day=day,
                                                                  start__in=settings.MONDAY_SLOTS_NONSURGERY). \
                    values('start', ).distinct().order_by('start')
            elif day == 'Tuesday':
                response_data = AvailableTimeSlots.objects.filter(timeslotType=apptType, doctors=docName, date__day=day,
                                                                  start__in=settings.TUESDAY_SLOTS_NONSURGERY). \
                    values('start', ).distinct().order_by('start')
            elif day == 'Wednesday':
                response_data = AvailableTimeSlots.objects.filter(timeslotType=apptType, doctors=docName, date__day=day,
                                                                  start__in=settings.WEDNESDAY_SLOTS_NONSURGERY). \
                    values('start', ).distinct().order_by('start')
            elif day == 'Thursday':
                response_data = AvailableTimeSlots.objects.filter(timeslotType=apptType, doctors=docName, date__day=day,
                                                                  start__in=settings.THURSDAY_SLOTS_NONSURGERY). \
                    values('start', ).distinct().order_by('start')
            elif day == 'Friday':
                response_data = AvailableTimeSlots.objects.filter(timeslotType=apptType, doctors=docName, date__day=day,
                                                                  start__in=settings.FRIDAY_SLOTS_NONSURGERY). \
                    values('start', ).distinct().order_by('start')
            elif day == 'Saturday':
                response_data = AvailableTimeSlots.objects.filter(timeslotType=apptType, doctors=docName, date__day=day,
                                                                  start__in=settings.SATURDAY_SLOTS_NONSURGERY). \
                    values('start', ).distinct().order_by('start')

        response_data = list(response_data)
        response_data_orig = list(response_data)

        if today == 'True':
            for eachObj in response_data_orig:
                if eachObj['start'] < datetime.now().time():
                    response_data.remove(eachObj)
        """
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

class ViewSwappableNumber(viewsets.ReadOnlyModelViewSet):
    queryset = Swapper.objects.none()

    def list(self, request, *args, **kwargs):
        number = Swapper.objects.filter(inbox=False, swappable=True, scheduledAppt__timeBucket__date__gte=datetime.now(),
                                        tempAppt__timeBucket__date__gte=datetime.now()).count()

        return Response(number)

class ViewTodayPatients(viewsets.ModelViewSet):
    queryset = Appointment.objects.none()
    serializer_class = AppointmentSerializer

    def list(self, request, *args, **kwargs):
        response_data = Appointment.objects.filter(timeBucket__date=datetime.today(),
                                                   associatedpatientactions__cancelled=None,
                                                   patients__isnull=False
                                                   ).values('associatedpatientactions__appointment__doctor__name',
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
                                                            'associatedpatientactions__cancelled').distinct().order_by('associatedpatientactions__appointment__timeBucket__start')
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

        socketId = data.get('socketId')

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

            pusher.trigger('queue', 'addToQueue', {'message': {}}, socketId)
        else:
            associatedPAction.addedToQueue = False
            associatedPAction.save()
            AttendedAppointment.objects.create(apptType=apptType, patient=Patient.objects.get(id=patient),
                                               timeBucket=AvailableTimeSlots.objects.get(id=timeBucket),
                                               clinic=Clinic.objects.get(id=clinic),
                                               doctor=Doctor.objects.get(id=doctor), attended=False, originalAppt=a,
                                               )
            pusher.trigger('queue', 'noShow', {'message': {}}, socketId)

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

        socketId = data.get('socketId')

        AttendedAppointment.objects.get(patient=patient, originalAppt__id=apptId).delete()

        p = Patient.objects.get(id=patient)
        associatedPAction = AssociatedPatientActions.objects.get(appointment__id=apptId, patient=p)
        associatedPAction.addedToQueue = None
        associatedPAction.save()

        pusher.trigger('queue', 'removeFromQueue', {'message': {}}, socketId)
        return HttpResponse("Success")

    def list(self, request, *args, **kwargs):
        response_data = AttendedAppointment.objects.filter(attended=True, timeBucket__date=datetime.now().date(),
                                                           timeBucket__date__gte=datetime.today()).\
            values('patient_id', 'patient__name', 'originalAppt_id', 'last_modified', 'remarks', 'patient__contact').order_by('-last_modified')

        return Response(response_data)

def recievemsg(request):
    payload = request.GET

    message = payload['text']
    messageArray = message.split()

    try:
        messagePt1 = messageArray[1]
    except IndexError:
        WronglyRepliedSMS.objects.create(text=message, origin=payload['Sender'])
        return HttpResponse('SMS reply not configured')

    try:
        messagePt2 = messageArray[2]
    except IndexError:
        WronglyRepliedSMS.objects.create(text=message, origin=payload['Sender'])
        return HttpResponse('SMS reply not configured')

    origin = payload['sender']

    origin = origin[2:]

    try:
        swap = Swapper.objects.get(id=messagePt2)
    except ObjectDoesNotExist:
        return HttpResponse('Invalid Parameters')

    if (datetime.now() - swap.sentSMSTime) > timedelta(hours=3):
        WronglyRepliedSMS.objects.create(text='Swap Offer Expired - ' + str(swap.sentSMSTime), origin=payload['Sender'])
        return HttpResponse('Expired Offer')

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

        swapperObj = Swapper.objects.get(patient=p, tempAppt=tempAppt, scheduledAppt=scheduledAppt)
        swapperObj.inbox = True
        swapperObj.save()
        """
        if scheduledAppt.patients.count() == 0:
            scheduledAppt.delete()
        """
        encoded = base64.b64encode('AnthonyS:ClearVision2')
        headers = {'Authorization': 'Basic ' + encoded, 'Content-Type': 'application/json', 'Accept': 'application/json'}
        payload = {'from': '6583517576', 'to': '65' + origin, 'text': 'Hi ' + p.name +
                ', \'swap\'  ' + messagePt2 + '\'acknowledged on ' + str(datetime.now())}

        requests.post("https://api.infobip.com/sms/1/text/single", json=payload, headers=headers)

        return HttpResponse('Success')
    else:
        WronglyRepliedSMS.objects.create(text=message, origin=origin)
        return HttpResponse('SMS reply not configured')

@csrf_exempt
def SendAdHocSMS(request):
    payload = json.loads(request.body)
    target = payload.get('target')
    message = payload.get('message')
    hello = payload.get('hello')
    print(hello)

    if target is None:
        return HttpResponse('Failure')
    elif message is None:
        return HttpResponse('Failure')

    encoded = base64.b64encode('AnthonyS:ClearVision2')
    headers = {'Authorization': 'Basic ' + encoded, 'Content-Type': 'application/json', 'Accept': 'application/json'}
    payload = {'from': '6583517576', 'to': '65' + target, 'text': message}

    requests.post("https://api.infobip.com/sms/1/text/single", json=payload, headers=headers)

    return HttpResponse('Success')

def ViewReceivedSMS(request):
    encoded = base64.b64encode('AnthonyS:ClearVision2')
    headers = {'Authorization': 'Basic '+encoded, 'Content-Type': 'application/json', 'Accept': 'application/json'}

    response_data = requests.get("https://api.infobip.com/sms/1/inbox/logs", headers=headers)

    return HttpResponse(response_data)

def ViewSentSMS(request):
    encoded = base64.b64encode('AnthonyS:ClearVision2')
    headers = {'Authorization': 'Basic '+encoded, 'Content-Type': 'application/json', 'Accept': 'application/json'}

    response_data = requests.get("https://api.infobip.com/sms/1/logs", headers=headers)

    return HttpResponse(response_data)

@csrf_exempt
def RecordUserActionsTimeIn(request):
    payload = request.body
    payload_clean = json.loads(payload)

    currentUser = payload_clean['user']
    action = payload_clean['action']
    timeIn = payload_clean['timeIn']

    tracker = UserTracking.objects.create(user=currentUser, action=action, timeOut=None, timeIn=timeIn)

    return HttpResponse(tracker.id)

@csrf_exempt
def RecordUserActionsTimeOut(request):
    payload = request.body
    payload_clean = json.loads(payload)

    trackerId = payload_clean['trackerId']
    timeOut = payload_clean['timeOut']

    try:
        action = payload_clean['action']
        toUpdateTimeOut = UserTracking.objects.get(id=trackerId)
        toUpdateTimeOut.timeOut = timeOut
        toUpdateTimeOut.action = action
        toUpdateTimeOut.save()
    except KeyError:
        toUpdateTimeOut = UserTracking.objects.get(id=trackerId)
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
        year = request.query_params.get('year')
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
                #totalPatientsForMonth = Appointment.objects.filter(timeBucket__date__date__gte=startDate, timeBucket__date__date__lte=endDate, timeBucket__timeslotType=eachApptType).values('patients').count()
                totalCancelledForMonth = AssociatedPatientActions.objects.filter(appointment__timeBucket__date__date__gte=startDate, appointment__timeBucket__date__date__lte=endDate, cancelled=True, appointment__timeBucket__timeslotType=eachApptType).values().count()

                toAdd = {'apptType': eachApptType, 'Turn Up': tillNowAttended, 'No Show': tillNowBlacklisted, 'Cancelled': totalCancelledForMonth}
                toReturnResponse.append(toAdd)
        else:

            for eachApptType in apptTypes:
                tillNowBlacklisted = Blacklist.objects.filter(timeBucket__date__date__year=year, timeBucket__date__date__month=month, timeBucket__timeslotType=eachApptType['name']).values().count()
                tillNowAttended = AttendedAppointment.objects.filter(attended=True, timeBucket__date__date__month=month, timeBucket__timeslotType=eachApptType['name']).values().count()
                #totalPatientsForMonth = Appointment.objects.filter(timeBucket__date__date__month=month, timeBucket__timeslotType=eachApptType['name']).exclude(patients=None).values('patients').count()
                totalCancelledForMonth = AssociatedPatientActions.objects.filter(appointment__timeBucket__date__date__month=month, cancelled=True, appointment__timeBucket__timeslotType=eachApptType['name']).values().count()

                toAdd = {'apptType': eachApptType['name'], 'Turn Up': tillNowAttended, 'No Show': tillNowBlacklisted, 'Cancelled': totalCancelledForMonth}
                toReturnResponse.append(toAdd)

        if sortValue == 'Turn Up':
            return Response(sorted(toReturnResponse, key=itemgetter('Turn Up'), reverse=True))
        elif sortValue == 'No Show':
            return Response(sorted(toReturnResponse, key=itemgetter('No Show'), reverse=True))
        elif sortValue == 'Cancelled':
            return Response(sorted(toReturnResponse, key=itemgetter('Cancelled'), reverse=True))
        else:
            return Response(toReturnResponse)

class AnalyticsDashboardTestChecker(viewsets.ReadOnlyModelViewSet):
    queryset = AssociatedPatientActions.objects.none()

    def list(self, request, *args, **kwargs):
        param = request.query_params.get('param')

        if param == 'TurnUp':
            return Response(AttendedAppointment.objects.all().values())
        elif param == 'Cancelled':
            return Response(AssociatedPatientActions.objects.all().values('patient__marketingChannelId__name','appointment__apptType','addedToQueue','cancelled','cancellationReason__reason'))
        elif param == 'NoShow':
            return Response(Blacklist.objects.all().values('patient__marketingChannelId__name','apptType','blacklistReason__reason'))

        return Response('Invalid Parameter')

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

class ViewSavedApptTypeCustomFilters(viewsets.ModelViewSet):
    queryset = CustomFilterApptType.objects.none()
    serializer_class = CustomFilterApptTypeSerializer

    def list(self, request, *args, **kwargs):
        response_data = CustomFilterApptType.objects.all().values()
        return Response(response_data)

    def create(self, request, *args, **kwargs):
        payload = request.data

        name = payload.get('name')
        apptTypes = payload.get('apptTypes')
        startDate = payload.get('startDate')
        endDate = payload.get('endDate')

        newCustomFilter = CustomFilterApptType.objects.create(startDate=startDate, endDate=endDate, name=name,)
        newCustomFilter.apptType = apptTypes

        return Response("Success")

class EditSavedApptTypeCustomFilters(viewsets.ModelViewSet):
    queryset = CustomFilterApptType.objects.all()
    serializer_class = CustomFilterApptTypeSerializer

    def list(self, request, *args, **kwargs):
        id = request.query_params.get('id')

        customfilter = CustomFilterApptType.objects.get(id=id)

        return Response(CustomFilterApptTypeSerializer(customfilter).data)

    def create(self, request, *args, **kwargs):
        payload = request.data

        customfilterID = payload.get('customfilterID')
        startDate = payload.get('startDate')
        endDate = payload.get('endDate')
        name = payload.get('name')
        apptTypes = payload.get('apptTypes')

        customfilter = CustomFilterApptType.objects.get(id=customfilterID)
        customfilter.startDate = startDate
        customfilter.endDate = endDate
        customfilter.name = name
        customfilter.save()
        customfilter.apptType = apptTypes
        customfilter.save()

        return Response("Success")

    def destroy(self, request, *args, **kwargs):
        CustomFilterApptType.objects.get(id=self.get_object().id).delete()

        return Response("Success")

class ViewSavedMarketingChannelCustomFilters(viewsets.ModelViewSet):
    queryset = CustomFilterMarketingChannel.objects.none()
    serializer_class = CustomFilterMarketingChannelSerializer

    def list(self, request, *args, **kwargs):
        response_data = CustomFilterMarketingChannel.objects.all().values()
        return Response(response_data)

    def create(self, request, *args, **kwargs):
        payload = request.data

        name = payload.get('name')
        channelTypes = payload.get('channelTypes')
        startDate = payload.get('startDate')
        endDate = payload.get('endDate')

        newCustomFilter = CustomFilterMarketingChannel.objects.create(startDate=startDate, endDate=endDate, name=name,)
        newCustomFilter.channelType = channelTypes

        return Response("Success")

class EditSavedMarketingChannelCustomFilters(viewsets.ModelViewSet):
    queryset = CustomFilterMarketingChannel.objects.all()
    serializer_class = CustomFilterMarketingChannelSerializer

    def list(self, request, *args, **kwargs):
        id = request.query_params.get('id')

        customfilter = CustomFilterMarketingChannel.objects.get(id=id)

        return Response(CustomFilterMarketingChannelSerializer(customfilter).data)

    def create(self, request, *args, **kwargs):
        payload = request.data

        customfilterID = payload.get('customfilterID')
        startDate = payload.get('startDate')
        endDate = payload.get('endDate')
        name = payload.get('name')
        channelTypes = payload.get('channelTypes')

        customfilter = CustomFilterMarketingChannel.objects.get(id=customfilterID)
        customfilter.startDate = startDate
        customfilter.endDate = endDate
        customfilter.name = name
        customfilter.save()
        customfilter.channelType = channelTypes
        customfilter.save()

        return Response("Success")

    def destroy(self, request, *args, **kwargs):
        CustomFilterMarketingChannel.objects.get(id=self.get_object().id).delete()

        return Response("Success")

class ViewBacktrackListings(viewsets.ReadOnlyModelViewSet):
    queryset = MarketingChannels.objects.none()

    def list(self, request, *args, **kwargs):
        rightnow = date.today()
        listings = []

        for months in range(0, 13):
            listings.append(rightnow.strftime('%b') + " " + str(rightnow.year))
            rightnow -= monthdelta(1)

        return Response(listings)

class ViewAllApptTypes(viewsets.ModelViewSet):
    queryset = AppointmentType.objects.all()
    serializer_class = ApptTypesSerializer

    def list(self, request, *args, **kwargs):
        allApptTypes = AppointmentType.objects.all().values()
        return Response(allApptTypes)

    def create(self, request, *args, **kwargs):
        payload = request.data

        name = payload.get('name')
        calendarColourHex = payload.get('calendarColourHex')

        newlyCreatedApptType = AppointmentType.objects.create(name=name)

        CalendarColorSettings.objects.create(apptType=newlyCreatedApptType, hex=calendarColourHex)

        return Response('Appointment type created successfully')

    def destroy(self, request, *args, **kwargs):
        payload = request.data

        password = payload.get('password')

        if User.objects.get(username='admin').check_password(password):
            coldshotappttype = AppointmentType.objects.get(id=self.get_object().id)

            AvailableTimeSlots.objects.filter(timeslotType=coldshotappttype.name).delete()

            coldshotappttype.delete()

            return Response("Successfully removed appointment type")
        else:
            return Response("Invalid Admin Password!")

    def update(self, request, *args, **kwargs):
        payload = request.data
        name = payload.get('name')

        originalApptType = AppointmentType.objects.get(id=self.get_object().id)
        originalApptTypeName = originalApptType.name

        originalApptType.name = name
        originalApptType.save()

        AvailableTimeSlots.objects.filter(timeslotType=originalApptTypeName).update(timeslotType=name)

        return Response('Successfully updated Appointment Type name')

class CheckApptTypeInGeneral(viewsets.ModelViewSet):
    queryset = Appointment.objects.none()
    serializer_class = AppointmentSerializer

    def list(self, request, *args, **kwargs):
        apptTypeID = request.query_params.get('apptTypeID')
        apptType = AppointmentType.objects.get(id=apptTypeID)

        allApptsCount = Appointment.objects.filter(timeBucket__date__gte=date.today(), apptType=apptType.name).\
        exclude(patients__isnull=True).count()

        return Response(allApptsCount)

    def create(self, request, *args, **kwargs):
        payload = request.data

        emailAddress = payload.get('emailAddress')
        apptTypeID = payload.get('apptTypeID')

        futureApptsForApptType = Appointment.objects.filter(timeBucket__date__gte=date.today(), doctor__apptType__id=apptTypeID).\
                                           values('patients__contact', 'patients__name', 'patients__gender', 'timeBucket__date', 'timeBucket__start', 'apptType', 'id', 'doctor__name', 'clinic', 'doctor').\
                                           exclude(patients__isnull=True)

        csvfile = StringIO.StringIO()
        csvwriter = csv.writer(csvfile)

        csvwriter.writerow(['patients_contact', 'patients__name', 'patients__gender', 'timeBucket__date', 'timeBucket__start',
                        'apptType', 'id', 'doctor__name', 'clinic', 'doctor'])

        for eachObj in futureApptsForApptType:
            csvwriter.writerow([eachObj['patients__contact'], eachObj['patients__name'], eachObj['patients__gender'], eachObj['timeBucket__date'],
                                eachObj['timeBucket__start'], eachObj['apptType'], eachObj['id'], eachObj['doctor__name'],
                                eachObj['clinic'], eachObj['doctor']])

        message = EmailMessage("Appointment backlog for  " + str(AppointmentType.objects.get(id=apptTypeID).name), "", to=[emailAddress])
        message.attach('apptBacklog.csv', csvfile.getvalue(), 'text/csv')

        message.send()

        return Response('Email sent successfully')

class CheckApptTypeUnderDoctor(viewsets.ModelViewSet):
    queryset = Appointment.objects.none()
    serializer_class = AppointmentSerializer

    def list(self, request, *args, **kwargs):
        doctorID = request.query_params.get('doctorID')
        apptTypeID = request.query_params.get('apptTypeID')

        apptType = AppointmentType.objects.get(id=apptTypeID)

        allApptsCount = Appointment.objects.filter(doctor__id=doctorID, timeBucket__date__gte=date.today(), apptType=apptType.name).\
        exclude(patients__isnull=True).count()

        return Response(allApptsCount)

    def create(self, request, *args, **kwargs):
        payload = request.data

        emailAddress = payload.get('emailAddress')
        doctorID = payload.get('doctorID')
        apptTypeID = payload.get('apptTypeID')

        futureApptsForDoc = Appointment.objects.filter(timeBucket__date__gte=date.today(), doctor__id=doctorID, doctor__apptType__id=apptTypeID).\
                                           values('patients__contact', 'patients__name', 'patients__gender', 'timeBucket__date', 'timeBucket__start', 'apptType', 'id', 'doctor__name', 'clinic', 'doctor').\
                                           exclude(patients__isnull=True)

        csvfile = StringIO.StringIO()
        csvwriter = csv.writer(csvfile)

        csvwriter.writerow(['patients_contact', 'patients__name', 'patients__gender', 'timeBucket__date', 'timeBucket__start',
                        'apptType', 'id', 'doctor__name', 'clinic', 'doctor'])

        for eachObj in futureApptsForDoc:
            csvwriter.writerow([eachObj['patients__contact'], eachObj['patients__name'], eachObj['patients__gender'], eachObj['timeBucket__date'],
                                eachObj['timeBucket__start'], eachObj['apptType'], eachObj['id'], eachObj['doctor__name'],
                                eachObj['clinic'], eachObj['doctor']])

        message = EmailMessage("Appointment backlog for  " + str(Doctor.objects.get(id=doctorID).name), "", to=[emailAddress])
        message.attach('apptBacklog.csv', csvfile.getvalue(), 'text/csv')

        message.send()

        return Response('Email sent successfully')

class ViewAllMarketingChannels(viewsets.ReadOnlyModelViewSet):
    queryset = MarketingChannels.objects.none()

    def list(self, request, *args, **kwargs):
        allMarketingChannels = MarketingChannels.objects.filter(show=True).order_by('name').values()
        return Response(allMarketingChannels)

class EditMarketingChannelsStatus(viewsets.ModelViewSet):
    queryset = MarketingChannels.objects.all()
    serializer_class = MarketingChannelSerializer

class CalendarBlocker(viewsets.ModelViewSet):
    queryset = BlockDates.objects.all()
    serializer_class = CalendarBlockerSerializer

    def list(self, request, *args, **kwargs):
        doctor = request.query_params.get('doctor')
        if doctor == 'all':
            futureCalendarBlockers = BlockDates.objects.filter(end__gte=datetime.now()).values('start', 'end', 'remarks', 'id',
                                                                                               'doctor__name', 'doctor__id')

            for eachObj in futureCalendarBlockers:
                eachObj['rendering'] = 'background'

            return Response(futureCalendarBlockers)
        elif doctor == '1':
            futureCalendarBlockers = BlockDates.objects.filter(end__gte=datetime.now(), doctor=doctor).values('start', 'end', 'remarks', 'id',
                                                                                               'doctor__name', 'doctor__id')

            for eachObj in futureCalendarBlockers:
                eachObj['rendering'] = 'background'

            return Response(futureCalendarBlockers)

        elif doctor == '2':
            futureCalendarBlockers = BlockDates.objects.filter(end__gte=datetime.now(), doctor=doctor).values('start', 'end', 'remarks', 'id',
                                                                                               'doctor__name', 'doctor__id')

            for eachObj in futureCalendarBlockers:
                eachObj['rendering'] = 'background'

            return Response(futureCalendarBlockers)
        return Response({})

    def create(self, request, *args, **kwargs):
        payload = request.data

        startDate = payload.get('startDate')
        startTime = payload.get('startTime')
        start = startDate + ' ' + startTime

        endDate = payload.get('endDate')
        endTime = payload.get('endTime')
        end = endDate + ' ' + endTime

        remarks = payload.get('remarks')
        doctor = payload.get('doctor')

        BlockDates.objects.create(start=start, end=end, remarks=remarks, doctor=Doctor.objects.get(id=doctor))

        return Response('Create Success')

    def update(self, request, *args, **kwargs):
        payload = request.data

        startDate = payload.get('startDate')
        startTime = payload.get('startTime')
        start = startDate + ' ' + startTime

        endDate = payload.get('endDate')
        endTime = payload.get('endTime')
        end = endDate + ' ' + endTime

        remarks = payload.get('remarks')
        doctor = payload.get('doctor')

        toUpdate = BlockDates.objects.get(id=self.get_object().id)
        toUpdate.start = start
        toUpdate.end = end
        toUpdate.remarks = remarks
        toUpdate.doctor = Doctor.objects.get(id=doctor)
        toUpdate.save()

        return Response('Update Success')

    def destroy(self, request, *args, **kwargs):
        BlockDates.objects.get(id=self.get_object().id).delete()
        return Response('Delete Success')

class ViewDoctorBlockedTime(viewsets.ReadOnlyModelViewSet):
    queryset = BlockDates.objects.none()

    def list(self, request, *args, **kwargs):
        date = request.query_params.get('date')
        doctor = request.query_params.get('docID')

        if BlockDates.objects.filter(doctor=doctor, start__lte=date, end__gte=date).exists():
            return Response(True)
        else:
            return Response(False)

class CheckApptsForBlockedCalendar(viewsets.ModelViewSet):
    queryset = Appointment.objects.none()
    serializer_class = AppointmentSerializer

    def list(self, request, *args, **kwargs):
        doctorID = request.query_params.get('doctorID')
        startDate = request.query_params.get('startDate')
        startTime = request.query_params.get('startTime') + ":00"
        endDate = request.query_params.get('endDate')
        endTime = request.query_params.get('endTime') + ":00"

        count = Appointment.objects.filter(timeBucket__date__gte=startDate,
                                           timeBucket__date__lte=endDate,
                                           timeBucket__start__gte=startTime,
                                           timeBucket__end__lte=endTime,
                                           doctor=doctorID,
                                           ).exclude(patients__isnull=True).values('patients').count()
        return Response(count)

    def create(self, request, *args, **kwargs):
        payload = request.data

        emailAddress = payload.get('emailAddress')
        doctorID = payload.get('doctorID')
        startDate = payload.get('startDate')
        startTime = payload.get('startTime')
        endDate = payload.get('endDate')
        endTime = payload.get('endTime')

        apptsInBlockedBucket = Appointment.objects.filter(timeBucket__date__gte=startDate,
                                                          timeBucket__date__lte=endDate,
                                                          timeBucket__start__gte=startTime,
                                                          timeBucket__end__lte=endTime,
                                                          doctor=doctorID,
                                                          ).exclude(patients__isnull=True)\
                                                          .values('patients__contact', 'patients__name', 'patients__gender', 'timeBucket__date', 'timeBucket__start', 'apptType', 'id', 'doctor__name', 'clinic', 'doctor')

        csvfile = StringIO.StringIO()
        csvwriter = csv.writer(csvfile)

        csvwriter.writerow(['patients_contact', 'patients__name', 'patients__gender', 'timeBucket__date', 'timeBucket__start',
                        'apptType', 'id', 'doctor__name', 'clinic', 'doctor'])

        for eachObj in apptsInBlockedBucket:
            csvwriter.writerow([eachObj['patients__contact'], eachObj['patients__name'], eachObj['patients__gender'], eachObj['timeBucket__date'],
                                eachObj['timeBucket__start'], eachObj['apptType'], eachObj['id'], eachObj['doctor__name'],
                                eachObj['clinic'], eachObj['doctor']])

        message = EmailMessage("Appointment backlog for  " + str(Doctor.objects.get(id=doctorID).name), "", to=[emailAddress])
        message.attach('apptBacklog.csv', csvfile.getvalue(), 'text/csv')

        message.send()

        return Response('Email sent successfully')



class InputMarketingChannelCost(viewsets.ModelViewSet):
    queryset = MarketingChannels.objects.all()
    serializer_class = InputMarketingChannelCostSerializer

    def list(self, request, *args, **kwargs):
        month = request.query_params.get('month')
        year = request.query_params.get('year')

        allChannels = MarketingChannels.objects.filter(datePurchased__month=month, datePurchased__year=year).values()
        return Response(allChannels)

    def create(self, request, *args, **kwargs):
        payload = request.data

        name = payload.get('name')
        cost = payload.get('cost')
        date = payload.get('date')

        MarketingChannels.objects.create(name=name, cost=cost, datePurchased=date)

        return Response('Create Success')

    def destroy(self, request, *args, **kwargs):
        MarketingChannels.objects.get(id=self.get_object().id).delete()

        return Response('Delete Success')

class DoctorApptTypes(viewsets.ReadOnlyModelViewSet):
    queryset = Doctor.objects.all()

    def list(self, request, *args, **kwargs):
        apptTypeID = request.query_params.get('apptTypeID')

        doctors = Doctor.objects.filter(apptType=apptTypeID).order_by('id').values()

        return Response(doctors)

class ApptTypeDoctors(viewsets.ReadOnlyModelViewSet):
    queryset = AppointmentType.objects.all()

    def list(self, request, *args, **kwargs):
        doctorID = request.query_params.get('doctorID')

        apptTypes = AppointmentType.objects.filter(doctor=doctorID).order_by('id').values()

        return Response(apptTypes)

class ViewWaitlistAppt(viewsets.ReadOnlyModelViewSet):
    queryset = Swapper.objects.none()

    def list(self, request, *args, **kwargs):
        appointmentId = request.query_params.get('appointmentId')
        patientId = request.query_params.get('patientId')

        try:
            swapperObj = Swapper.objects.get(scheduledAppt=appointmentId, patient=patientId)
        except ObjectDoesNotExist:
            return Response({})

        waitlistAppt = swapperObj.tempAppt
        waitlistAppt = AppointmentSerializer(waitlistAppt)
        return Response(waitlistAppt.data)

class ViewCalendarColorSettings(viewsets.ModelViewSet):
    queryset = CalendarColorSettings.objects.all().order_by('apptType__id')
    serializer_class = CalendarColorSettingsSerializer

class ViewHeatMapColorSettings(viewsets.ModelViewSet):
    queryset = HeatMapColorSettings.objects.all()
    serializer_class = HeatMapColorSettingsSerializer

class ViewCalendarTimeRange(viewsets.ModelViewSet):
    queryset = CalendarTimeRange.objects.all()
    serializer_class = CalendarTimeRangeSerializer

class CheckTimeRangeAppts(viewsets.ModelViewSet):
    queryset = Appointment.objects.none()
    serializer_class = AppointmentSerializer

    def list(self, request, *args, **kwargs):
        start = request.query_params.get('start')

class ViewSMSApptReminder(viewsets.ModelViewSet):
    queryset = DaysAheadReminderSMS.objects.all()
    serializer_class = SMSApptReminderSerializer

    def update(self, request, *args, **kwargs):
        payload = request.data
        days = payload.get('days')
        timeHour = payload.get('timeHour')
        timeMinute = payload.get('timeMinute')

        toUpdate = DaysAheadReminderSMS.objects.get(id=1)

        toUpdate.days = days
        toUpdate.timeHour = timeHour
        toUpdate.timeMinute = timeMinute
        toUpdate.save()

        injectorJSON = [{
                        "fields": {
                        "month_of_year": "*",
                        "day_of_week": "*",
                        "hour": timeHour,
                        "minute": timeMinute,
                        "day_of_month": "*"
                        },
                        "model": "djcelery.crontabschedule",
                        "pk": 2
                        },
                        {
                        "fields": {
                        "task": "ClearVision.tasks.sendSMS",
                        "name": "sendSMS",
                        "exchange": None,
                        "last_run_at": None,
                        "args": "[]",
                        "enabled": True,
                        "routing_key": None,
                        "crontab": 2,
                        "interval": None,
                        "queue": None,
                        "total_run_count": 0,
                        "expires": None,
                        "kwargs": "{}",
                        "date_changed": "2015-09-25T19:40:16.253",
                        "description": ""
                        },
                        "model": "djcelery.periodictask",
                        "pk": 3
                        }]

        with open("ClearVision/fixtures/SMSApptReminderUpdate.json", "w+") as outfile:
            json.dump(injectorJSON, outfile, indent=4)

        command = "python manage.py loaddata SMSApptReminderUpdate"
        os.system(command)

        return Response('Successfully updated SMS Config')

import numpy as np
class ConversionRatePrediction(viewsets.ReadOnlyModelViewSet):
    queryset = AttendedAppointment.objects.none()

    def list(self, request, *args, **kwargs):
        thisMonth = datetime.now().month - 1
        thisYear = datetime.now().year

        y = []
        conversionData = []
        sequence = 11

        for months in range(1, 13):
            totalAttendedPreEvalPatients = AttendedAppointment.objects.filter(originalAppt__doctor__apptType=2,
                                                                              originalAppt__date__month=thisMonth,
                                                                              originalAppt__date__year=thisYear,
                                                                              attended=True)
            patients = []

            for eachObj in totalAttendedPreEvalPatients:
                patients.append(eachObj.patient)

            totalAttendedPreEval = AttendedAppointment.objects.filter(patient__in=patients, attended=True).order_by('patient', 'last_modified')
            totalAttendedPreEvalCount = totalAttendedPreEval.count()

            prevItem = None
            for eachAttendedPreEval in totalAttendedPreEval:
                if eachAttendedPreEval.patient == prevItem:
                    totalAttendedPreEvalCount += -1
                    prevItem = eachAttendedPreEval.patient
                else:
                    prevItem = eachAttendedPreEval.patient

            totalAttendedSurgery = AttendedAppointment.objects.filter(patient__in=patients,
                                                                      originalAppt__doctor__apptType=3, attended=True).order_by('patient', 'last_modified')
            totalAttendedSurgeryCount = totalAttendedSurgery.count()

            prevItem = None
            for eachAttendedSurgery in totalAttendedSurgery:
                if eachAttendedSurgery.patient == prevItem:
                    totalAttendedSurgeryCount += -1
                    prevItem = eachAttendedSurgery.patient
                else:
                    prevItem = eachAttendedSurgery.patient

            if totalAttendedPreEvalCount != 0:
                trueConversionRate = totalAttendedSurgeryCount/totalAttendedPreEvalCount * 100
            else:
                trueConversionRate = 0

            if thisMonth == 1:
                conversionData.append({"monthLong": "Jan", "monthShort": thisMonth, "year": thisYear, "type": "preEvaluationCount", "count": totalAttendedPreEvalCount, "sequence": sequence})
                conversionData.append({"monthLong": "Jan", "monthShort": thisMonth, "year": thisYear, "type": "conversionCount", "count": trueConversionRate, "sequence": sequence})
            elif thisMonth == 2:
                conversionData.append({"monthLong": "Feb", "monthShort": thisMonth, "year": thisYear, "type": "preEvaluationCount", "count": totalAttendedPreEvalCount, "sequence": sequence})
                conversionData.append({"monthLong": "Feb", "monthShort": thisMonth, "year": thisYear, "type": "conversionCount", "count": trueConversionRate, "sequence": sequence})
            elif thisMonth == 3:
                conversionData.append({"monthLong": "Mar", "monthShort": thisMonth, "year": thisYear, "type": "preEvaluationCount", "count": totalAttendedPreEvalCount, "sequence": sequence})
                conversionData.append({"monthLong": "Mar", "monthShort": thisMonth, "year": thisYear, "type": "conversionCount", "count": trueConversionRate, "sequence": sequence})
            elif thisMonth == 4:
                conversionData.append({"monthLong": "Apr", "monthShort": thisMonth, "year": thisYear, "type": "preEvaluationCount", "count": totalAttendedPreEvalCount, "sequence": sequence})
                conversionData.append({"monthLong": "Apr", "monthShort": thisMonth, "year": thisYear, "type": "conversionCount", "count": trueConversionRate, "sequence": sequence})
            elif thisMonth == 5:
                conversionData.append({"monthLong": "May", "monthShort": thisMonth, "year": thisYear, "type": "preEvaluationCount", "count": totalAttendedPreEvalCount, "sequence": sequence})
                conversionData.append({"monthLong": "May", "monthShort": thisMonth, "year": thisYear, "type": "conversionCount", "count": trueConversionRate, "sequence": sequence})
            elif thisMonth == 6:
                conversionData.append({"monthLong": "Jun", "monthShort": thisMonth, "year": thisYear, "type": "preEvaluationCount", "count": totalAttendedPreEvalCount, "sequence": sequence})
                conversionData.append({"monthLong": "Jun", "monthShort": thisMonth, "year": thisYear, "type": "conversionCount", "count": trueConversionRate, "sequence": sequence})
            elif thisMonth == 7:
                conversionData.append({"monthLong": "Jul", "monthShort": thisMonth, "year": thisYear, "type": "preEvaluationCount", "count": totalAttendedPreEvalCount, "sequence": sequence})
                conversionData.append({"monthLong": "Jul", "monthShort": thisMonth, "year": thisYear, "type": "conversionCount", "count": trueConversionRate, "sequence": sequence})
            elif thisMonth == 8:
                conversionData.append({"monthLong": "Aug", "monthShort": thisMonth, "year": thisYear, "type": "preEvaluationCount", "count": totalAttendedPreEvalCount, "sequence": sequence})
                conversionData.append({"monthLong": "Aug", "monthShort": thisMonth, "year": thisYear, "type": "conversionCount", "count": trueConversionRate, "sequence": sequence})
            elif thisMonth == 9:
                conversionData.append({"monthLong": "Sep", "monthShort": thisMonth, "year": thisYear, "type": "preEvaluationCount", "count": totalAttendedPreEvalCount, "sequence": sequence})
                conversionData.append({"monthLong": "Sep", "monthShort": thisMonth, "year": thisYear, "type": "conversionCount", "count": trueConversionRate, "sequence": sequence})
            elif thisMonth == 10:
                conversionData.append({"monthLong": "Oct", "monthShort": thisMonth, "year": thisYear, "type": "preEvaluationCount", "count": totalAttendedPreEvalCount, "sequence": sequence})
                conversionData.append({"monthLong": "Oct", "monthShort": thisMonth, "year": thisYear, "type": "conversionCount", "count": trueConversionRate, "sequence": sequence})
            elif thisMonth == 11:
                conversionData.append({"monthLong": "Nov", "monthShort": thisMonth, "year": thisYear, "type": "preEvaluationCount", "count": totalAttendedPreEvalCount, "sequence": sequence})
                conversionData.append({"monthLong": "Nov", "monthShort": thisMonth, "year": thisYear, "type": "conversionCount", "count": trueConversionRate, "sequence": sequence})
            elif thisMonth == 12:
                conversionData.append({"monthLong": "Dec", "monthShort": thisMonth, "year": thisYear, "type": "preEvaluationCount", "count": totalAttendedPreEvalCount, "sequence": sequence})
                conversionData.append({"monthLong": "Dec", "monthShort": thisMonth, "year": thisYear, "type": "conversionCount", "count": trueConversionRate, "sequence": sequence})

            y.insert(0, trueConversionRate)

            if thisMonth == 1:
                thisMonth = 12
                thisYear -= 1
                sequence -= 1
            else:
                thisMonth -= 1
                sequence -= 1

        x = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

        regression = np.polyfit(x, y, 1)

        currentMonthAttendedPreEvalPatients = AttendedAppointment.objects.filter(originalAppt__doctor__apptType=2,
                                                                                 originalAppt__date__month=datetime.now().month,
                                                                                 attended=True)
        patients = []

        for eachObj in currentMonthAttendedPreEvalPatients:
            patients.append(eachObj.patient)

        currentMonthAttendedPreEval = AttendedAppointment.objects.filter(patient__in=patients, attended=True).order_by('patient', 'last_modified')
        currentMonthPreEvalCount = currentMonthAttendedPreEval.count()

        prevItem = None
        for eachAttendedPreEval in currentMonthAttendedPreEval:
            if eachAttendedPreEval.patient == prevItem:
                currentMonthPreEvalCount += -1
                prevItem = eachAttendedPreEval.patient
            else:
                prevItem = eachAttendedPreEval.patient

        predict = regression[0] * currentMonthPreEvalCount + regression[1]
        line = 'y = ' + str(regression[0]) + 'x + ' + str(regression[0])

        thisMonth = datetime.now().month
        thisYear = datetime.now().year
        conversionData.append({"monthLong": datetime.now().strftime('%b'), "monthShort": thisMonth, "year": thisYear, "type": "preEvaluationCount", "count": currentMonthPreEvalCount, "sequence": 12})
        conversionData.append({"monthLong": datetime.now().strftime('%b'), "monthShort": thisMonth, "year": thisYear, "type": "conversionCount", "count": predict, "sequence": 12})

        return Response(conversionData)

def MonthSurgeryKPI(request):
    attendedSurgery = AttendedAppointment.objects.filter(originalAppt__doctor__apptType=3,
                                                         originalAppt__date__month=datetime.now().month,
                                                         attended=True).count()
    KPI = str(attendedSurgery) + '/' + str(settings.KPI)

    return HttpResponse(KPI)

class ViewWronglyRepliedSMS(viewsets.ModelViewSet):
    queryset = WronglyRepliedSMS.objects.all()
    serializer_class = WronglyRepliedSMSSerializer
