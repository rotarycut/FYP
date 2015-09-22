from swampdragon import route_handler
from swampdragon.route_handler import BaseRouter
from ClearVision.views import AppointmentWriter


class AppointmentCUD(BaseRouter):
    route_name = 'AppointmentCUD'

    def get_subscription_channels(self, **kwargs):
        return ['createAppt', 'updateAppt']

route_handler.register(AppointmentCUD)
