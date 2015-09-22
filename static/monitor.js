var sent = document.getElementById("sent");

swampdragon.onChannelMessage(function (channels, message) {
    sent.innerText = JSON.stringify(message.data);
});


swampdragon.ready(function () {
    swampdragon.subscribe('AppointmentCUD', 'createAppt', null);
    swampdragon.subscribe('AppointmentCUD', 'updateAppt', null);
    swampdragon.subscribe('AppointmentCUD', 'deleteAppt', null);
});