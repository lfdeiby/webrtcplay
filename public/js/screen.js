'use strict';

// Botones
var informationBtn = document.getElementById('information');
var settingBtn = document.getElementById('setting');
var microphoneBtn = document.getElementById('microphone');
var callBtn = document.getElementById('call');
var hangupBtn = document.getElementById('hangup');
var cameraBtn = document.getElementById('camera');
var chatBtn = document.getElementById('chat');

// Clases
var setting = new Setting();
var information = new Information(role);
var chat = new Chat();
var connection = new Connection();

//Actions of screen
document.addEventListener('DOMContentLoaded', onReady);
popup.addEventListener('click', handleOutClickClosePopup);

function onReady(){
    prepareToListeners();
    
}

function prepareToListeners(){
    informationBtn.addEventListener('click', information.apiInfoUser.bind(information) );
    settingBtn.addEventListener('click', setting.open.bind(setting) );
    microphoneBtn.addEventListener('click', handleToggleMicrophone );
    callBtn.addEventListener('click', handleCall );
    hangupBtn.addEventListener('click',  hanldeHangup);
    cameraBtn.addEventListener('click', handleToggleVideo );
    chatBtn.addEventListener('click', chat.open.bind(chat) );
}

//Handlers to event buttons
function handleToggleMicrophone(){
    connection.toggleMicrophone();
    if( connection.openAudio )
        this.classList.remove('cut');
    else
        this.classList.add('cut');
}

function handleToggleVideo(){
    connection.toggleVideo();
    if( connection.openVideo )
        this.classList.remove('cut');
    else
        this.classList.add('cut');
}

function handleCall(){
    connection.start.bind(connection);
    showBtnHangup();
    connection.call();
}

function handleOutClickClosePopup(event){
    if( event.target.id === 'popup'){
        closePopup();
    }
}

function hanldeHangup(){
    connection.hangup();
    localVideo.classList.remove('minimize');
}

function showBtnCall(){
    callBtn.classList.remove('hide');
    hangupBtn.classList.add('hide');
}

function showBtnHangup(){
    hangupBtn.classList.remove('hide');
    callBtn.classList.add('hide');
}



