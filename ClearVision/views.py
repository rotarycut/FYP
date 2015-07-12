from django.contrib.auth.decorators import login_required
from django.contrib.auth.views import logout_then_login
from django.shortcuts import render
from django.template import Context
from django.views.decorators.csrf import csrf_exempt
from rest_framework.renderers import JSONRenderer
from .serializers import *
from rest_framework import filters
from rest_framework import generics

@login_required
def success(request):
    response = "Hello " + request.user.username + ". You're at the Clearvision home page and successfully logged in."
    context = Context({
        'message': response,
    })
    return render(request, 'success.html', context)

def logout(request):
    return logout_then_login(request, 'login')


class PatientList(generics.ListAPIView):
    #renderer_classes = (JSONRenderer,)
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer
    filter_backends = (filters.DjangoFilterBackend,)
    filter_fields = ('marketingChannelId', 'gender')