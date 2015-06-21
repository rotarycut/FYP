from django.contrib.auth.decorators import login_required
from django.http import HttpResponse
from django.shortcuts import render
from django.template import Context



@login_required
def success(request):
    response = "Hello, world. You're at the Clearvision home page and successfully logged in."
    context = Context({
        'message': response
    })
    return render(request, 'success.html', context)