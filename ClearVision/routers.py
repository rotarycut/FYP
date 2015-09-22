from swampdragon import route_handler
from swampdragon.route_handler import BaseRouter

class AppointmentCreate(BaseRouter):
    route_name = 'AppointmentCreate'

    def get_subscription_channels(self, **kwargs):
        return ['createAppt']

class AppointmentUpdate(BaseRouter):
    route_name = 'AppointmentUpdate'

    def get_subscription_channels(self, **kwargs):
        return ['updateAppt']

class AppointmentDelete(BaseRouter):
    route_name = 'AppointmentDelete'

    def get_subscription_channels(self, **kwargs):
        return ['deleteAppt']

class PatientQueue(BaseRouter):
    route_name = 'patientQueue'

    def get_subscription_channels(self, **kwargs):
        return ['queue']

route_handler.register(AppointmentCreate)
route_handler.register(PatientQueue)
