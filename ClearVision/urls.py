from django.conf.urls import url, include
from . import views

urlpatterns = [
    url('^', include('django.contrib.auth.urls')),
    url(r'^success', views.success, name='success'),
    url(r'^logout', views.logout, name='logout'),
]