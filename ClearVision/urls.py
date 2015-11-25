from django.conf.urls import url, include
from rest_framework import routers

from . import views

router = routers.DefaultRouter()
router.register(r'_api/patients', views.PatientList)
router.register(r'_api/clinics', views.ClinicList)
router.register(r'_api/staff', views.StaffList)
router.register(r'_api/doctors', views.DoctorList)
router.register(r'_api/EditDoctorAppointmentTypes', views.EditDoctorAppointmentTypes)
router.register(r'_api/AppointmentTypeNotTaggedToDoctor', views.AppointmentTypeNotTaggedToDoctor)
router.register(r'_api/CheckFutureNumberOfAppointmentsUnderDoctor', views.CheckFutureNumberOfAppointmentsUnderDoctor)
router.register(r'_api/DoctorCalendarSideTab', views.DoctorCalendarSideTab)
router.register(r'_api/appointments', views.AppointmentList)
router.register(r'_api/appointmentsCUD', views.AppointmentWriter)
router.register(r'_api/iSchedule', views.AppointmentIScheduleFinder)
router.register(r'_api/analyticsServer', views.AnalyticsServer)
router.register(r'_api/ViewROIChart', views.ViewROIChart)
router.register(r'_api/ViewSavedROICustomFilters', views.ViewSavedROICustomFilters)
router.register(r'_api/EditSavedROICustomFilters', views.EditSavedROICustomFilters)
router.register(r'_api/ViewApplicableROIChannels', views.ViewApplicableROIChannels)
router.register(r'_api/Remarks', views.RemarksFinder)
router.register(r'_api/HeatMap', views.AppointmentHeatMap)
router.register(r'_api/SuggestedTimeSlots', views.SuggestedTimeSlots)
router.register(r'_api/DoctorTimeSlot', views.DoctorTimeSlot)
router.register(r'_api/TimeSlots', views.AvaliableTimeSlots)
router.register(r'_api/Swapper', views.iScheduleSwapper)
router.register(r'_api/SearchBar', views.SearchBarFilter)
router.register(r'_api/ViewSwapperTable', views.ViewSwapperTable)
router.register(r'_api/ViewSwappedPatientsInInbox', views.ViewSwappedPatientsInInbox)
router.register(r'_api/EditSwapperTable', views.EditSwapperTable)
router.register(r'_api/ViewSwappableNumber', views.ViewSwappableNumber)
router.register(r'_api/ViewApptTimeslots', views.ViewApptTimeslots)
router.register(r'_api/ViewNotifications', views.ViewNotifications)
router.register(r'_api/ViewTodayPatients', views.ViewTodayPatients)
router.register(r'_api/ViewNoShow', views.ViewNoShow)
router.register(r'_api/ViewPatientQueue', views.PatientQueue)
router.register(r'_api/ViewArchive', views.ViewArchive)
router.register(r'_api/ViewNoShowPerChannel', views.NoShowPerChannel)
router.register(r'_api/ViewAppointmentAnalysisStackedChart', views.AppointmentAnalysisStackedChart)
router.register(r'_api/ViewAppointmentAnalysisPiechartApptTypeTab', views.AppointmentAnalysisPiechartApptTypeTab)
router.register(r'_api/ViewAppointmentAnalysisPiechartReasonsTab', views.AppointmentAnalysisPiechartReasonsTab)
router.register(r'_api/ViewAppointmentAnalysisPiechartMarketingChannelsTab', views.AppointmentAnalysisPiechartMarketingChannelsTab)
router.register(r'_api/ViewAppointmentAnalysisPartPieApptType', views.AppointmentAnalysisPartPieApptType)
router.register(r'_api/ViewCancellationReasons', views.ViewCancellationReasons)
router.register(r'_api/ViewSavedApptTypeCustomFilters', views.ViewSavedApptTypeCustomFilters)
router.register(r'_api/EditSavedApptTypeCustomFilters', views.EditSavedApptTypeCustomFilters)
router.register(r'_api/ViewSavedMarketingChannelCustomFilters', views.ViewSavedMarketingChannelCustomFilters)
router.register(r'_api/EditSavedMarketingChannelCustomFilters', views.EditSavedMarketingChannelCustomFilters)
router.register(r'_api/ViewBacktrackListings', views.ViewBacktrackListings)
router.register(r'_api/ViewAllApptTypes', views.ViewAllApptTypes)
router.register(r'_api/CheckApptTypeUnderDoctor', views.CheckApptTypeUnderDoctor)
router.register(r'_api/CheckApptTypeInGeneral', views.CheckApptTypeInGeneral)
router.register(r'_api/ViewAllMarketingChannels', views.ViewAllMarketingChannels)
router.register(r'_api/EditMarketingChannelsStatus', views.EditMarketingChannelsStatus)
router.register(r'_api/CalendarBlocker', views.CalendarBlocker)
router.register(r'_api/ViewDoctorBlockedTime', views.ViewDoctorBlockedTime)
router.register(r'_api/CheckApptsForBlockedCalendar', views.CheckApptsForBlockedCalendar)
router.register(r'_api/InputMarketingChannelCost', views.InputMarketingChannelCost)
router.register(r'_api/DoctorApptTypes', views.DoctorApptTypes)
router.register(r'_api/ApptTypeDoctors', views.ApptTypeDoctors)
router.register(r'_api/ViewWaitlistAppt', views.ViewWaitlistAppt)
router.register(r'_api/ViewCalendarColorSettings', views.ViewCalendarColorSettings)
router.register(r'_api/ViewHeatMapColorSettings', views.ViewHeatMapColorSettings)
router.register(r'_api/ViewCalendarTimeRange', views.ViewCalendarTimeRange)
router.register(r'_api/ViewSMSApptReminder', views.ViewSMSApptReminder)
router.register(r'_api/AnalyticsDashboardTestChecker', views.AnalyticsDashboardTestChecker)
router.register(r'_api/ConversionRatePrediction', views.ConversionRatePrediction)
router.register(r'_api/ViewWronglyRepliedSMS', views.ViewWronglyRepliedSMS)

urlpatterns = [
    url('^', include('django.contrib.auth.urls')),
    url(r'^header', views.header, name='header'),
    url(r'^calendar', views.calendar),
    url(r'^roi', views.roi),
    url(r'^kpi', views.kpi),
    url(r'^conversion', views.conversion),
    url(r'^schedule', views.schedule),
    url(r'^expenditure', views.expenditure),
    url(r'^managechannels', views.managechannels),
    url(r'^waitlist', views.waitlist),
    url(r'^queue', views.queue),
    url(r'^msglog', views.msglog),
    url(r'^_api/changepw', views.changepassword),
    url(r'^changepw', views.changepw),
    url(r'^adminconfig', views.adminconfig),
    url(r'^success', views.success, name='success'),
    url(r'^logout', views.logout, name='logout'),
    url(r'^', include(router.urls)),
    url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    url(r'^_api/recieveSMS', views.recievemsg,),
    url(r'^_api/ViewReceivedSMS', views.ViewReceivedSMS,),
    url(r'^_api/ViewSentSMS', views.ViewSentSMS,),
    url(r'^_api/SendAdHocSMS', views.SendAdHocSMS,),
    url(r'^_api/UserTrackingTimeIn', views.RecordUserActionsTimeIn,),
    url(r'^_api/UserTrackingTimeOut', views.RecordUserActionsTimeOut,),
    url(r'^_api/WriteDatabaseFullYear', views.WriteDatabaseFullYear,),
    url(r'^_api/MonthSurgeryKPI', views.MonthSurgeryKPI,),
]
