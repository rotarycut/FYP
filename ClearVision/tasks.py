from celery import task
from datetime import date, datetime, timedelta
from ClearVision.models import *
import requests
import base64

@task()
def clearPatientQueue():
    print("Patient Queue Executed")

@task()
def sendSMS():
    today_patient_data = Appointment.objects.filter(timeBucket__date=date.today() + timedelta(days=2)).values('patients', 'patients__name',
                                                                                                              'patients__gender', 'timeBucket__date',
                                                                                                              'timeBucket__start', 'apptType', 'id',
                                                                                                              'timeBucket', 'doctor__name', 'clinic',
                                                                                                              'doctor').\
            exclude(patients__isnull=True)

    numbersToSend = []

    for eachObj in today_patient_data:
        numbersToSend.append([eachObj['patients__name'], eachObj['patients'], eachObj['timeBucket__start']])

    encoded = base64.b64encode('AnthonyS:ClearVision2')
    headers = {'Authorization': 'Basic '+encoded, 'Content-Type': 'application/json', 'Accept': 'application/json'}

    for eachNumberToSendSMS in numbersToSend:

        # 'from' field has max length of 11 characters

        payload = {'from': 'Clearvision', 'to': '65'+ str(eachNumberToSendSMS[1]),
                   'text': 'Hi ' + str(eachNumberToSendSMS[0]) +
                           ', please be reminded of your Appointment with us tomorrow at ' + str(eachNumberToSendSMS[2])}

        requests.post("https://api.infobip.com/sms/1/text/single", json=payload, headers=headers)
