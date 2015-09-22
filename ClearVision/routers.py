from swampdragon import route_handler
from swampdragon.route_handler import BaseRouter

class AppointmentCUD(BaseRouter):
    route_name = 'AppointmentCUD'

    def get_subscription_channels(self, **kwargs):
        return ['createAppt', 'updateAppt', 'deleteAppt']

class PatientQueue(BaseRouter):
    route_name = 'patientQueue'

    def get_subscription_channels(self, **kwargs):
        return ['queue']

route_handler.register(AppointmentCUD)
route_handler.register(PatientQueue)
