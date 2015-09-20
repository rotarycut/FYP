__author__ = 'sherman'
from django import forms

class ChangepwForm(forms.Form):
    oldpassword = forms.CharField(label='oldpassword', max_length=100, widget=forms.PasswordInput())
    newpassword = forms.CharField(label='newpassword', max_length=100, widget=forms.PasswordInput())
    confirmnewpassword = forms.CharField(label='confirmnewpassword', max_length=100, widget=forms.PasswordInput())