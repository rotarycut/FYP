from celery import task
from datetime import date
from ClearVision.models import *

@task()
def sendSMS():
    today_patient_data = Appointment.objects.filter(timeBucket__date=date.today()).values('patients', 'patients__name',
                                                                                             'patients__gender', 'timeBucket__date',
                                                                                             'timeBucket__start', 'apptType', 'id',
                                                                                             'timeBucket', 'doctor__name', 'clinic',
                                                                                             'doctor').\
            exclude(patients__isnull=True)

    numbersToSend = []

    for eachObj in today_patient_data:
        numbersToSend.append(eachObj['patients'])

    print(numbersToSend)
