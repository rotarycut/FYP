from django.contrib.auth.decorators import login_required
from django.contrib.auth.views import logout_then_login
from django.shortcuts import render
from django.template import Context



@login_required
def success(request):
    response = "Hello, world. You're at the Clearvision home page and successfully logged in."
    context = Context({
        'message': response,
    })
    return render(request, 'success.html', context)

def logout(request):
    return logout_then_login(request, 'login')