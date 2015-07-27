from django.conf.urls import url, include
from . import views
from rest_framework import routers

router = routers.DefaultRouter()
router.register(r'_api/patients', views.PatientList)
router.register(r'_api/clinics', views.ClinicList)
router.register(r'_api/staff', views.StaffList)
router.register(r'_api/doctors', views.DoctorList)
router.register(r'_api/appointments', views.AppointmentList)
router.register(r'_api/appointmentsCUD', views.AppointmentWriter)

urlpatterns = [
    url('^', include('django.contrib.auth.urls')),
    url(r'^header', views.header, name='header'),
    url(r'^success', views.success, name='success'),
    url(r'^logout', views.logout, name='logout'),
    url(r'^', include(router.urls)),
    url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework'))
]

    #url(r'^_api/patients, PatientList.as_view()')
