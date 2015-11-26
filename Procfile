web: bin/start-nginx newrelic-admin run-program gunicorn -c gunicorn.conf FYP.wsgi:application
celeryprocesses: env > .env; env GEM_HOME=$HOME/.ruby-gems env PATH=PATH:$HOME/.ruby-gems/bin foreman start -f ProcfileFree
worker: python worker.py
