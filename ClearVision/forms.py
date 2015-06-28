__author__ = 'sherman'
from django import forms

class CreateForm(forms.Form):
    patient_name = forms.CharField(label='Patient Name', max_length=100)
    patient_gender = forms.CharField(label='Patient Gender', max_length=100)
    patient_contact = forms.CharField(label='Patient Contact', max_length=100)
    patient_dob = forms.CharField(label='Patient DOB', max_length=100)
    appt_time = forms.DateTimeField(label='Appt Time')
    appt_type = forms.CharField(label='Appt Type', max_length=100)
    appt_clinic = forms.CharField(label='Clinic', max_length=100)

