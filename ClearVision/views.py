from django.contrib.auth.decorators import login_required
from django.contrib.auth.views import logout_then_login
from django.http import HttpResponseRedirect, HttpResponse
from django.shortcuts import render
from django.template import Context
from django.views.decorators.csrf import csrf_exempt
from rest_framework.renderers import JSONRenderer
from .forms import CreateForm
from ClearVision.models import Appointment, Patient, Doctor
from datetime import datetime
from rest_framework import viewsets
from .serializers import AppointmentSerializer, PatientSerializer, DoctorSerializer


@login_required
def success(request):
    response = "Hello " + request.user.username + ". You're at the Clearvision home page and successfully logged in."
    context = Context({
        'message': response,
    })
    return render(request, 'success.html', context)

def logout(request):
    return logout_then_login(request, 'login')

def create(request):
    if request.method == 'POST':
        form = CreateForm(request.POST)
        if form.is_valid():
            pName = form.cleaned_data['patient_name']
            pGender = form.cleaned_data['patient_gender']
            pContact = form.cleaned_data['patient_contact']
            pDob = form.cleaned_data['patient_dob']
            aTime = form.cleaned_data['appt_time']
            aType = form.cleaned_data['appt_type']
            aClinic = form.cleaned_data['appt_clinic']

            newAppt = Appointment(Patient(name=pName, gender=pGender, contact=pContact, dob=pDob),
                                  Doctor(name="Sherman", phoneModel="Apple", calDavAccount="12345"),
                                  appt_type=aType, date=aTime, clinic=aClinic, creation_time=datetime.now())
            newAppt.save()

            return HttpResponseRedirect('success')
    else:
        form = CreateForm()
        return render(request, 'create.html', {'form':form})

class AppointmentViewSet(viewsets.ModelViewSet):
    #renderer_classes = (JSONRenderer,)
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer

class PatientViewSet(viewsets.ModelViewSet):
    #renderer_classes = (JSONRenderer,)
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer

class DoctorViewSet(viewsets.ModelViewSet):
    #renderer_classes = (JSONRenderer,)
    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer
