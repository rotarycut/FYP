from swampdragon import route_handler
from swampdragon.route_handler import ModelPubRouter
from ClearVision.models import *
from ClearVision.serializers import *


class AppointmentRouter(ModelPubRouter):
    route_name = 'AppointmentCRUD'
    serializer_class = SDAppointmentSerializer
    model = Appointment
    valid_verbs = ['created']

    def created(self, obj, **kwargs):
        return ("HELLO")

route_handler.register(AppointmentRouter)
