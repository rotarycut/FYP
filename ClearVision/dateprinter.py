import calendar
import datetime

#year = 2015
years = [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030]
c = calendar.TextCalendar()
dump = open("fixtures/availabletimeslotsdump15years.json", "w+")

blank = []
for eachYear in years:
    year = eachYear
    for months in range(0, 13):
        if months == 0:
            for i in c.yeardays2calendar(year, width=1)[months]:
                for j in i:
                    for tup in j:
                        if tup[0] != 0:
                            if tup[1] == 0:
                                blank.append(str(year) + "-01-" + str(tup[0]))
                            if tup[1] == 1:
                                blank.append( str(year) + "-01-" + str(tup[0]))
                            if tup[1] == 2:
                                blank.append( str(year) + "-01-" + str(tup[0]))
                            if tup[1] == 3:
                                blank.append( str(year) + "-01-" + str(tup[0]))
                            if tup[1] == 4:
                                blank.append( str(year) + "-01-" + str(tup[0]))
                            if tup[1] == 5:
                                blank.append( str(year) + "-01-" + str(tup[0]))
                            if tup[1] == 6:
                                blank.append( str(year) + "-01-" + str(tup[0]))
        if months == 1:
            for i in c.yeardays2calendar(year, width=1)[months]:
                for j in i:
                    for tup in j:
                        if tup[0] != 0:
                            if tup[1] == 0:
                                blank.append( str(year) + "-02-" + str(tup[0]))
                            if tup[1] == 1:
                                blank.append( str(year) + "-02-" + str(tup[0]))
                            if tup[1] == 2:
                                blank.append( str(year) + "-02-" + str(tup[0]))
                            if tup[1] == 3:
                                blank.append( str(year) + "-02-" + str(tup[0]))
                            if tup[1] == 4:
                                blank.append( str(year) + "-02-" + str(tup[0]))
                            if tup[1] == 5:
                                blank.append( str(year) + "-02-" + str(tup[0]))
                            if tup[1] == 6:
                                blank.append( str(year) + "-02-" + str(tup[0]))
        if months == 2:
            for i in c.yeardays2calendar(year, width=1)[months]:
                for j in i:
                    for tup in j:
                        if tup[0] != 0:
                            if tup[1] == 0:
                                blank.append( str(year) + "-03-" + str(tup[0]))
                            if tup[1] == 1:
                                blank.append( str(year) + "-03-" + str(tup[0]))
                            if tup[1] == 2:
                                blank.append( str(year) + "-03-" + str(tup[0]))
                            if tup[1] == 3:
                                blank.append( str(year) + "-03-" + str(tup[0]))
                            if tup[1] == 4:
                                blank.append( str(year) + "-03-" + str(tup[0]))
                            if tup[1] == 5:
                                blank.append( str(year) + "-03-" + str(tup[0]))
                            if tup[1] == 6:
                                blank.append( str(year) + "-03-" + str(tup[0]))
        if months == 3:
            for i in c.yeardays2calendar(year, width=1)[months]:
                for j in i:
                    for tup in j:
                        if tup[0] != 0:
                            if tup[1] == 0:
                                blank.append( str(year) + "-04-" + str(tup[0]))
                            if tup[1] == 1:
                                blank.append( str(year) + "-04-" + str(tup[0]))
                            if tup[1] == 2:
                                blank.append( str(year) + "-04-" + str(tup[0]))
                            if tup[1] == 3:
                                blank.append( str(year) + "-04-" + str(tup[0]))
                            if tup[1] == 4:
                                blank.append( str(year) + "-04-" + str(tup[0]))
                            if tup[1] == 5:
                                blank.append( str(year) + "-04-" + str(tup[0]))
                            if tup[1] == 6:
                                blank.append( str(year) + "-04-" + str(tup[0]))
        if months == 4:
            for i in c.yeardays2calendar(year, width=1)[months]:
                for j in i:
                    for tup in j:
                        if tup[0] != 0:
                            if tup[1] == 0:
                                blank.append( str(year) + "-05-" + str(tup[0]))
                            if tup[1] == 1:
                                blank.append( str(year) + "-05-" + str(tup[0]))
                            if tup[1] == 2:
                                blank.append( str(year) + "-05-" + str(tup[0]))
                            if tup[1] == 3:
                                blank.append( str(year) + "-05-" + str(tup[0]))
                            if tup[1] == 4:
                                blank.append( str(year) + "-05-" + str(tup[0]))
                            if tup[1] == 5:
                                blank.append( str(year) + "-05-" + str(tup[0]))
                            if tup[1] == 6:
                                blank.append( str(year) + "-05-" + str(tup[0]))
        if months == 5:
            for i in c.yeardays2calendar(year, width=1)[months]:
                for j in i:
                    for tup in j:
                        if tup[0] != 0:
                            if tup[1] == 0:
                                blank.append( str(year) + "-06-" + str(tup[0]))
                            if tup[1] == 1:
                                blank.append( str(year) + "-06-" + str(tup[0]))
                            if tup[1] == 2:
                                blank.append( str(year) + "-06-" + str(tup[0]))
                            if tup[1] == 3:
                                blank.append( str(year) + "-06-" + str(tup[0]))
                            if tup[1] == 4:
                                blank.append( str(year) + "-06-" + str(tup[0]))
                            if tup[1] == 5:
                                blank.append( str(year) + "-06-" + str(tup[0]))
                            if tup[1] == 6:
                                blank.append( str(year) + "-06-" + str(tup[0]))
        if months == 6:
            for i in c.yeardays2calendar(year, width=1)[months]:
                for j in i:
                    for tup in j:
                        if tup[0] != 0:
                            if tup[1] == 0:
                                blank.append( str(year) + "-07-" + str(tup[0]))
                            if tup[1] == 1:
                                blank.append( str(year) + "-07-" + str(tup[0]))
                            if tup[1] == 2:
                                blank.append( str(year) + "-07-" + str(tup[0]))
                            if tup[1] == 3:
                                blank.append( str(year) + "-07-" + str(tup[0]))
                            if tup[1] == 4:
                                blank.append( str(year) + "-07-" + str(tup[0]))
                            if tup[1] == 5:
                                blank.append( str(year) + "-07-" + str(tup[0]))
                            if tup[1] == 6:
                                blank.append( str(year) + "-07-" + str(tup[0]))
        if months == 7:
            for i in c.yeardays2calendar(year, width=1)[months]:
                for j in i:
                    for tup in j:
                        if tup[0] != 0:
                            if tup[1] == 0:
                                blank.append( str(year) + "-08-" + str(tup[0]))
                            if tup[1] == 1:
                                blank.append( str(year) + "-08-" + str(tup[0]))
                            if tup[1] == 2:
                                blank.append( str(year) + "-08-" + str(tup[0]))
                            if tup[1] == 3:
                                blank.append( str(year) + "-08-" + str(tup[0]))
                            if tup[1] == 4:
                                blank.append( str(year) + "-08-" + str(tup[0]))
                            if tup[1] == 5:
                                blank.append( str(year) + "-08-" + str(tup[0]))
                            if tup[1] == 6:
                                blank.append( str(year) + "-08-" + str(tup[0]))
        if months == 8:
            for i in c.yeardays2calendar(year, width=1)[months]:
                for j in i:
                    for tup in j:
                        if tup[0] != 0:
                            if tup[1] == 0:
                                blank.append( str(year) + "-09-" + str(tup[0]))
                            if tup[1] == 1:
                                blank.append( str(year) + "-09-" + str(tup[0]))
                            if tup[1] == 2:
                                blank.append( str(year) + "-09-" + str(tup[0]))
                            if tup[1] == 3:
                                blank.append( str(year) + "-09-" + str(tup[0]))
                            if tup[1] == 4:
                                blank.append( str(year) + "-09-" + str(tup[0]))
                            if tup[1] == 5:
                                blank.append( str(year) + "-09-" + str(tup[0]))
                            if tup[1] == 6:
                                blank.append( str(year) + "-09-" + str(tup[0]))
        if months == 9:
            for i in c.yeardays2calendar(year, width=1)[months]:
                for j in i:
                    for tup in j:
                        if tup[0] != 0:
                            if tup[1] == 0:
                                blank.append( str(year) + "-10-" + str(tup[0]))
                            if tup[1] == 1:
                                blank.append( str(year) + "-10-" + str(tup[0]))
                            if tup[1] == 2:
                                blank.append( str(year) + "-10-" + str(tup[0]))
                            if tup[1] == 3:
                                blank.append( str(year) + "-10-" + str(tup[0]))
                            if tup[1] == 4:
                                blank.append( str(year) + "-10-" + str(tup[0]))
                            if tup[1] == 5:
                                blank.append( str(year) + "-10-" + str(tup[0]))
                            if tup[1] == 6:
                                blank.append( str(year) + "-10-" + str(tup[0]))
        if months == 10:
            for i in c.yeardays2calendar(year, width=1)[months]:
                for j in i:
                    for tup in j:
                        if tup[0] != 0:
                            if tup[1] == 0:
                                blank.append( str(year) + "-11-" + str(tup[0]))
                            if tup[1] == 1:
                                blank.append( str(year) + "-11-" + str(tup[0]))
                            if tup[1] == 2:
                                blank.append( str(year) + "-11-" + str(tup[0]))
                            if tup[1] == 3:
                                blank.append( str(year) + "-11-" + str(tup[0]))
                            if tup[1] == 4:
                                blank.append( str(year) + "-11-" + str(tup[0]))
                            if tup[1] == 5:
                                blank.append( str(year) + "-11-" + str(tup[0]))
                            if tup[1] == 6:
                                blank.append( str(year) + "-11-" + str(tup[0]))
        if months == 11:
            for i in c.yeardays2calendar(year, width=1)[months]:
                for j in i:
                    for tup in j:
                        if tup[0] != 0:
                            if tup[1] == 0:
                                blank.append( str(year) + "-12-" + str(tup[0]))
                            if tup[1] == 1:
                                blank.append( str(year) + "-12-" + str(tup[0]))
                            if tup[1] == 2:
                                blank.append( str(year) + "-12-" + str(tup[0]))
                            if tup[1] == 3:
                                blank.append( str(year) + "-12-" + str(tup[0]))
                            if tup[1] == 4:
                                blank.append( str(year) + "-12-" + str(tup[0]))
                            if tup[1] == 5:
                                blank.append( str(year) + "-12-" + str(tup[0]))
                            if tup[1] == 6:
                                blank.append( str(year) + "-12-" + str(tup[0]))

    totalTimeslots = []
    doctors = 2
    doctors1 = 1
    doctors2 = 3

    startTime = datetime.datetime(100, 1, 1, 9, 00)

    for j in blank:
        for k in range(1, 19):
            totalTimeslots.append({"model": "ClearVision.AvailableTimeSlots", "fields":
            {"timeslotType": "Pre Evaluation", "start": str(startTime.time()), "end": str((startTime + datetime.timedelta(minutes=30)).time()),
            "date": str(j), "doctors": doctors}})
            startTime = startTime + datetime.timedelta(minutes=30)
        startTime = datetime.datetime(100, 1, 1, 9, 00)

    startTime = datetime.datetime(100, 1, 1, 9, 00)

    for j in blank:
        for k in range(1, 19):
            totalTimeslots.append({"model": "ClearVision.AvailableTimeSlots", "fields":
            {"timeslotType": "Surgery", "start": str(startTime.time()), "end": str((startTime + datetime.timedelta(minutes=30)).time()),
            "date": str(j), "doctors": doctors}})
            startTime = startTime + datetime.timedelta(minutes=30)
        startTime = datetime.datetime(100, 1, 1, 9, 00)

    startTime = datetime.datetime(100, 1, 1, 9, 00)

    for j in blank:
        for k in range(1, 19):
            totalTimeslots.append({"model": "ClearVision.AvailableTimeSlots", "fields":
            {"timeslotType": "Post Surgery", "start": str(startTime.time()), "end": str((startTime + datetime.timedelta(minutes=30)).time()),
            "date": str(j), "doctors": doctors}})
            startTime = startTime + datetime.timedelta(minutes=30)
        startTime = datetime.datetime(100, 1, 1, 9, 00)

    startTime = datetime.datetime(100, 1, 1, 9, 00)

    for j in blank:
        for k in range(1, 19):
            totalTimeslots.append({"model": "ClearVision.AvailableTimeSlots", "fields":
            {"timeslotType": "Pre Evaluation", "start": str(startTime.time()), "end": str((startTime + datetime.timedelta(minutes=30)).time()),
            "date": str(j), "doctors": doctors1}})
            startTime = startTime + datetime.timedelta(minutes=30)
        startTime = datetime.datetime(100, 1, 1, 9, 00)

    startTime = datetime.datetime(100, 1, 1, 9, 00)

    for j in blank:
        for k in range(1, 19):
            totalTimeslots.append({"model": "ClearVision.AvailableTimeSlots", "fields":
            {"timeslotType": "Surgery", "start": str(startTime.time()), "end": str((startTime + datetime.timedelta(minutes=30)).time()),
            "date": str(j), "doctors": doctors1}})
            startTime = startTime + datetime.timedelta(minutes=30)
        startTime = datetime.datetime(100, 1, 1, 9, 00)


    startTime = datetime.datetime(100, 1, 1, 9, 00)

    for j in blank:
        for k in range(1, 19):
            totalTimeslots.append({"model": "ClearVision.AvailableTimeSlots", "fields":
            {"timeslotType": "Post Surgery", "start": str(startTime.time()), "end": str((startTime + datetime.timedelta(minutes=30)).time()),
            "date": str(j), "doctors": doctors1}})
            startTime = startTime + datetime.timedelta(minutes=30)
        startTime = datetime.datetime(100, 1, 1, 9, 00)

    startTime = datetime.datetime(100, 1, 1, 9, 00)

    for j in blank:
        for k in range(1, 19):
            totalTimeslots.append({"model": "ClearVision.AvailableTimeSlots", "fields":
            {"timeslotType": "Screening", "start": str(startTime.time()), "end": str((startTime + datetime.timedelta(minutes=30)).time()),
            "date": str(j), "doctors": doctors2}})
            startTime = startTime + datetime.timedelta(minutes=30)
        startTime = datetime.datetime(100, 1, 1, 9, 00)

    startTime = datetime.datetime(100, 1, 1, 9, 00)

    for j in blank:
        for k in range(1, 19):
            totalTimeslots.append({"model": "ClearVision.AvailableTimeSlots", "fields":
            {"timeslotType": "Eyecare", "start": str(startTime.time()), "end": str((startTime + datetime.timedelta(minutes=30)).time()),
            "date": str(j), "doctors": doctors2}})
            startTime = startTime + datetime.timedelta(minutes=30)
        startTime = datetime.datetime(100, 1, 1, 9, 00)



dump.write(str(totalTimeslots).replace("'", "\""))
#print(str(totalTimeslots).replace("'", "\""))