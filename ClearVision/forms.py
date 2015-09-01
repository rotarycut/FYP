__author__ = 'sherman'
from django import forms

class ChangepwForm(forms.Form):
    oldpassword = forms.CharField(label='oldpassword', max_length=100)
    newpassword = forms.CharField(label='newpassword', max_length=100)
    confirmnewpassword = forms.CharField(label='confirmnewpassword', max_length=100)