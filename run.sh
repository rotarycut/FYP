#!/bin/bash

python server.py &
python manage.py runserver --noreload &

trap "kill -TERM -$$" SIGINT
wait