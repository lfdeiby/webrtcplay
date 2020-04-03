'use strict';

// Variables llenadas con el framework

var isInitiator = false;
var role = 'coach';
var room = 'foo';

var localVideo = document.getElementById('localVideo');
var remoteVideo = document.getElementById('remoteVideo');

var popup = document.getElementById('popup');
var popupContainer = document.getElementById('popupmain');
var loading = document.getElementById('loading');

var ALERT_MESSAGE = {
    'usermedia_error': "Error: tu dispositivo no cuenta con los permisos para acceder a la camara y al audio"
}



function closePopup(){
    popup.classList.remove('active');
    popupContainer.innerHTML = '';
}

function showPopup(html){
    popupContainer.innerHTML = html;
    popup.classList.add('active');
}

function closeLoading(){
    loading.classList.remove('active');
}

function showLoading(){
    loading.classList.add('active');
}

function meAlert(type, message, callback){
    alert(type + ": " + message);
}


