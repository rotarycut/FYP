web: gunicorn FYP.wsgi --log-file -
celeryworker: python manage.py celery worker --loglevel=INFO --broker=redis://localhost:6379/0
clerybeat: python manage.py celery beat --loglevel=INFO --broker redis://localhost:6379/0
swampdragon: python manage.py runsd