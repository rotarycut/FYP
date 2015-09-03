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
router.register(r'_api/iSchedule', views.AppointmentIScheduleFinder)
router.register(r'_api/analyticsServer', views.AnalyticsServer)
router.register(r'_api/Remarks', views.RemarksFinder)
router.register(r'_api/HeatMap', views.AppointmentHeatMap)
router.register(r'_api/TimeSlots', views.AvaliableTimeSlots)
router.register(r'_api/Swapper', views.iScheduleSwapper)
router.register(r'_api/SearchBar', views.SearchBarFilter)
router.register(r'_api/ViewSwapperTable', views.ViewSwapperTable)
router.register(r'_api/ViewApptTimeslots', views.ViewApptTimeslots)
router.register(r'_api/ViewNotifications', views.ViewNotifications)
router.register(r'_api/ViewTodayPatients', views.ViewTodayPatients)
router.register(r'_api/ViewNoShow', views.ViewNoShow)
router.register(r'_api/ViewPatientQueue', views.PatientQueue)
router.register(r'_api/ViewArchive', views.ViewArchive)

urlpatterns = [
    url('^', include('django.contrib.auth.urls')),
    url(r'^header', views.header, name='header'),
    url(r'^calendar', views.calendar),
    url(r'^dashboard', views.dashboard),
    url(r'^waitlist', views.waitlist),
    url(r'^queue', views.queue),
    url(r'^msglog', views.msglog),
    url(r'^changepw', views.changepw),
    url(r'^success', views.success, name='success'),
    url(r'^logout', views.logout, name='logout'),
    url(r'^', include(router.urls)),
    url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    url(r'^_api/recievemsg', views.recievemsg,),
]
