from django.conf import settings

redis_host = None
redis_port = None
redis_db = None
redis_pass = None


def get_redis_host():
    global redis_host
    if not redis_host:
        redis_host = getattr(settings, 'SWAMP_DRAGON_REDIS_HOST', 'localhost')
    return redis_host


def get_redis_port():
    global redis_port
    if not redis_port:
        redis_port = getattr(settings, 'SWAMP_DRAGON_REDIS_PORT', 6379)
    return redis_port


def get_redis_db():
    global redis_db
    if not redis_db:
        redis_db = getattr(settings, 'SWAMP_DRAGON_REDIS_DB', 0)
    return redis_db

def get_redis_pass():
    global redis_pass
    if not redis_pass:
        redis_pass = getattr(settings, 'SWAMP_DRAGON_REDIS_PASS', None)
    return redis_pass
