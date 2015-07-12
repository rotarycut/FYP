from django.conf.urls import url, include
from . import views
from ClearVision.views import PatientList

urlpatterns = [
    url('^', include('django.contrib.auth.urls')),
    url(r'^success', views.success, name='success'),
    url(r'^logout', views.logout, name='logout'),
    url(r'^_api/patients', PatientList.as_view()),
    url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework'))
]