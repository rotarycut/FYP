from celery import task
from datetime import date
from ClearVision.models import *
import requests
from twilio.rest import TwilioRestClient
import base64

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
        numbersToSend.append([eachObj['patients__name'], eachObj['patients'], eachObj['timeBucket__start']])
    """
    ACCOUNT_SID = "AC72c59e83e3193394ef8bbb5c17d30810"
    AUTH_TOKEN = "ad0a094cc106b71f8ddd42eaf6aca4d4"

    client = TwilioRestClient(ACCOUNT_SID, AUTH_TOKEN)
    """

    for eachNumberToSendSMS in numbersToSend:
        """ Commzgate logic
        payload = {'ID': '65250002', 'Password': 'clearvision2015', 'Mobile': '65'+eachNumberToSendSMS, 'Type': 'A',
                   'Message': '<<Clearvision>> Please be reminded of your Appointment with us tomorrow.'}

        requests.post("https://www.commzgate.net/gateway/SendMsg", params=payload)

        """
        """ Twilio
        client.messages.create(to="+65"+eachNumberToSendSMS[1], from_="+17868002606",
                               body="<<Clearvision>> Hi " + eachNumberToSendSMS[0] +
                                    ", please be reminded of your Appointment with us tomorrow at " + str(eachNumberToSendSMS[2]))
        """

        encoded = base64.b64encode('AnthonyS:ClearVision2')

        # 'from' field has max length of 11 characters

        headers = {'Authorization': 'Basic '+encoded, 'Content-Type': 'application/json', 'Accept': 'application/json'}
        payload = {'from': 'Clearvision', 'to': '65'+eachNumberToSendSMS[1],
                   'text': 'Hi ' + eachNumberToSendSMS[0] +
                           ', please be reminded of your Appointment with us tomorrow at ' + str(eachNumberToSendSMS[2])}

        requests.post("https://api.infobip.com/sms/1/text/single", json=payload, headers=headers)
