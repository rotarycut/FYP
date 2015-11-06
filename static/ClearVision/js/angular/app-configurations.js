var appConfig = angular.module('app.config', []);

/*appConfig.run('$anchorScroll', function($anchorScroll){
 $anchorScroll.yOffset = 50;
 });*/

appConfig.controller('configCtrl',
    function ($scope, $http, $modal, $log, $anchorScroll, $location, $timeout,
              getDoctorsService,
              getClinicsService,
              getAppointmentTypesService,
              showNotificationsSvc) {

        $scope.operatingHoursPopover = [];
        $scope.appointmentTypesPopover = [];
        $scope.doctorsNamePopover = [];
        $scope.doctorsRemovePopover = [];
        $scope.doctorApptTypePopover = [];

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
            }
        };

        $scope.listOfAvailableTiming = ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00"];
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
        }

        $scope.openAddNewDocModal = function (size) {

            var modalInstance = $modal.open({
                animation: true,
                templateUrl: 'myAddNewDocModalTemplate.html',
                controller: 'AppConfigModalInstanceCtrl',
                size: size,
                resolve: {
                    appointmentsTime: function () {
                        return $scope.listOfTimeslots;
                    }
                }
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
                    }
                }
            });
        };

        $scope.openAssignNewApptTypeModal = function (size) {

            var modalInstance = $modal.open({
                animation: true,
                templateUrl: 'assignNewTypeModalTemplate.html',
                controller: 'AppConfigModalInstanceCtrl',
                size: size,
                resolve: {
                    docInfoFormVisibility: function () {
                        return '';
                    },
                    appointmentsTime: function () {
                        return $scope.listOfTimeslots;
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

            getDoctorsService.getDoctors()
                .then(function (listOfDoctors) {
                    $scope.listOfDoctors = listOfDoctors;

                    // push all the doctors popovers based on doctor count
                    angular.forEach(listOfDoctors, function () {

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

                    });

                    // assign the popover array to the scope
                    $scope.doctorsNamePopover = doctorsNamePopover;
                    $scope.doctorsRemovePopover = doctorsRemovePopover;

                }, function (data) {

                    $log.error("Failed to retrieve doctors");
                });

        };

        /* function to get all appointment types */
        $scope.getAppointmentTypes = function () {

            // prepare an empty appointment type popover array
            var appointmentTypesPopover = [];

            getAppointmentTypesService.getAppointmentTypes()
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
                    });

                    // assign the popover array to the scope
                    $scope.appointmentTypesPopover = appointmentTypesPopover;

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
        $scope.getApptTypes = function () {
            $http.get('/Clearvision/_api/ViewAllApptTypes/')
                .success(function (appointmentTypes) {
                    $scope.appointmentTypes = appointmentTypes;
                });
        };
        $scope.getApptTypes();

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
                                        // set the current index chosen
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
                    })
                    .error(function () {
                    });
            }
        };

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


        $scope.getClinics();
        $scope.getDoctors();
        $scope.getAppointmentTypes();
        $scope.getCalendarTimeRange();

        $scope.jumpToLocation = function (key) {
            $location.hash(key);
            $anchorScroll();
            /*$anchorScroll.yOffset = 40;*/
        }

    });

appConfig.controller('AppConfigModalInstanceCtrl', function ($scope, $modalInstance, $http, appointmentsTime, showNotificationsSvc) {

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
        $http.get('/Clearvision/_api/ViewAllApptTypes/')
            .success(function (appointmentTypes) {
                $scope.appointmentTypes = appointmentTypes;
            });
    };
    $scope.getApptTypes();

    /* function to create new appointment type */
    $scope.createNewAppointmentType = function (isValid, appointmentTypeName) {

        // only sends patch if form is valid
        if (isValid) {

            var req = {
                method: 'POST',
                url: '/Clearvision/_api/ViewAllApptTypes/',
                headers: {'Content-Type': 'application/json'},
                data: {
                    "name": appointmentTypeName
                }
            };

            $http(req)
                .success(function (response) {

                    showNotificationsSvc.notifySuccessTemplate('Appointment type created successfully');
                    $scope.cancel();
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
        angular.forEach($scope.slotsToInsert[dayIndex], function (day) {
            if (day == timeSlot.time) {
                $scope.slotsToInsert[dayIndex].splice(idx, 1);
                check = false;
            }

            idx++;
        });
        if (check) {
            $scope.slotsToInsert[dayIndex].push(timeSlot.time);
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


        var prepareJson = {};

        var req = {
            method: 'POST',
            url: '/Clearvision/_api/ViewAllApptTypes/',
            headers: {'Content-Type': 'application/json'},
            data: {}
        };

        $http(req)
            .success(function (response) {

                showNotificationsSvc.notifySuccessTemplate('Appointment type created successfully');
                $scope.cancel();
            })
            .error(function () {
                showNotificationsSvc.notifyErrorTemplate('Error, please try again');
            });

    };

});


