from django.contrib.auth.decorators import login_required
from django.http import HttpResponse

@login_required
def success(request):
    return HttpResponse("Hello, world. You're at the Clearvision home page and successfully logged in.")
