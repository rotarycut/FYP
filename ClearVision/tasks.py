from celery import task
import datetime
from ClearVision.models import *

@task()
def sendSMS():
    today_patient_data = Appointment.objects.filter(timeBucket__date=datetime.today()).values('patients', 'patients__name',
                                                                                             'patients__gender', 'timeBucket__date',
                                                                                             'timeBucket__start', 'apptType', 'id',
                                                                                             'timeBucket', 'doctor__name', 'clinic',
                                                                                             'doctor').\
            exclude(patients__isnull=True)
    print(today_patient_data)
