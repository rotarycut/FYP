from swampdragon import route_handler
from swampdragon.route_handler import BaseRouter
from ClearVision.views import AppointmentWriter


class AppointmentCUDRouter(BaseRouter):
    route_name = 'AppointmentCUD'

    def get_subscription_channels(self, **kwargs):
        AppointmentWriter()
        return ['apptinfo']


route_handler.register(AppointmentCUDRouter)