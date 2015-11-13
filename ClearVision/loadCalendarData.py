import sys

__author__ = 'sherman'
import datetime
import calendar
import json

###settings###
#year = sys.argv[1]
#year = int(year)
years = [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030]
###settings###

dump = open("fixtures/YearDump.json", "w+")
c = calendar.TextCalendar()

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
                                blank.append({"model": "ClearVision.FullYearCalendar", "fields": {"day": "Monday", "date": str(year) + "-01-" + str(tup[0])}})
                            if tup[1] == 1:
                                blank.append({"model": "ClearVision.FullYearCalendar", "fields": {"day": "Tuesday", "date": str(year) + "-01-" + str(tup[0])}})
                            if tup[1] == 2:
                                blank.append({"model": "ClearVision.FullYearCalendar", "fields": {"day": "Wednesday", "date": str(year) + "-01-" + str(tup[0])}})
                            if tup[1] == 3:
                                blank.append({"model": "ClearVision.FullYearCalendar", "fields": {"day": "Thursday", "date": str(year) + "-01-" + str(tup[0])}})
                            if tup[1] == 4:
                                blank.append({"model": "ClearVision.FullYearCalendar", "fields": {"day": "Friday", "date": str(year) + "-01-" + str(tup[0])}})
                            if tup[1] == 5:
                                blank.append({"model": "ClearVision.FullYearCalendar", "fields": {"day": "Saturday", "date": str(year) + "-01-" + str(tup[0])}})
                            if tup[1] == 6:
                                blank.append({"model": "ClearVision.FullYearCalendar", "fields": {"day": "Sunday", "date": str(year) + "-01-" + str(tup[0])}})
        if months == 1:
            for i in c.yeardays2calendar(year, width=1)[months]:
                for j in i:
                    for tup in j:
                        if tup[0] != 0:
                            if tup[1] == 0:
                                blank.append({"model": "ClearVision.FullYearCalendar", "fields": {"day": "Monday", "date": str(year) + "-02-" + str(tup[0])}})
                            if tup[1] == 1:
                                blank.append({"model": "ClearVision.FullYearCalendar", "fields": {"day": "Tuesday", "date": str(year) + "-02-" + str(tup[0])}})
                            if tup[1] == 2:
                                blank.append({"model": "ClearVision.FullYearCalendar", "fields": {"day": "Wednesday", "date": str(year) + "-02-" + str(tup[0])}})
                            if tup[1] == 3:
                                blank.append({"model": "ClearVision.FullYearCalendar", "fields": {"day": "Thursday", "date": str(year) + "-02-" + str(tup[0])}})
                            if tup[1] == 4:
                                blank.append({"model": "ClearVision.FullYearCalendar", "fields": {"day": "Friday", "date": str(year) + "-02-" + str(tup[0])}})
                            if tup[1] == 5:
                                blank.append({"model": "ClearVision.FullYearCalendar", "fields": {"day": "Saturday", "date": str(year) + "-02-" + str(tup[0])}})
                            if tup[1] == 6:
                                blank.append({"model": "ClearVision.FullYearCalendar", "fields": {"day": "Sunday", "date": str(year) + "-02-" + str(tup[0])}})
        if months == 2:
            for i in c.yeardays2calendar(year, width=1)[months]:
                for j in i:
                    for tup in j:
                        if tup[0] != 0:
                            if tup[1] == 0:
                                blank.append({"model": "ClearVision.FullYearCalendar", "fields": {"day": "Monday", "date": str(year) + "-03-" + str(tup[0])}})
                            if tup[1] == 1:
                                blank.append({"model": "ClearVision.FullYearCalendar", "fields": {"day": "Tuesday", "date": str(year) + "-03-" + str(tup[0])}})
                            if tup[1] == 2:
                                blank.append({"model": "ClearVision.FullYearCalendar", "fields": {"day": "Wednesday", "date": str(year) + "-03-" + str(tup[0])}})
                            if tup[1] == 3:
                                blank.append({"model": "ClearVision.FullYearCalendar", "fields": {"day": "Thursday", "date": str(year) + "-03-" + str(tup[0])}})
                            if tup[1] == 4:
                                blank.append({"model": "ClearVision.FullYearCalendar", "fields": {"day": "Friday", "date": str(year) + "-03-" + str(tup[0])}})
                            if tup[1] == 5:
                                blank.append({"model": "ClearVision.FullYearCalendar", "fields": {"day": "Saturday", "date": str(year) + "-03-" + str(tup[0])}})
                            if tup[1] == 6:
                                blank.append({"model": "ClearVision.FullYearCalendar", "fields": {"day": "Sunday", "date": str(year) + "-03-" + str(tup[0])}})
        if months == 3:
            for i in c.yeardays2calendar(year, width=1)[months]:
                for j in i:
                    for tup in j:
                        if tup[0] != 0:
                            if tup[1] == 0:
                                blank.append({"model": "ClearVision.FullYearCalendar", "fields": {"day": "Monday", "date": str(year) + "-04-" + str(tup[0])}})
                            if tup[1] == 1:
                                blank.append({"model": "ClearVision.FullYearCalendar", "fields": {"day": "Tuesday", "date": str(year) + "-04-" + str(tup[0])}})
                            if tup[1] == 2:
                                blank.append({"model": "ClearVision.FullYearCalendar", "fields": {"day": "Wednesday", "date": str(year) + "-04-" + str(tup[0])}})
                            if tup[1] == 3:
                                blank.append({"model": "ClearVision.FullYearCalendar", "fields": {"day": "Thursday", "date": str(year) + "-04-" + str(tup[0])}})
                            if tup[1] == 4:
                                blank.append({"model": "ClearVision.FullYearCalendar", "fields": {"day": "Friday", "date": str(year) + "-04-" + str(tup[0])}})
                            if tup[1] == 5:
                                blank.append({"model": "ClearVision.FullYearCalendar", "fields": {"day": "Saturday", "date": str(year) + "-04-" + str(tup[0])}})
                            if tup[1] == 6:
                                blank.append({"model": "ClearVision.FullYearCalendar", "fields": {"day": "Sunday", "date": str(year) + "-04-" + str(tup[0])}})
        if months == 4:
            for i in c.yeardays2calendar(year, width=1)[months]:
                for j in i:
                    for tup in j:
                        if tup[0] != 0:
                            if tup[1] == 0:
                                blank.append({"model": "ClearVision.FullYearCalendar", "fields": {"day": "Monday", "date": str(year) + "-05-" + str(tup[0])}})
                            if tup[1] == 1:
                                blank.append({"model": "ClearVision.FullYearCalendar", "fields": {"day": "Tuesday", "date": str(year) + "-05-" + str(tup[0])}})
                            if tup[1] == 2:
                                blank.append({"model": "ClearVision.FullYearCalendar", "fields": {"day": "Wednesday", "date": str(year) + "-05-" + str(tup[0])}})
                            if tup[1] == 3:
                                blank.append({"model": "ClearVision.FullYearCalendar", "fields": {"day": "Thursday", "date": str(year) + "-05-" + str(tup[0])}})
                            if tup[1] == 4:
                                blank.append({"model": "ClearVision.FullYearCalendar", "fields": {"day": "Friday", "date": str(year) + "-05-" + str(tup[0])}})
                            if tup[1] == 5:
                                blank.append({"model": "ClearVision.FullYearCalendar", "fields": {"day": "Saturday", "date": str(year) + "-05-" + str(tup[0])}})
                            if tup[1] == 6:
                                blank.append({"model": "ClearVision.FullYearCalendar", "fields": {"day": "Sunday", "date": str(year) + "-05-" + str(tup[0])}})
        if months == 5:
            for i in c.yeardays2calendar(year, width=1)[months]:
                for j in i:
                    for tup in j:
                        if tup[0] != 0:
                            if tup[1] == 0:
                                blank.append({"model": "ClearVision.FullYearCalendar", "fields": {"day": "Monday", "date": str(year) + "-06-" + str(tup[0])}})
                            if tup[1] == 1:
                                blank.append({"model": "ClearVision.FullYearCalendar", "fields": {"day": "Tuesday", "date": str(year) + "-06-" + str(tup[0])}})
                            if tup[1] == 2:
                                blank.append({"model": "ClearVision.FullYearCalendar", "fields": {"day": "Wednesday", "date": str(year) + "-06-" + str(tup[0])}})
                            if tup[1] == 3:
                                blank.append({"model": "ClearVision.FullYearCalendar", "fields": {"day": "Thursday", "date": str(year) + "-06-" + str(tup[0])}})
                            if tup[1] == 4:
                                blank.append({"model": "ClearVision.FullYearCalendar", "fields": {"day": "Friday", "date": str(year) + "-06-" + str(tup[0])}})
                            if tup[1] == 5:
                                blank.append({"model": "ClearVision.FullYearCalendar", "fields": {"day": "Saturday", "date": str(year) + "-06-" + str(tup[0])}})
                            if tup[1] == 6:
                                blank.append({"model": "ClearVision.FullYearCalendar", "fields": {"day": "Sunday", "date": str(year) + "-06-" + str(tup[0])}})
        if months == 6:
            for i in c.yeardays2calendar(year, width=1)[months]:
                for j in i:
                    for tup in j:
                        if tup[0] != 0:
                            if tup[1] == 0:
                                blank.append({"model": "ClearVision.FullYearCalendar", "fields": {"day": "Monday", "date": str(year) + "-07-" + str(tup[0])}})
                            if tup[1] == 1:
                                blank.append({"model": "ClearVision.FullYearCalendar", "fields": {"day": "Tuesday", "date": str(year) + "-07-" + str(tup[0])}})
                            if tup[1] == 2:
                                blank.append({"model": "ClearVision.FullYearCalendar", "fields": {"day": "Wednesday", "date": str(year) + "-07-" + str(tup[0])}})
                            if tup[1] == 3:
                                blank.append({"model": "ClearVision.FullYearCalendar", "fields": {"day": "Thursday", "date": str(year) + "-07-" + str(tup[0])}})
                            if tup[1] == 4:
                                blank.append({"model": "ClearVision.FullYearCalendar", "fields": {"day": "Friday", "date": str(year) + "-07-" + str(tup[0])}})
                            if tup[1] == 5:
                                blank.append({"model": "ClearVision.FullYearCalendar", "fields": {"day": "Saturday", "date": str(year) + "-07-" + str(tup[0])}})
                            if tup[1] == 6:
                                blank.append({"model": "ClearVision.FullYearCalendar", "fields": {"day": "Sunday", "date": str(year) + "-07-" + str(tup[0])}})
        if months == 7:
            for i in c.yeardays2calendar(year, width=1)[months]:
                for j in i:
                    for tup in j:
                        if tup[0] != 0:
                            if tup[1] == 0:
                                blank.append({"model": "ClearVision.FullYearCalendar", "fields": {"day": "Monday", "date": str(year) + "-08-" + str(tup[0])}})
                            if tup[1] == 1:
                                blank.append({"model": "ClearVision.FullYearCalendar", "fields": {"day": "Tuesday", "date": str(year) + "-08-" + str(tup[0])}})
                            if tup[1] == 2:
                                blank.append({"model": "ClearVision.FullYearCalendar", "fields": {"day": "Wednesday", "date": str(year) + "-08-" + str(tup[0])}})
                            if tup[1] == 3:
                                blank.append({"model": "ClearVision.FullYearCalendar", "fields": {"day": "Thursday", "date": str(year) + "-08-" + str(tup[0])}})
                            if tup[1] == 4:
                                blank.append({"model": "ClearVision.FullYearCalendar", "fields": {"day": "Friday", "date": str(year) + "-08-" + str(tup[0])}})
                            if tup[1] == 5:
                                blank.append({"model": "ClearVision.FullYearCalendar", "fields": {"day": "Saturday", "date": str(year) + "-08-" + str(tup[0])}})
                            if tup[1] == 6:
                                blank.append({"model": "ClearVision.FullYearCalendar", "fields": {"day": "Sunday", "date": str(year) + "-08-" + str(tup[0])}})
        if months == 8:
            for i in c.yeardays2calendar(year, width=1)[months]:
                for j in i:
                    for tup in j:
                        if tup[0] != 0:
                            if tup[1] == 0:
                                blank.append({"model": "ClearVision.FullYearCalendar", "fields": {"day": "Monday", "date": str(year) + "-09-" + str(tup[0])}})
                            if tup[1] == 1:
                                blank.append({"model": "ClearVision.FullYearCalendar", "fields": {"day": "Tuesday", "date": str(year) + "-09-" + str(tup[0])}})
                            if tup[1] == 2:
                                blank.append({"model": "ClearVision.FullYearCalendar", "fields": {"day": "Wednesday", "date": str(year) + "-09-" + str(tup[0])}})
                            if tup[1] == 3:
                                blank.append({"model": "ClearVision.FullYearCalendar", "fields": {"day": "Thursday", "date": str(year) + "-09-" + str(tup[0])}})
                            if tup[1] == 4:
                                blank.append({"model": "ClearVision.FullYearCalendar", "fields": {"day": "Friday", "date": str(year) + "-09-" + str(tup[0])}})
                            if tup[1] == 5:
                                blank.append({"model": "ClearVision.FullYearCalendar", "fields": {"day": "Saturday", "date": str(year) + "-09-" + str(tup[0])}})
                            if tup[1] == 6:
                                blank.append({"model": "ClearVision.FullYearCalendar", "fields": {"day": "Sunday", "date": str(year) + "-09-" + str(tup[0])}})
        if months == 9:
            for i in c.yeardays2calendar(year, width=1)[months]:
                for j in i:
                    for tup in j:
                        if tup[0] != 0:
                            if tup[1] == 0:
                                blank.append({"model": "ClearVision.FullYearCalendar", "fields": {"day": "Monday", "date": str(year) + "-10-" + str(tup[0])}})
                            if tup[1] == 1:
                                blank.append({"model": "ClearVision.FullYearCalendar", "fields": {"day": "Tuesday", "date": str(year) + "-10-" + str(tup[0])}})
                            if tup[1] == 2:
                                blank.append({"model": "ClearVision.FullYearCalendar", "fields": {"day": "Wednesday", "date": str(year) + "-10-" + str(tup[0])}})
                            if tup[1] == 3:
                                blank.append({"model": "ClearVision.FullYearCalendar", "fields": {"day": "Thursday", "date": str(year) + "-10-" + str(tup[0])}})
                            if tup[1] == 4:
                                blank.append({"model": "ClearVision.FullYearCalendar", "fields": {"day": "Friday", "date": str(year) + "-10-" + str(tup[0])}})
                            if tup[1] == 5:
                                blank.append({"model": "ClearVision.FullYearCalendar", "fields": {"day": "Saturday", "date": str(year) + "-10-" + str(tup[0])}})
                            if tup[1] == 6:
                                blank.append({"model": "ClearVision.FullYearCalendar", "fields": {"day": "Sunday", "date": str(year) + "-10-" + str(tup[0])}})
        if months == 10:
            for i in c.yeardays2calendar(year, width=1)[months]:
                for j in i:
                    for tup in j:
                        if tup[0] != 0:
                            if tup[1] == 0:
                                blank.append({"model": "ClearVision.FullYearCalendar", "fields": {"day": "Monday", "date": str(year) + "-11-" + str(tup[0])}})
                            if tup[1] == 1:
                                blank.append({"model": "ClearVision.FullYearCalendar", "fields": {"day": "Tuesday", "date": str(year) + "-11-" + str(tup[0])}})
                            if tup[1] == 2:
                                blank.append({"model": "ClearVision.FullYearCalendar", "fields": {"day": "Wednesday", "date": str(year) + "-11-" + str(tup[0])}})
                            if tup[1] == 3:
                                blank.append({"model": "ClearVision.FullYearCalendar", "fields": {"day": "Thursday", "date": str(year) + "-11-" + str(tup[0])}})
                            if tup[1] == 4:
                                blank.append({"model": "ClearVision.FullYearCalendar", "fields": {"day": "Friday", "date": str(year) + "-11-" + str(tup[0])}})
                            if tup[1] == 5:
                                blank.append({"model": "ClearVision.FullYearCalendar", "fields": {"day": "Saturday", "date": str(year) + "-11-" + str(tup[0])}})
                            if tup[1] == 6:
                                blank.append({"model": "ClearVision.FullYearCalendar", "fields": {"day": "Sunday", "date": str(year) + "-11-" + str(tup[0])}})
        if months == 11:
            for i in c.yeardays2calendar(year, width=1)[months]:
                for j in i:
                    for tup in j:
                        if tup[0] != 0:
                            if tup[1] == 0:
                                blank.append({"model": "ClearVision.FullYearCalendar", "fields": {"day": "Monday", "date": str(year) + "-12-" + str(tup[0])}})
                            if tup[1] == 1:
                                blank.append({"model": "ClearVision.FullYearCalendar", "fields": {"day": "Tuesday", "date": str(year) + "-12-" + str(tup[0])}})
                            if tup[1] == 2:
                                blank.append({"model": "ClearVision.FullYearCalendar", "fields": {"day": "Wednesday", "date": str(year) + "-12-" + str(tup[0])}})
                            if tup[1] == 3:
                                blank.append({"model": "ClearVision.FullYearCalendar", "fields": {"day": "Thursday", "date": str(year) + "-12-" + str(tup[0])}})
                            if tup[1] == 4:
                                blank.append({"model": "ClearVision.FullYearCalendar", "fields": {"day": "Friday", "date": str(year) + "-12-" + str(tup[0])}})
                            if tup[1] == 5:
                                blank.append({"model": "ClearVision.FullYearCalendar", "fields": {"day": "Saturday", "date": str(year) + "-12-" + str(tup[0])}})
                            if tup[1] == 6:
                                blank.append({"model": "ClearVision.FullYearCalendar", "fields": {"day": "Sunday", "date": str(year) + "-12-" + str(tup[0])}})

dump.write(str(blank).replace("'", "\""))
