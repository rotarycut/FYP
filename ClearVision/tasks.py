import StringIO
from django.core.mail import EmailMessage
from celery import task
from datetime import date, datetime, timedelta
from ClearVision.models import *
import csv
from django.conf import settings
import requests
import base64

@task()
def sendPreSurgery():
    print("Patient Queue Executed")

@task()
def sendSMS():

    days = DaysAheadReminderSMS.objects.get(id=1).days
    """
    today_patient_data = Appointment.objects.filter(timeBucket__date=date.today() + timedelta(days=days)).values('patients__contact', 'patients__name',
                                                                                                              'patients__gender', 'timeBucket__date',
                                                                                                              'timeBucket__start', 'apptType', 'id',
                                                                                                              'timeBucket', 'doctor__name', 'clinic',
                                                                                                              'doctor').\
            exclude(patients__isnull=True, patients__smsOptOut=True)

    numbersToSend = []

    for eachObj in today_patient_data:
        numbersToSend.append([eachObj['patients__name'], eachObj['patients__contact'], eachObj['timeBucket__start'], eachObj['timeBucket__date']])

    encoded = base64.b64encode('AnthonyS:ClearVision2')
    headers = {'Authorization': 'Basic '+encoded, 'Content-Type': 'application/json', 'Accept': 'application/json'}

    for eachNumberToSendSMS in numbersToSend:

        # 'from' field has max length of 11 characters

        payload = {'from': 'Clearvision', 'to': '65' + str(eachNumberToSendSMS[1]),
                   'text': 'Hi ' + str(eachNumberToSendSMS[0]) +
                           ', please be reminded of your Appointment on ' + str(eachNumberToSendSMS[3]) + ' at ' + str(eachNumberToSendSMS[2])}
        requests.post("https://api.infobip.com/sms/1/text/single", json=payload, headers=headers)
    """
    print("SendSMS Executed")

@task()
def sendDailyBackup():

    appointments = Appointment.objects.filter(timeBucket__date__gte=date.today(), timeBucket__date__lte=date.today() + timedelta(days=30)).\
        values('patients__contact', 'patients__name', 'patients__gender', 'timeBucket__date', 'timeBucket__start', 'apptType', 'id', 'doctor__name', 'clinic', 'doctor').\
        exclude(patients__isnull=True)

    csvfile = StringIO.StringIO()
    csvwriter = csv.writer(csvfile)

    csvwriter.writerow(['patients_contact', 'patients__name', 'patients__gender', 'timeBucket__date', 'timeBucket__start',
                        'apptType', 'id', 'doctor__name', 'clinic', 'doctor'])

    for eachObj in appointments:
        csvwriter.writerow([eachObj['patients__contact'], eachObj['patients__name'], eachObj['patients__gender'], eachObj['timeBucket__date'],
                            eachObj['timeBucket__start'], eachObj['apptType'], eachObj['id'], eachObj['doctor__name'],
                            eachObj['clinic'], eachObj['doctor']])

    message = EmailMessage("Backup for " + str(date.today()), "Daily Failsafe. (T + 30) days Appointments", to=settings.DAILY_BACKUP_RECIPIENTS)
    message.attach('backup.csv', csvfile.getvalue(), 'text/csv')

    message.send()

    print("Successful Daily Backup")

@task()
def sendMonthlyBackup():

    appointments = Appointment.objects.all().\
        values('patients__contact', 'patients__name', 'patients__gender', 'timeBucket__date', 'timeBucket__start', 'apptType', 'id', 'doctor__name', 'clinic', 'doctor').\
        exclude(patients__isnull=True)

    csvfile = StringIO.StringIO()
    csvwriter = csv.writer(csvfile)

    csvwriter.writerow(['patients_contact', 'patients__name', 'patients__gender', 'timeBucket__date', 'timeBucket__start',
                        'apptType', 'id', 'doctor__name', 'clinic', 'doctor'])

    for eachObj in appointments:
        csvwriter.writerow([eachObj['patients__contact'], eachObj['patients__name'], eachObj['patients__gender'], eachObj['timeBucket__date'],
                            eachObj['timeBucket__start'], eachObj['apptType'], eachObj['id'], eachObj['doctor__name'],
                            eachObj['clinic'], eachObj['doctor']])

    message = EmailMessage("Backup for " + str(date.today().strftime("%B")) + " " + str(date.today().year), "Monthly Failsafe. All Appointment data", to=settings.MONTHLY_BACKUP_RECIPIENTS)
    message.attach('backup.csv', csvfile.getvalue(), 'text/csv')

    message.send()

    print("Successful Monthly Backup")

@task()
def sendPreSurvey():
    preEvalAppt = AppointmentType.objects.get(id=2)
    allAttended = AttendedAppointment.objects.filter(apptType=preEvalAppt.name,
                                                     attended=True,
                                                     timeBucket__date__date=datetime.today()).values('patient__contact', 'patient__name', ).exclude(patient__smsOptOut=True)

    numbersToSend = []

    for eachObj in allAttended:
        numbersToSend.append([[eachObj['patient__contact'], eachObj['patient__name'], eachObj['doctor__name']]])

    encoded = base64.b64encode('AnthonyS:ClearVision2')
    headers = {'Authorization': 'Basic '+encoded, 'Content-Type': 'application/json', 'Accept': 'application/json'}

    for eachNumberToSendSMS in numbersToSend:

        # 'from' field has max length of 11 characters

        payload = {'from': 'Clearvision', 'to': '65' + str(eachNumberToSendSMS[0]),
                   'text': 'Hi ' + str(eachNumberToSendSMS[1]) +
                           ', please help us complete this short survey on your Pre Evaluation experience at ' + 'https://goo.gl/Rh6mkl'}
        requests.post("https://api.infobip.com/sms/1/text/single", json=payload, headers=headers)
