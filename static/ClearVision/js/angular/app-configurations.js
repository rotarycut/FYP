var appConfig = angular.module('app.config', []);

/*appConfig.run('$anchorScroll', function($anchorScroll){
 $anchorScroll.yOffset = 50;
 });*/

appConfig.controller('configCtrl',
    function ($scope, $http, $modal, $log, $anchorScroll, $location, $timeout, $rootScope,
              getDoctorsService, getClinicsService, getAppointmentTypesColorService, showNotificationsSvc,
              getCalendarTimeRangeIntervalService) {

        $scope.operatingHoursPopover = [];
        $scope.appointmentTypesPopover = [];
        $scope.doctorsNamePopover = [];
        $scope.doctorsRemovePopover = [];
        $scope.doctorApptTypePopover = [];
        $scope.editApptTypeNamePopover = [];
        $scope.appointmentInfoPopover = [];
        $scope.doctorsApptTypeRemovePopover = [];
        $scope.appointmentTypeRemovePopover = [];

        $scope.dynamicPopover = {
            editStartTime: {
                isOpen: false,
                templateUrl: 'editStartHourTemplate.html',
                open: function () {
                    $scope.dynamicPopover.editEndTime.isOpen = false;
                    $scope.dynamicPopover.editStartTime.isOpen = true;
                },
                close: function () {
                    $scope.dynamicPopover.editStartTime.isOpen = false;
                }
            },
            editEndTime: {
                isOpen: false,
                templateUrl: 'editEndHourTemplate.html',
                open: function () {
                    $scope.dynamicPopover.editStartTime.isOpen = false;
                    $scope.dynamicPopover.editEndTime.isOpen = true;
                },
                close: function () {
                    $scope.dynamicPopover.editEndTime.isOpen = false;
                }
            },
            editHeatmap: {
                isOpen: false,
                templateUrl: 'editHeatmapRngTemplate.html',
                editHeatmapRng: function (range) {
                    $scope.heatmapNoOfAppts = range;
                },
                open: function () {
                    $scope.dynamicPopover.editHeatmap.isOpen = true;
                },
                close: function () {
                    $scope.dynamicPopover.editHeatmap.isOpen = false;
                }
            },
            editApptTimeslot: {
                isOpen: false,
                templateUrl: 'editApptTimeslotTemplate.html',
                open: function () {
                    $scope.dynamicPopover.editApptTimeslot.isOpen = true;
                },
                close: function () {
                    $scope.dynamicPopover.editApptTimeslot.isOpen = false;
                }
            },
            editSMSScheduledTime: {
                isOpen: false,
                templateUrl: 'editSMSScheduledTimeTemplate.html',
                open: function () {
                    $scope.dynamicPopover.editSMSScheduledTime.isOpen = true;
                },
                close: function () {
                    $scope.dynamicPopover.editSMSScheduledTime.isOpen = false;
                }
            },
            editSMSScheduledDay: {
                isOpen: false,
                templateUrl: 'editSMSScheduledDayTemplate.html',
                open: function () {
                    $scope.dynamicPopover.editSMSScheduledDay.isOpen = true;
                },
                close: function () {
                    $scope.dynamicPopover.editSMSScheduledDay.isOpen = false;
                }
            },
            editSwapReminderHour: {
                isOpen: false,
                templateUrl: 'editSwapReminderHourTemplate.html',
                open: function () {
                    $scope.dynamicPopover.editSwapReminderHour.isOpen = true;
                },
                close: function () {
                    $scope.dynamicPopover.editSwapReminderHour.isOpen = false;
                }
            },
            removeApptTypeFromDoctor: {
                isOpen: false,
                templateUrl: 'removeAppointmentTypeFromDoctor.html',
                open: function () {
                    $scope.dynamicPopover.removeApptTypeFromDoctor.isOpen = true;
                },
                close: function () {
                    $scope.dynamicPopover.editSwapReminderHour.isOpen = false;
                }
            }
        };

        $scope.listOfAvailableTiming = ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00"];
        $scope.listOfSmsAvailableHour = ["00:00", "01:00", "02:00", "03:00", "04:00", "05:00", "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"];
        $scope.listOfSmsAvailableMinute = ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "50", "51", "52", "53", "54", "55", "56", "57", "58", "59", "60"];
        $scope.showAddNewRngBtn = false;
        $scope.showAddNewDocBtn = true;
        $scope.showDocConfigForm = true;
        $scope.showDocApptConfigForm = false;
        $scope.showApptColorConfigForm = true;
        $scope.showReminderSMSConfigForm = true;
        $scope.showApptInfoConfigForm = true;
        $scope.showAddNewTypeBtn = true;
        $scope.docConfigActiveTab = "doctors-tab-active";
        $scope.calConfigActiveTab = "appt-color-tab-active";
        $scope.typeConfigActiveTab = "type-info-tab-active";
        $scope.SMSConfigActiveTab = "remindersms-tab-active";
        $scope.listOfOperants = ["=", "<=", ">=", "<", ">"];
        $scope.listOfDoctors = [];


        $scope.listOfHeatmapRange = [
            {
                range: "= 1",
                color: "#00B499"
            },

            {
                range: "= 2 - 3",
                color: "#FF9966"
            },

            {
                range: ">= 4",
                color: "#EA525F"
            }
        ];

        $scope.noOfDocs = $scope.listOfDoctors.length;

        $scope.showDocView = function () {
            $scope.showDocConfigForm = true;
            $scope.showDocApptConfigForm = false;
            $scope.docConfigActiveTab = "doctors-tab-active";
            $scope.showAddNewDocBtn = true;
        };

        $scope.showDocApptView = function () {
            $scope.showDocConfigForm = false;
            $scope.showDocApptConfigForm = true;
            $scope.docConfigActiveTab = "doc-appt-tab-active";
            $scope.showAddNewDocBtn = false;
        };

        $scope.showApptColorView = function () {
            $scope.showApptColorConfigForm = true;
            $scope.showHeatmapColorConfigForm = false;
            $scope.showOperatingHrsConfigForm = false;
            $scope.calConfigActiveTab = "appt-color-tab-active"
            $scope.showAddNewRngBtn = false;
        };

        $scope.showHeatmapView = function () {
            $scope.showApptColorConfigForm = false;
            $scope.showHeatmapColorConfigForm = true;
            $scope.showOperatingHrsConfigForm = false;
            $scope.calConfigActiveTab = "heatmap-color-tab-active"
            $scope.showAddNewRngBtn = true;
        };
        $scope.showOptHrsView = function () {
            $scope.showApptColorConfigForm = false;
            $scope.showHeatmapColorConfigForm = false;
            $scope.showOperatingHrsConfigForm = true;
            $scope.calConfigActiveTab = "opt-hrs-tab-active"
            $scope.showAddNewRngBtn = false;
        };

        $scope.showReminderSMSView = function () {
            $scope.showReminderSMSConfigForm = true;
            $scope.shownotifSMSConfigForm = false;
            $scope.SMSConfigActiveTab = "remindersms-tab-active";
        };

        $scope.showSwapSMSView = function () {
            $scope.showReminderSMSConfigForm = false;
            $scope.shownotifSMSConfigForm = true;
            $scope.SMSConfigActiveTab = "swapsms-tab-active";
        };

        $scope.showTypeInfoView = function () {
            $scope.showApptInfoConfigForm = true;
            $scope.showApptTimingConfigForm = false;
            $scope.typeConfigActiveTab = "type-info-tab-active";
            $scope.showAddNewTypeBtn = true;
        }

        $scope.showTypeTimingView = function () {
            $scope.showApptInfoConfigForm = false;
            $scope.showApptTimingConfigForm = true;
            $scope.typeConfigActiveTab = "type-timing-tab-active";
            $scope.showAddNewTypeBtn = false;
        };

        $scope.openCreateDoctorModal = function (size) {

            var modalInstance = $modal.open({
                animation: true,
                templateUrl: 'createDoctorModal.html',
                controller: 'CreateDoctorModalCtrl',
                size: size
            });
        };

        $scope.openAddNewApptTypeModal = function (size) {

            var modalInstance = $modal.open({
                animation: true,
                templateUrl: 'myAddNewApptTypeModalTemplate.html',
                controller: 'AppConfigModalInstanceCtrl',
                size: size,
                resolve: {
                    docInfoFormVisibility: function () {
                        return '';
                    },
                    appointmentsTime: function () {
                        return '';
                    },
                    doctorId: function () {
                        return '';
                    }
                }
            });
        };

        $scope.openAssignNewApptTypeModal = function (doctorId) {

            var modalInstance = $modal.open({
                animation: true,
                templateUrl: 'assignNewTypeModalTemplate.html',
                controller: 'AppConfigModalInstanceCtrl',
                resolve: {
                    docInfoFormVisibility: function () {
                        return '';
                    },
                    appointmentsTime: function () {
                        return $scope.listOfTimeslots;
                    },
                    doctorId: function () {
                        return doctorId;
                    }
                }
            });
        };

        //$scope.getOperatingHours();
        $scope.listOfClinics = [];
        $scope.listOfDoctors = [];

        /* function to get all clinics */
        $scope.getClinics = function () {

            getClinicsService.getClinics()
                .then(function (listOfClinics) {

                    // only want mt e clinic
                    $scope.listOfClinics = listOfClinics[0];

                    // push all the operating hours  popovers based on day count
                    angular.forEach(listOfClinics[0].Days, function () {

                        $scope.operatingHoursPopover.push({
                            editOptHr: {
                                isOpen: false,
                                templateUrl: 'editOptHourTemplate.html',
                                open: function (index) {
                                    $scope.currentIndex = index;
                                    $scope.operatingHoursPopover[index].editOptHr.isOpen = true;
                                },
                                close: function (index) {
                                    $scope.operatingHoursPopover[index].editOptHr.isOpen = false;
                                }
                            }
                        });
                    });

                }, function (data) {
                    $log.error("Failed to retrieve clinics");
                });

        };

        /* function to get all doctors */
        $scope.getDoctors = function () {

            // prepare an empty doctor popover array
            var doctorsNamePopover = [];
            var doctorsRemovePopover = [];
            var doctorsApptTypeRemovePopover = [];

            getDoctorsService.getDoctors()
                .then(function (listOfDoctors) {
                    $scope.listOfDoctors = listOfDoctors;

                    // push all the doctors popovers based on doctor count
                    angular.forEach(listOfDoctors, function (doctor) {

                        doctorsNamePopover.push({
                            editDoctor: {
                                isOpen: false,
                                templateUrl: 'editDocNameTemplate.html',
                                open: function (index, doctorId) {
                                    var idx = 0;
                                    // ensure that all doctor name popovers are closed on select
                                    angular.forEach($scope.listOfDoctors, function () {
                                        $scope.doctorsNamePopover[idx].editDoctor.isOpen = false;
                                        $scope.doctorsRemovePopover[idx].removeDoctor.isOpen = false;
                                        idx++;
                                    });
                                    // set the current index chosen
                                    $scope.doctorNameIndex = index;
                                    $scope.doctorNameId = doctorId;
                                    $scope.doctorsNamePopover[index].editDoctor.isOpen = true;
                                },
                                close: function (index) {
                                    $scope.doctorsNamePopover[index].editDoctor.isOpen = false;
                                }
                            }
                        });

                        doctorsRemovePopover.push({
                            removeDoctor: {
                                isOpen: false,
                                templateUrl: 'removeDocTemplate.html',
                                open: function (index, doctorId) {
                                    var idx = 0;
                                    // ensure that all doctor remove popovers are closed on select
                                    angular.forEach($scope.listOfDoctors, function () {
                                        $scope.doctorsRemovePopover[idx].removeDoctor.isOpen = false;
                                        $scope.doctorsNamePopover[idx].editDoctor.isOpen = false;
                                        idx++;
                                    });
                                    // set the current index chosen
                                    $scope.doctorRemoveIndex = index;
                                    $scope.doctorRemoveId = doctorId;
                                    $scope.doctorsRemovePopover[index].removeDoctor.isOpen = true;
                                    //check if any future appointments exist
                                    $http.get('/Clearvision/_api/CheckFutureNumberOfAppointmentsUnderDoctor/?doctorID=' + doctorId)
                                        .success(function (numberOfFutureAppointment) {
                                            if (numberOfFutureAppointment > 0) {
                                                $scope.showWarning = true;
                                                $scope.showPassword = false;
                                            } else {
                                                $scope.showWarning = false;
                                                $scope.showPassword = true;
                                            }
                                        });
                                },
                                close: function (index) {
                                    $scope.doctorsRemovePopover[index].removeDoctor.isOpen = false;
                                }
                            }
                        });

                        var inputArr = [];

                        angular.forEach(doctor.apptType, function () {

                            inputArr.push({
                                removeApptTypeFromDoctor: {
                                    isOpen: false,
                                    templateUrl: 'removeAppointmentTypeFromDoctor.html',
                                    open: function (parentIndex, childIndex, doctorId, apptTypeId) {

                                        $scope.removeDrApptTypeParentIdx = parentIndex;
                                        $scope.removeDrApptTypeIdx = childIndex;
                                        $scope.doctorRemoveId = doctorId;
                                        $scope.appointmentTypeId = apptTypeId;

                                        // ensure that all doctor appointment type remove popovers are closed on select
                                        for (i = 0; i < $scope.listOfDoctors.length; i++) {
                                            var doctor = $scope.listOfDoctors[i];

                                            for (j = 0; j < doctor.apptType.length; j++) {

                                                $scope.doctorsApptTypeRemovePopover[i][j].removeApptTypeFromDoctor.isOpen = false;
                                            }
                                        }

                                        $scope.doctorsApptTypeRemovePopover[parentIndex][childIndex].removeApptTypeFromDoctor.isOpen = true;

                                        //check if any future appointments exist
                                        $http.get('/Clearvision/_api/CheckApptTypeUnderDoctor/?doctorID=' + doctorId + '&apptTypeID=' + apptTypeId)
                                            .success(function (numberOfFutureAppointment) {

                                                console.log(numberOfFutureAppointment);
                                                if (numberOfFutureAppointment > 0) {
                                                    $scope.showWarningRemoveDocApptType = true;
                                                    $scope.showPasswordRemoveDocApptType = false;
                                                } else {
                                                    $scope.showWarningRemoveDocApptType = false;
                                                    $scope.showPasswordRemoveDocApptType = true;
                                                }
                                            });
                                    },
                                    close: function (parentIndex, childIndex) {

                                        $scope.doctorsApptTypeRemovePopover[parentIndex][childIndex].removeApptTypeFromDoctor.isOpen = false;
                                    }
                                }

                            });
                        });

                        doctorsApptTypeRemovePopover.push(inputArr);

                    });

                    // assign the popover array to the scope
                    $scope.doctorsNamePopover = doctorsNamePopover;
                    $scope.doctorsRemovePopover = doctorsRemovePopover;
                    $scope.doctorsApptTypeRemovePopover = doctorsApptTypeRemovePopover;

                }, function (error) {

                    $log.error("Failed to retrieve doctors");
                });

        };

        /* function to get all appointment types */
        $scope.getAppointmentTypes = function () {

            // prepare an empty appointment type popover array
            var appointmentTypesPopover = [];
            var appointmentInfoPopover = [];
            var appointmentTypeRemovePopover = [];

            getAppointmentTypesColorService.getAppointmentTypesColor()
                .then(function (listOfAppointmentTypes) {
                    $scope.listOfApptTypes = listOfAppointmentTypes;

                    // push all the appointment type popovers based on type count
                    angular.forEach(listOfAppointmentTypes, function () {

                        appointmentTypesPopover.push({
                            editAppointmentColor: {
                                isOpen: false,
                                templateUrl: 'editApptTypeColorTemplate.html',
                                open: function (index) {
                                    var idx = 0;
                                    // ensure that all appointment type popovers are closed on select
                                    angular.forEach($scope.listOfApptTypes, function () {
                                        $scope.appointmentTypesPopover[idx].editAppointmentColor.isOpen = false;
                                        idx++;
                                    });
                                    // set the current index chosen
                                    $scope.appointmentIndex = index;
                                    $scope.selectedHex = $scope.listOfApptTypes[index].hex;
                                    $scope.appointmentTypesPopover[index].editAppointmentColor.isOpen = true;
                                },
                                close: function (index) {
                                    $scope.appointmentTypesPopover[index].editAppointmentColor.isOpen = false;
                                }
                            }
                        });

                        appointmentInfoPopover.push({
                            editApptTypeNamePopover: {
                                isOpen: false,
                                templateUrl: 'editApptTypeNameTemplate.html',
                                open: function (index, apptTypeId) {

                                    $scope.editAppointmentTypeNameIndex = index;
                                    $scope.removeApptTypeId = apptTypeId;

                                    var idx = 0;
                                    // ensure that all appointment type popovers are closed on select
                                    angular.forEach($scope.listOfApptTypes, function () {
                                        $scope.appointmentInfoPopover[idx].editApptTypeNamePopover.isOpen = false;
                                        idx++;
                                    });

                                    $scope.appointmentInfoPopover[index].editApptTypeNamePopover.isOpen = true;

                                },
                                close: function (index) {
                                    $scope.appointmentInfoPopover[index].editApptTypeNamePopover.isOpen = false;
                                }
                            }
                        });

                        appointmentTypeRemovePopover.push({
                            removeApptTypePopover: {
                                isOpen: false,
                                templateUrl: 'removeApptTypeTemplate.html',
                                open: function (index, apptTypeId) {

                                    $scope.removeApptIndex = index;
                                    $scope.rmvApptTypeId = apptTypeId;

                                    var idx = 0;
                                    // ensure that all appointment type popovers are closed on select
                                    angular.forEach($scope.listOfApptTypes, function () {
                                        $scope.appointmentTypeRemovePopover[idx].removeApptTypePopover.isOpen = false;
                                        idx++;
                                    });

                                    $scope.appointmentTypeRemovePopover[index].removeApptTypePopover.isOpen = true;

                                    // check if the appointment is of type pre evaluation of surgery
                                    if (apptTypeId)

                                    //check if any future appointments exist
                                        $http.get('/Clearvision/_api/CheckApptTypeInGeneral/?apptTypeID=' + apptTypeId)
                                            .success(function (numberOfFutureAppointment) {

                                                if (numberOfFutureAppointment > 0) {
                                                    $scope.showWarningRemoveApptType = true;
                                                    $scope.showPasswordRemoveApptType = false;
                                                } else {
                                                    $scope.showWarningRemoveApptType = false;
                                                    $scope.showPasswordRemoveApptType = true;
                                                }
                                            });

                                },
                                close: function (index) {
                                    $scope.appointmentTypeRemovePopover[index].removeApptTypePopover.isOpen = false;
                                }
                            }
                        });

                    });

                    // assign the popover array to the scope
                    $scope.appointmentTypesPopover = appointmentTypesPopover;
                    $scope.appointmentInfoPopover = appointmentInfoPopover;
                    $scope.appointmentTypeRemovePopover = appointmentTypeRemovePopover;

                }, function (data) {
                    $log.error("Failed to retrieve appointment types");
                });

        };

        /* function to get all time range */
        $scope.getCalendarTimeRange = function () {

            $http.get('/Clearvision/_api/ViewCalendarTimeRange/1')
                .success(function (timeRange) {
                    $scope.originalStartTime = timeRange.startTime;
                    $scope.originalEndTime = timeRange.endTime;
                })
                .error(function (data) {
                    $log.error("Failed to retrieve calendar time range");
                });

        };

        /* function to get non color appointment types */
        $scope.getNonColorApptTypes = function () {
            $http.get('/Clearvision/_api/ViewAllApptTypes/')
                .success(function (appointmentTypes) {
                    $scope.appointmentTypes = appointmentTypes;
                });
        };
        $scope.getNonColorApptTypes();

        /* function to get doctor appointment timings */
        $scope.getDoctorApptTimings = function (doctorId, appointmentId) {

            // only sends if both doctorId and appointmentId are selected
            if (doctorId == undefined || appointmentId == undefined) {
                return;
            } else {

                // prepare an empty doctorApptType popover array
                var doctorApptTypePopover = [];

                var req = {
                    method: 'GET',
                    url: '/Clearvision/_api/DoctorTimeSlot/?doctorId=' + doctorId + '&apptType=' + appointmentId,
                    headers: {'Content-Type': 'application/json'}
                };
                $http(req)
                    .success(function (doctorTimings) {
                        $scope.doctorToUpdateSlots = doctorId;
                        $scope.apptTypeToUpdateSlots = appointmentId;
                        $scope.listOfDoctorTimings = doctorTimings;
                        $scope.listOfDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

                        // push all the appointment type popovers based on type count
                        angular.forEach(doctorTimings, function () {

                            doctorApptTypePopover.push({
                                editApptTimeslot: {
                                    isOpen: false,
                                    templateUrl: 'editApptTimeslotTemplate.html',
                                    open: function (index) {
                                        var idx = 0;
                                        // ensure that all time slot  popovers are closed on select
                                        angular.forEach($scope.listOfDoctorTimings, function () {
                                            $scope.doctorApptTypePopover[idx].editApptTimeslot.isOpen = false;
                                            idx++;
                                        });

                                        // set the active time slots & prepare array to be submitted to backend
                                        $scope.getCalendarTimeIntervals();
                                        $scope.activeTimeSlotIntervals = $scope.timeSlotIntervals.slice();
                                        $scope.listOfEditedTimeSlots = [];
                                        var idx = 0;

                                        angular.forEach($scope.activeTimeSlotIntervals, function (slot) {

                                            var timeSlotExist = $scope.listOfDoctorTimings[index].indexOf(slot.time);
                                            if (timeSlotExist != -1) {
                                                $scope.activeTimeSlotIntervals[idx].active = true;
                                                $scope.listOfEditedTimeSlots.push(slot.time);
                                            }

                                            idx++;
                                        });

                                        // set the current index chosen
                                        $scope.dayTimeSlots = $scope.listOfDays[index];
                                        $scope.timeSlotIndex = index;
                                        $scope.doctorApptTypePopover[index].editApptTimeslot.isOpen = true;

                                    },
                                    close: function (index) {
                                        $scope.doctorApptTypePopover[index].editApptTimeslot.isOpen = false;
                                    }
                                }
                            });
                        });

                        // assign the popover array to the scope
                        $scope.doctorApptTypePopover = doctorApptTypePopover;
                        $scope.showEditTimeSlots = true;

                        // get the calendar time slot intervals
                        $scope.getCalendarTimeIntervals();
                    })
                    .error(function (error) {

                        $scope.apptTypeSettingsType = "";
                        $scope.showEditTimeSlots = false;
                    });
            }
        };

        /* function to get sms settings */
        $scope.getSmsSettings = function () {

            $http.get('/Clearvision/_api/ViewSMSApptReminder/1/')
                .success(function (smsSetting) {
                    $scope.smsSetting = smsSetting;
                })
        };
        $scope.getSmsSettings();

        /* function to update appointment type color */
        $scope.updateAppointmentTypeColor = function (isValid, index, hexValue) {

            // only sends patch if form is valid
            if (isValid) {

                var req = {
                    method: 'PATCH',
                    url: '/Clearvision/_api/ViewCalendarColorSettings/' + index,
                    headers: {'Content-Type': 'application/json'},
                    data: {"hex": hexValue}
                };

                $http(req)
                    .success(function () {
                        showNotificationsSvc.notifySuccessTemplate('Color successfully updated');
                        $scope.getAppointmentTypes();
                    })
                    .error(function (data) {
                        showNotificationsSvc.notifyErrorTemplate('Error, please try again');
                    });

            }
        };

        /* function to update doctor name */
        $scope.updateDoctorName = function (isValid, doctorId, doctorName) {

            // only sends patch if form is valid
            if (isValid) {

                var req = {
                    method: 'PATCH',
                    url: '/Clearvision/_api/doctors/' + doctorId,
                    headers: {'Content-Type': 'application/json'},
                    data: {"name": doctorName}
                };

                $http(req)
                    .success(function () {
                        showNotificationsSvc.notifySuccessTemplate('Doctor name successfully updated');
                        $scope.getDoctors();
                    })
                    .error(function (data) {
                        showNotificationsSvc.notifyErrorTemplate('Error, please try again');
                    });

            }
        };

        /* function to remove doctor */
        $scope.removeDoctor = function (isValid, doctorId, password) {

            // only sends patch if form is valid
            if (isValid) {

                var req = {
                    method: 'DELETE',
                    url: '/Clearvision/_api/doctors/' + doctorId,
                    headers: {'Content-Type': 'application/json'},
                    data: {
                        "password": password
                    }
                };

                $http(req)
                    .success(function (response) {

                        if (response == 'Invalid Admin Password!') {
                            $scope.showIncorrectPw = true;
                            $timeout(function () {
                                $scope.showIncorrectPw = false;
                            }, 2000);

                        } else {
                            showNotificationsSvc.notifySuccessTemplate('Doctor removed successfully');
                            $scope.getDoctors();
                        }
                    })
                    .error(function () {
                        showNotificationsSvc.notifyErrorTemplate('Error, please try again');
                    });

            }
        };

        /* function to update calendar start time */
        $scope.updateCalendarStartTime = function (isValid, startTime) {

            // only sends patch if form is valid
            if (isValid) {

                var req = {
                    method: 'PATCH',
                    url: '/Clearvision/_api/ViewCalendarTimeRange/1',
                    headers: {'Content-Type': 'application/json'},
                    data: {
                        "startTime": startTime
                    }
                };

                $http(req)
                    .success(function (response) {

                        showNotificationsSvc.notifySuccessTemplate('Start time updated successfully');
                        $scope.dynamicPopover.editStartTime.isOpen = false;
                        $scope.getCalendarTimeRange();
                    })
                    .error(function () {
                        showNotificationsSvc.notifyErrorTemplate('Error, please try again');
                    });

            }
        };

        /* function to update calendar end time */
        $scope.updateCalendarEndTime = function (isValid, endTime) {

            // only sends patch if form is valid
            if (isValid) {

                var req = {
                    method: 'PATCH',
                    url: '/Clearvision/_api/ViewCalendarTimeRange/1',
                    headers: {'Content-Type': 'application/json'},
                    data: {
                        "endTime": endTime
                    }
                };

                $http(req)
                    .success(function (response) {

                        showNotificationsSvc.notifySuccessTemplate('End time updated successfully');
                        $scope.dynamicPopover.editEndTime.isOpen = false;
                        $scope.getCalendarTimeRange();
                    })
                    .error(function () {
                        showNotificationsSvc.notifyErrorTemplate('Error, please try again');
                    });

            }
        };

        /* function to send email when doctor to be removed has future dated appointments */
        $scope.sendEmail = function (isValid, doctorId, emailAddress) {

            // only sends patch if form is valid
            if (isValid) {

                var req = {
                    method: 'POST',
                    url: '/Clearvision/_api/CheckFutureNumberOfAppointmentsUnderDoctor/',
                    headers: {'Content-Type': 'application/json'},
                    data: {
                        "emailAddress": emailAddress,
                        "doctorID": doctorId
                    }
                };

                $rootScope.spinner = {active: true};

                $http(req)
                    .success(function (response) {
                        $rootScope.spinner = {active: false};
                        showNotificationsSvc.notifySuccessTemplate('Email sent successfully');
                        $scope.getDoctors();
                    })
                    .error(function () {
                        $rootScope.spinner = {active: false};
                        showNotificationsSvc.notifyErrorTemplate('Error, please try again');
                    });

            }
        };

        /* function to update sms settings */
        $scope.updateSmsSetting = function (isValid, day, hour, minute) {

            hour = hour.substring(0, hour.indexOf(":"));

            // only sends patch if form is valid
            if (isValid) {

                var req = {
                    method: 'PATCH',
                    url: '/Clearvision/_api/ViewSMSApptReminder/1/',
                    headers: {'Content-Type': 'application/json'},
                    data: {
                        "days": day,
                        "timeHour": hour,
                        "timeMinute": minute
                    }
                };

                $http(req)
                    .success(function (response) {

                        $scope.dynamicPopover.editSMSScheduledTime.close();
                        $scope.getSmsSettings();
                        showNotificationsSvc.notifySuccessTemplate('SMS setting updated successfully');

                    })
                    .error(function () {
                        showNotificationsSvc.notifyErrorTemplate('Error, please try again');
                    });

            }
        };

        /* function to delete appointment type from doctor */
        $scope.deleteAppointmentTypeFromDoctor = function (isValid, doctorId, apptTypeId) {

            hour = hour.substring(0, hour.indexOf(":"));

            // only sends patch if form is valid
            if (isValid) {

                var req = {
                    method: 'PATCH',
                    url: '/Clearvision/_api/ViewSMSApptReminder/1/',
                    headers: {'Content-Type': 'application/json'},
                    data: {
                        "days": day,
                        "timeHour": hour,
                        "timeMinute": minute
                    }
                };

                $http(req)
                    .success(function (response) {

                        showNotificationsSvc.notifySuccessTemplate('SMS setting updated successfully');

                    })
                    .error(function () {
                        showNotificationsSvc.notifyErrorTemplate('Error, please try again');
                    });

            }
        };

        /* function to send email when doctor appointment type to be removed has future dated appointments */
        $scope.sendEmailRemoveDocApptType = function (isValid, doctorId, emailAddress, apptTypeId) {

            // only sends patch if form is valid
            if (isValid) {

                var req = {
                    method: 'POST',
                    url: '/Clearvision/_api/CheckApptTypeUnderDoctor/',
                    headers: {'Content-Type': 'application/json'},
                    data: {
                        "emailAddress": emailAddress,
                        "doctorID": doctorId,
                        "apptTypeID": apptTypeId
                    }
                };

                console.log({
                    "emailAddress": emailAddress,
                    "doctorID": doctorId,
                    "apptTypeID": apptTypeId
                });

                $http(req)
                    .success(function (response) {

                        showNotificationsSvc.notifySuccessTemplate('Email sent successfully');
                        $scope.getDoctors();
                    })
                    .error(function () {
                        showNotificationsSvc.notifyErrorTemplate('Error, please try again');
                    });

            }
        };

        /* function to remove doctor appointment type from doctor */
        $scope.removeDocApptType = function (isValid, doctorId, apptTypeId, password) {

            // only sends patch if form is valid
            if (isValid) {

                var req = {
                    method: 'DELETE',
                    url: '/Clearvision/_api/EditDoctorAppointmentTypes/0',
                    headers: {'Content-Type': 'application/json'},
                    data: {
                        "doctorID": doctorId,
                        "apptTypeID": apptTypeId,
                        "password": password
                    }
                };

                $http(req)
                    .success(function (response) {

                        if (response == 'Invalid Admin Password!') {
                            $scope.showIncorrectPw = true;
                            $timeout(function () {
                                $scope.showIncorrectPw = false;
                            }, 2000);

                        } else {
                            showNotificationsSvc.notifySuccessTemplate('Remove doctor appointment type successfully');
                            $scope.getDoctors();
                        }

                    })
                    .error(function () {
                        showNotificationsSvc.notifyErrorTemplate('Error, please try again');
                    });
            }
        };

        /* function to update appointment type name */
        $scope.updateApptTypeName = function (isValid, apptTypeName, apptTypeId) {

            // only sends patch if form is valid
            if (isValid) {

                var req = {
                    method: 'PATCH',
                    url: '/Clearvision/_api/ViewAllApptTypes/' + apptTypeId,
                    headers: {'Content-Type': 'application/json'},
                    data: {
                        "name": apptTypeName
                    }
                };

                $http(req)
                    .success(function (response) {

                        showNotificationsSvc.notifySuccessTemplate('Update appointment type name successfully');
                        $scope.getAppointmentTypes();
                    })
                    .error(function () {
                        showNotificationsSvc.notifyErrorTemplate('Error, please try again');
                    });
            }
        };

        /* function to send email when doctor appointment type to be removed has future dated appointments */
        $scope.sendEmailRemoveApptType = function (isValid, emailAddress, apptTypeId) {

            // only sends patch if form is valid
            if (isValid) {

                var req = {
                    method: 'POST',
                    url: '/Clearvision/_api/CheckApptTypeInGeneral/',
                    headers: {'Content-Type': 'application/json'},
                    data: {
                        "emailAddress": emailAddress,
                        "apptTypeID": apptTypeId
                    }
                };

                $http(req)
                    .success(function (response) {

                        showNotificationsSvc.notifySuccessTemplate('Email sent successfully');
                        $scope.getAppointmentTypes();
                    })
                    .error(function () {
                        showNotificationsSvc.notifyErrorTemplate('Error, please try again');
                    });

            }
        };

        /* function to remove appointment type */
        $scope.removeApptTypeInGeneral = function (isValid, apptTypeId, password) {

            // only sends patch if form is valid
            if (isValid) {

                var req = {
                    method: 'DELETE',
                    url: '/Clearvision/_api/ViewAllApptTypes/' + apptTypeId,
                    headers: {'Content-Type': 'application/json'},
                    data: {
                        "password": password
                    }
                };

                $http(req)
                    .success(function (response) {

                        console.log(response);
                        if (response == 'Invalid Admin Password!') {

                            $scope.showIncorrectPw = true;

                            $timeout(function () {
                                $scope.showIncorrectPw = false;
                            }, 2000);

                        } else {
                            showNotificationsSvc.notifySuccessTemplate('Appointment type removed successfully');
                            $scope.getAppointmentTypes();
                        }

                    })
                    .error(function () {
                        showNotificationsSvc.notifyErrorTemplate('Error, please try again');
                    });

            }
        };

        /* function to get list of doctor based on appointment type chosen */
        $scope.getDoctorAppointmentTypes = function (doctorId) {

            $scope.disableApptTypeSettings = true;

            $http.get('/Clearvision/_api/ApptTypeDoctors/?doctorID=' + doctorId)
                .success(function (listOfAppointmentTypes) {

                    $scope.appointmentTypes = listOfAppointmentTypes;
                    $scope.showEditTimeSlots = false;
                    $scope.disableApptTypeSettings = false;

                }).error(function (error) {

                    $scope.disableApptTypeSettings = false;
                })
        };

        /* function to get time slots in thirty minute intervals for edit doctor time slots */
        $scope.getCalendarTimeIntervals = function () {

            getCalendarTimeRangeIntervalService.getCalendarTimeRangeInterval()
                .then(function (timeSlotIntervals) {

                    var preArr = [];

                    angular.forEach(timeSlotIntervals, function (slot) {

                        var preObj = {};
                        preObj.time = slot;
                        preObj.active = false;
                        preArr.push(preObj);
                    });

                    $scope.timeSlotIntervals = preArr;

                }, function (error) {
                    $log("Error getting calendar time range interval");
                });
        };

        /* function to add remove time slot for edit doctor time slots */
        $scope.addRemoveUpdatedTimeSlot = function (timeSlot) {

            var timeSlotExist = $scope.listOfEditedTimeSlots.indexOf(timeSlot);
            if (timeSlotExist == -1) {
                $scope.listOfEditedTimeSlots.push(timeSlot);
            } else {
                var idx = 0;
                angular.forEach($scope.listOfEditedTimeSlots, function (slot) {
                    if (slot == timeSlot) {
                        $scope.listOfEditedTimeSlots.splice(idx, 1);
                    }
                    idx++;
                })
            }
        };

        /* function to update doctor appointment timings for edit doctor time slots */
        $scope.updateDoctorTimeSlots = function () {

            var req = {
                method: 'PATCH',
                url: '/Clearvision/_api/DoctorTimeSlot/0',
                headers: {'Content-Type': 'application/json'},
                data: {
                    "apptType": $scope.apptTypeToUpdateSlots,
                    "doctorId": $scope.doctorToUpdateSlots,
                    "day": $scope.dayTimeSlots,
                    "timeslots": $scope.listOfEditedTimeSlots
                }
            };

            $http(req)
                .success(function (data) {
                    showNotificationsSvc.notifySuccessTemplate('Appointment timings updated successfully');
                    $scope.getDoctorApptTimings($scope.doctorToUpdateSlots, $scope.apptTypeToUpdateSlots);
                    //$scope.doctorApptTypePopover[$scope.timeSlotIndex].editApptTimeslot.close($scope.timeSlotIndex);

                }).error(function (error) {
                    showNotificationsSvc.notifyErrorTemplate('Error, please try again');
                });
        };


        $scope.getClinics();
        $scope.getDoctors();
        $scope.getAppointmentTypes();
        $scope.getCalendarTimeRange();

        $scope.jumpToLocation = function (key) {
            $location.hash(key);
            $anchorScroll();
            /*$anchorScroll.yOffset = 30;*/
        };

        // Slider options with event handlers
        $scope.slider = {
            'options': {
                start: function (event, ui) {
                    $log.info('Event: Slider start - set with slider options', event);
                },
                stop: function (event, ui) {
                    $log.info('Event: Slider stop - set with slider options', event);
                }
            }
        };

    });

appConfig.controller('AppConfigModalInstanceCtrl',
    function ($scope, $modalInstance, $http, $window, $timeout, appointmentsTime, showNotificationsSvc, doctorId,
              getAppointmentTypesService, getCalendarTimeRangeIntervalService) {

        $scope.listOfAvailableSlots = appointmentsTime;
        $scope.stepOneBtnGrp = true;
        $scope.newTypeInfoVisible = true;
        $scope.assignTypeStepOneBtnGrp = true;
        $scope.docInfoFormVisible = true;

        $scope.stepOneNext = function () {

            $scope.docInfoFormVisible = false;
            $scope.docApptTypeFormVisible = true;
            $scope.StepOneComplete = "completed";
            $scope.showStepOneChecker = true;
            $scope.stepOneBtnGrp = false;
            $scope.stepTwoBtnGrp = true;
        };
        $scope.stepTwoNext = function () {
            $scope.docApptTypeFormVisible = false;
            $scope.docApptSlotFormVisible = true;
            $scope.StepOneComplete = "completed";
            $scope.StepTwoComplete = "completed";
            $scope.showStepOneChecker = true;
            $scope.showStepTwoChecker = true;
            $scope.stepTwoBtnGrp = false;
            $scope.stepThreeBtnGrp = true;
        };
        $scope.stepTwoBack = function () {

            $scope.docInfoFormVisible = true;
            $scope.docApptTypeFormVisible = false;
            $scope.stepOneBtnGrp = true;
            $scope.stepTwoBtnGrp = false;
        };
        $scope.stepThreeBack = function () {
            $scope.docApptTypeFormVisible = true;
            $scope.docApptSlotFormVisible = false;
            $scope.stepTwoBtnGrp = true;
            $scope.stepThreeBtnGrp = false;
        };

        $scope.assignTypeStepOneNext = function () {

            $scope.newTypeInfoVisible = false;
            $scope.newApptSlotFormVisible = true;
            $scope.StepOneComplete = "completed";
            $scope.showStepOneChecker = true;
            $scope.assignTypeStepOneBtnGrp = false;
            $scope.assignTypeStepSubmitBtnGrp = true;
        };
        $scope.assignTypeStepSubmitBack = function () {

            $scope.newTypeInfoVisible = true;
            $scope.newApptSlotFormVisible = false;
            $scope.assignTypeStepOneBtnGrp = true;
            $scope.assignTypeStepSubmitBtnGrp = false;
        };

        $scope.cancel = function () {
            //console.log = ($scope.docInfoFormVisible);
            $modalInstance.dismiss('cancel');
        };

        /* function to get appointment types */
        $scope.getApptTypes = function () {
            $http.get('/Clearvision/_api/AppointmentTypeNotTaggedToDoctor/?doctorID=' + doctorId)
                .success(function (appointmentTypes) {
                    $scope.appointmentTypes = appointmentTypes;
                });
        };
        $scope.getApptTypes();

        /* function to create new appointment type */
        $scope.createNewAppointmentType = function (isValid, appointmentTypeName, hexColorValue) {

            // only sends patch if form is valid
            if (isValid) {

                var req = {
                    method: 'POST',
                    url: '/Clearvision/_api/ViewAllApptTypes/',
                    headers: {'Content-Type': 'application/json'},
                    data: {
                        "name": appointmentTypeName,
                        "calendarColourHex": hexColorValue
                    }
                };

                $http(req)
                    .success(function (response) {

                        showNotificationsSvc.notifySuccessTemplate('Appointment type created successfully');
                        $scope.cancel();

                        $timeout(function () {
                            $window.location.reload();
                        }, 3000);

                    })
                    .error(function () {
                        showNotificationsSvc.notifyErrorTemplate('Error, please try again');
                    });

            }
        };

        $scope.slotsToInsert = [
            [],
            [],
            [],
            [],
            [],
            []
        ];

        var listOfTimeslots = {
            timings: [
                {
                    time: "09:00",
                    active: false
                },
                {
                    time: "09:30",
                    active: false
                },
                {
                    time: "10:00",
                    active: false
                },
                {
                    time: "10:30",
                    active: false
                },
                {
                    time: "11:00",
                    active: false
                },
                {
                    time: "11:30",
                    active: false
                },
                {
                    time: "12:00",
                    active: false
                },
                {
                    time: "12:30",
                    active: false
                },
                {
                    time: "13:00",
                    active: false
                },
                {
                    time: "13:30",
                    active: false
                },
                {
                    time: "14:00",
                    active: false
                },
                {
                    time: "14:30",
                    active: false
                }
            ]
        };

        $scope.listOfWorkingDays = [
            {
                day: "Monday",
                active: true,
                timings: [
                    {
                        time: "09:00",
                        active: false
                    },
                    {
                        time: "09:30",
                        active: false
                    },
                    {
                        time: "10:00",
                        active: false
                    },
                    {
                        time: "10:30",
                        active: false
                    },
                    {
                        time: "11:00",
                        active: false
                    },
                    {
                        time: "11:30",
                        active: false
                    },
                    {
                        time: "12:00",
                        active: false
                    },
                    {
                        time: "12:30",
                        active: false
                    },
                    {
                        time: "13:00",
                        active: false
                    },
                    {
                        time: "13:30",
                        active: false
                    },
                    {
                        time: "14:00",
                        active: false
                    },
                    {
                        time: "14:30",
                        active: false
                    }
                ]
            },
            {
                day: "Tuesday",
                active: false,
                timings: [
                    {
                        time: "09:00",
                        active: false
                    },
                    {
                        time: "09:30",
                        active: false
                    },
                    {
                        time: "10:00",
                        active: false
                    },
                    {
                        time: "10:30",
                        active: false
                    },
                    {
                        time: "11:00",
                        active: false
                    },
                    {
                        time: "11:30",
                        active: false
                    },
                    {
                        time: "12:00",
                        active: false
                    },
                    {
                        time: "12:30",
                        active: false
                    },
                    {
                        time: "13:00",
                        active: false
                    },
                    {
                        time: "13:30",
                        active: false
                    },
                    {
                        time: "14:00",
                        active: false
                    },
                    {
                        time: "14:30",
                        active: false
                    }
                ]
            },
            {
                day: "Wednesday",
                active: false,
                timings: [
                    {
                        time: "09:00",
                        active: false
                    },
                    {
                        time: "09:30",
                        active: false
                    },
                    {
                        time: "10:00",
                        active: false
                    },
                    {
                        time: "10:30",
                        active: false
                    },
                    {
                        time: "11:00",
                        active: false
                    },
                    {
                        time: "11:30",
                        active: false
                    },
                    {
                        time: "12:00",
                        active: false
                    },
                    {
                        time: "12:30",
                        active: false
                    },
                    {
                        time: "13:00",
                        active: false
                    },
                    {
                        time: "13:30",
                        active: false
                    },
                    {
                        time: "14:00",
                        active: false
                    },
                    {
                        time: "14:30",
                        active: false
                    }
                ]
            },
            {
                day: "Thursday",
                active: false,
                timings: [
                    {
                        time: "09:00",
                        active: false
                    },
                    {
                        time: "09:30",
                        active: false
                    },
                    {
                        time: "10:00",
                        active: false
                    },
                    {
                        time: "10:30",
                        active: false
                    },
                    {
                        time: "11:00",
                        active: false
                    },
                    {
                        time: "11:30",
                        active: false
                    },
                    {
                        time: "12:00",
                        active: false
                    },
                    {
                        time: "12:30",
                        active: false
                    },
                    {
                        time: "13:00",
                        active: false
                    },
                    {
                        time: "13:30",
                        active: false
                    },
                    {
                        time: "14:00",
                        active: false
                    },
                    {
                        time: "14:30",
                        active: false
                    }
                ]
            },
            {
                day: "Friday",
                active: false,
                timings: [
                    {
                        time: "09:00",
                        active: false
                    },
                    {
                        time: "09:30",
                        active: false
                    },
                    {
                        time: "10:00",
                        active: false
                    },
                    {
                        time: "10:30",
                        active: false
                    },
                    {
                        time: "11:00",
                        active: false
                    },
                    {
                        time: "11:30",
                        active: false
                    },
                    {
                        time: "12:00",
                        active: false
                    },
                    {
                        time: "12:30",
                        active: false
                    },
                    {
                        time: "13:00",
                        active: false
                    },
                    {
                        time: "13:30",
                        active: false
                    },
                    {
                        time: "14:00",
                        active: false
                    },
                    {
                        time: "14:30",
                        active: false
                    }
                ]
            },
            {
                day: "Saturday",
                active: false,
                timings: [
                    {
                        time: "09:00",
                        active: false
                    },
                    {
                        time: "09:30",
                        active: false
                    },
                    {
                        time: "10:00",
                        active: false
                    },
                    {
                        time: "10:30",
                        active: false
                    },
                    {
                        time: "11:00",
                        active: false
                    },
                    {
                        time: "11:30",
                        active: false
                    },
                    {
                        time: "12:00",
                        active: false
                    },
                    {
                        time: "12:30",
                        active: false
                    },
                    {
                        time: "13:00",
                        active: false
                    },
                    {
                        time: "13:30",
                        active: false
                    },
                    {
                        time: "14:00",
                        active: false
                    },
                    {
                        time: "14:30",
                        active: false
                    }
                ]
            }
        ];

        /* function to add and remove slots when assigning appointment type to doctor */
        $scope.addRemoveSlot = function (dayIndex, timeSlot) {

            // check if time slot was previously added
            var check = true;
            var idx = 0;
            angular.forEach($scope.slotsToInsert[dayIndex], function (existingSlot) {
                if (existingSlot == timeSlot) {
                    $scope.slotsToInsert[dayIndex].splice(idx, 1);
                    check = false;
                }

                idx++;
            });
            if (check) {
                $scope.slotsToInsert[dayIndex].push(timeSlot);
            }

            console.log($scope.slotsToInsert)
        };

        $scope.changeDay = function (index) {

            angular.forEach($scope.listOfWorkingDays, function (day) {
                day.active = false;
            });
            $scope.listOfWorkingDays[index].active = true;

        };

        $scope.assignApptTypeToDoctor = function () {

            var prepareJson = {
                "monday": $scope.slotsToInsert[0],
                "tuesday": $scope.slotsToInsert[1],
                "wednesday": $scope.slotsToInsert[2],
                "thursday": $scope.slotsToInsert[3],
                "friday": $scope.slotsToInsert[4],
                "saturday": $scope.slotsToInsert[5],
                "doctorID": doctorId,
                "apptTypeID": $scope.newAppointmentType.id
            };

            var req = {
                method: 'POST',
                url: '/Clearvision/_api/EditDoctorAppointmentTypes/',
                headers: {'Content-Type': 'application/json'},
                data: prepareJson
            };

            $http(req)
                .success(function (response) {

                    showNotificationsSvc.notifySuccessTemplate('Appointment type assigned successfully');
                    //getDoctorsService.getDoctors();
                    $scope.cancel();
                    $timeout(function () {
                        $window.location.reload();
                    }, 3000);

                })
                .error(function () {
                    showNotificationsSvc.notifyErrorTemplate('Error, please try again');
                });

        };

        /*******************************************************************************
         function to remove appointment type from doctor
         *******************************************************************************/

        $scope.removeAppointmentTypeFromDoctor = function () {


        };

        /*******************************************************************************
         function to get calendar time range and break it into 30 mins interval
         *******************************************************************************/

        $scope.getCalendarTimeRangeInterval = function () {

            getCalendarTimeRangeIntervalService.getCalendarTimeRangeInterval()
                .then(function (listOfTimeSlots) {

                    $scope.listOfWorkingDays = [
                        {day: "Monday", dayNum: 0, timeSlots: listOfTimeSlots.slice(), active: true},
                        {day: "Tuesday", dayNum: 1, timeSlots: listOfTimeSlots.slice(), active: false},
                        {day: "Wednesday", dayNum: 2, timeSlots: listOfTimeSlots.slice(), active: false},
                        {day: "Thursday", dayNum: 3, timeSlots: listOfTimeSlots.slice(), active: false},
                        {day: "Friday", dayNum: 4, timeSlots: listOfTimeSlots.slice(), active: false},
                        {day: "Saturday", dayNum: 5, timeSlots: listOfTimeSlots.slice(), active: false}
                    ];

                }, function (error) {
                    $log("Error getting calendar time range interval");
                });

        };

        $scope.getCalendarTimeRangeInterval();

    });


appConfig.controller('CreateDoctorModalCtrl',
    function ($scope, $modalInstance, $log, $http, $window, $timeout, $rootScope, showNotificationsSvc,
              getAppointmentTypesService, getCalendarTimeRangeService, getCalendarTimeRangeIntervalService) {

        /*******************************************************************************
         function to get all appointment types
         *******************************************************************************/

        getAppointmentTypesService.getAppointmentTypes()
            .then(function (listOfAppointmentTypes) {
                $scope.listOfAppointmentTypes = listOfAppointmentTypes;

            }, function (error) {
                $log("Error getting appointment types");
            });

        /*******************************************************************************
         function to add appointment types to doctor
         *******************************************************************************/

        $scope.addRemoveAppointmentTypes = function (appointmentType) {
            var shouldAdd = true;
            var idx = 0;

            angular.forEach($scope.taggedAppointmentTypes, function (existingAppointmentType) {

                if (existingAppointmentType.id === appointmentType.id) {
                    $scope.taggedAppointmentTypes.splice(idx, 1);
                    $scope.listOfApptTypeTimeSlotsToAdd.splice(idx, 1);
                    shouldAdd = false;
                }
                idx++;
            });

            if (shouldAdd) {
                // add the id and empty array of days to the final array to be sent to the backend
                var prepareObj = {};
                prepareObj.id = appointmentType.id;
                prepareObj.days = [[], [], [], [], [], []];
                $scope.listOfApptTypeTimeSlotsToAdd.push(prepareObj);

                // add the appointment type to the array of tagged appointment types
                appointmentType.days = $scope.listOfWorkingDays.slice();
                $scope.taggedAppointmentTypes.push(appointmentType);
            }

            // ensure that only the first appointment type in the array is active
            angular.forEach($scope.taggedAppointmentTypes, function (appointmentType) {
                appointmentType.active = false;
            });
            if ($scope.taggedAppointmentTypes.length !== 0) {
                // only set the first appointment type to active if the tagged appointment type array is not empty
                $scope.taggedAppointmentTypes[0].active = true;
            }

            // very useful check to see the existing tagged appointment types
            //console.log($scope.taggedAppointmentTypes);

        };

        /* array of selected appointment types tagged to doctor */
        $scope.taggedAppointmentTypes = [];

        /*******************************************************************************
         function to get calendar time range and break it into 30 mins interval
         *******************************************************************************/

        $scope.getCalendarTimeRangeInterval = function () {

            getCalendarTimeRangeIntervalService.getCalendarTimeRangeInterval()
                .then(function (listOfTimeSlots) {

                    $scope.listOfWorkingDays = [
                        {day: "Monday", dayNum: 0, timeSlots: listOfTimeSlots.slice(), active: true},
                        {day: "Tuesday", dayNum: 1, timeSlots: listOfTimeSlots.slice(), active: false},
                        {day: "Wednesday", dayNum: 2, timeSlots: listOfTimeSlots.slice(), active: false},
                        {day: "Thursday", dayNum: 3, timeSlots: listOfTimeSlots.slice(), active: false},
                        {day: "Friday", dayNum: 4, timeSlots: listOfTimeSlots.slice(), active: false},
                        {day: "Saturday", dayNum: 5, timeSlots: listOfTimeSlots.slice(), active: false}
                    ];

                }, function (error) {
                    $log("Error getting calendar time range interval");
                });

        };

        /* get calendar time range interval when modal is opened */
        $scope.getCalendarTimeRangeInterval();

        /*******************************************************************************
         function to switch appointment type
         *******************************************************************************/

        $scope.switchAppointmentType = function (selectedAppointmentType) {
            angular.forEach($scope.taggedAppointmentTypes, function (appointmentType) {

                appointmentType.active = false;
                if (appointmentType.id == selectedAppointmentType.id) {
                    appointmentType.active = true;
                }
            });
        };

        /*******************************************************************************
         function to switch day
         *******************************************************************************/

        $scope.switchDay = function (selectedAppointmentType, selectedDay) {
            angular.forEach($scope.taggedAppointmentTypes, function (appointmentType) {

                if (appointmentType.id === selectedAppointmentType.id) {

                    var idx = 0;

                    angular.forEach($scope.listOfWorkingDays, function (day) {

                        appointmentType.days[idx].active = false;
                        if (day.day === selectedDay.day) {
                            appointmentType.days[idx].active = true;
                        }

                        idx++;
                    });

                }
            });
        };

        /*******************************************************************************
         function to add time slot
         *******************************************************************************/

        $scope.addRemoveTimeSlot = function (selectedAppointmentType, selectedDay, selectedTimeSlot) {

            angular.forEach($scope.listOfApptTypeTimeSlotsToAdd, function (appointmentTimeSlots) {

                if (appointmentTimeSlots.id == selectedAppointmentType.id) {
                    // found the appointment type object in the listOfApptTypeTimeSlotsToAdd array

                    // find out if the time slot has already been added
                    var idxTimeSlot = appointmentTimeSlots.days[selectedDay.dayNum].indexOf(selectedTimeSlot);

                    console.log(idxTimeSlot);
                    if (idxTimeSlot === -1) {

                        // time slot does not exist
                        appointmentTimeSlots.days[selectedDay.dayNum].push(selectedTimeSlot);

                    } else {
                        appointmentTimeSlots.days[selectedDay.dayNum].splice(idxTimeSlot, 1);
                    }

                }
            });

            // very useful to check the array to be sent to backend
            //console.log($scope.listOfApptTypeTimeSlotsToAdd);

        };

        // prepare array to be sent to the backend
        $scope.listOfApptTypeTimeSlotsToAdd = [];

        /*******************************************************************************
         function to create new doctor
         *******************************************************************************/

        $scope.createNewDoctor = function (doctorName, doctorContact) {

            var req = {
                method: 'POST',
                url: '/Clearvision/_api/doctors/',
                headers: {'Content-Type': 'application/json'},
                data: {
                    "name": doctorName,
                    "contact": doctorContact,
                    "isDoctor": true,
                    "clinic": [1],
                    "apptType": $scope.listOfApptTypeTimeSlotsToAdd
                }
            };

            $http(req)
                .success(function () {
                    showNotificationsSvc.notifySuccessTemplate('Doctor created successfully');
                    $scope.cancel();

                    $timeout(function () {
                        $window.location.reload();
                    }, 2000);
                })

                .error(function (data) {
                    $rootScope.spinner = {active: false};
                    showNotificationsSvc.notifyErrorTemplate('Error, please try again');
                });
        };

        /*******************************************************************************
         function to close modal
         *******************************************************************************/

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

        $scope.test = function (checked) {
            console.log(checked);
            console.log($scope.listOfWorkingDays);
            console.log($scope.isWorkingDayChecked);
        };

        //$scope.listOfAvailableSlots = appointmentsTime;

        $scope.stepOneBtnGrp = true;
        $scope.newTypeInfoVisible = true;
        $scope.assignTypeStepOneBtnGrp = true;
        $scope.docInfoFormVisible = true;

        $scope.stepOneNext = function () {

            $scope.docInfoFormVisible = false;
            $scope.docApptTypeFormVisible = true;
            $scope.StepOneComplete = "completed";
            $scope.showStepOneChecker = true;
            $scope.stepOneBtnGrp = false;
            $scope.stepTwoBtnGrp = true;
        };
        $scope.stepTwoNext = function () {
            $scope.docApptTypeFormVisible = false;
            $scope.docApptSlotFormVisible = true;
            $scope.StepOneComplete = "completed";
            $scope.StepTwoComplete = "completed";
            $scope.showStepOneChecker = true;
            $scope.showStepTwoChecker = true;
            $scope.stepTwoBtnGrp = false;
            $scope.stepThreeBtnGrp = true;
        };
        $scope.stepTwoBack = function () {

            $scope.docInfoFormVisible = true;
            $scope.docApptTypeFormVisible = false;
            $scope.stepOneBtnGrp = true;
            $scope.stepTwoBtnGrp = false;
        };
        $scope.stepThreeBack = function () {
            $scope.docApptTypeFormVisible = true;
            $scope.docApptSlotFormVisible = false;
            $scope.stepTwoBtnGrp = true;
            $scope.stepThreeBtnGrp = false;
        };

        $scope.assignTypeStepOneNext = function () {

            $scope.newTypeInfoVisible = false;
            $scope.newApptSlotFormVisible = true;
            $scope.StepOneComplete = "completed";
            $scope.showStepOneChecker = true;
            $scope.assignTypeStepOneBtnGrp = false;
            $scope.assignTypeStepSubmitBtnGrp = true;
        };
        $scope.assignTypeStepSubmitBack = function () {

            $scope.newTypeInfoVisible = true;
            $scope.newApptSlotFormVisible = false;
            $scope.assignTypeStepOneBtnGrp = true;
            $scope.assignTypeStepSubmitBtnGrp = false;
        };

    }
);


