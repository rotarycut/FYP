from rq import Queue
from worker import conn
from ClearVision.views import DoctorList

q = Queue(connection=conn)
result = q.enqueue(DoctorList.create, 'http://heroku.com')
