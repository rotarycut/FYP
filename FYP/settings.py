"""
Django settings for FYP project.

Generated by 'django-admin startproject' using Django 1.8.2.

For more information on this file, see
https://docs.djangoproject.com/en/1.8/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/1.8/ref/settings/
"""

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/1.8/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'pxs+h+dny2_$k4le=5jiclt*-s$uppn#w*x9(76ae(4!t7^h=_'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ['*']


# Application definition

INSTALLED_APPS = (
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'ClearVision',
    'FYP',
    'rest_framework',
    'widget_tweaks',
    'djcelery',
    'kombu.transport.django',
    'pusher',
)

MIDDLEWARE_CLASSES = (
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.auth.middleware.SessionAuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'django.middleware.security.SecurityMiddleware',
)

ROOT_URLCONF = 'FYP.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR,  'templates')],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'FYP.wsgi.application'


# Database
# https://docs.djangoproject.com/en/1.8/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
    }
}


# Internationalization
# https://docs.djangoproject.com/en/1.8/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'Singapore'

USE_I18N = True

USE_L10N = True

USE_TZ = False


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.8/howto/static-files/

STATIC_URL = '/static/'

LOGIN_REDIRECT_URL = 'success'
LOGIN_URL = 'login'


REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework.authentication.TokenAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.AllowAny',
    ),
}

STATICFILES_DIRS = (
    os.path.join(BASE_DIR, 'static'),
)

"""
# Parse database configuration from $DATABASE_URL
import dj_database_url
DATABASES['default'] =  dj_database_url.config()

# Honor the 'X-Forwarded-Proto' header for request.is_secure()
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

STATIC_ROOT = 'staticfiles'
"""

# Celery Settings
import djcelery
djcelery.setup_loader()
CELERYBEAT_SCHEDULER = 'djcelery.schedulers.DatabaseScheduler'
BROKER_URL = 'redis://localhost:6379/0'
#BROKER_URL=os.environ['REDIS_URL']
##############
"""
# SwampDragon settings
SWAMP_DRAGON_CONNECTION = ('swampdragon.connections.sockjs_connection.DjangoSubscriberConnection', '/data')
DRAGON_URL = 'http://localhost:9999'

import redis
import urlparse
redis_url = urlparse.urlparse(os.environ.get('REDIS_URL'))
SWAMP_DRAGON_REDIS_HOST = redis_url.hostname
SWAMP_DRAGON_REDIS_PORT = redis_url.port
SWAMP_DRAGON_REDIS_PASS = redis_url.password
"""
#############
"""
#Timetable settings
MONDAY_SLOTS_NONSURGERY = ['09:00:00', '09:30:00', '10:00:00', '10:30:00', '11:00:00']
TUESDAY_SLOTS_NONSURGERY = ['09:00:00', '09:30:00', '10:00:00', '10:30:00', '11:00:00', '14:00:00', '14:30:00', '15:00:00', '15:30:00']
WEDNESDAY_SLOTS_NONSURGERY = ['09:00:00', '09:30:00', '10:00:00', '10:30:00', '11:00:00']
THURSDAY_SLOTS_NONSURGERY = ['09:00:00', '09:30:00', '10:00:00', '10:30:00', '11:00:00', '14:00:00', '14:30:00', '15:00:00', '15:30:00']
FRIDAY_SLOTS_NONSURGERY = ['14:00:00', '14:30:00', '15:00:00', '15:30:00']
SATURDAY_SLOTS_NONSURGERY = ['09:00:00', '09:30:00', '10:00:00', '10:30:00', '11:00:00']

MONDAY_SLOTS_SURGERY = ['11:00:00', '16:30:00']
TUESDAY_SLOTS_SURGERY = ['11:00:00', '16:30:00']
WEDNESDAY_SLOTS_SURGERY = ['11:00:00', '16:30:00']
THURSDAY_SLOTS_SURGERY = ['11:00:00', '16:30:00']
FRIDAY_SLOTS_SURGERY = ['11:00:00', '16:30:00']
SATURDAY_SLOTS_SURGERY =[]
"""