'use strict';

var socket = io.connect();

function Socketio(){
    // Add private attribute this.id = 1;
}

Socketio.prototype.init = function(){
    if( room !== '' ){
        //socket.emit('create or join', room);
        if( isInitiator ){
            socket.emit('webrtc.create', room);
        }else{
            socket.emit('webrtc.join', room);
        }
    }
    console.log('Inicializar los eventos de escucha');
}

Socketio.prototype.created = function(room, clientId){
    console.log('A1: ' + clientId + ' Coach creo la sala ' + room );
}

Socketio.prototype.join = function(room){
    console.log('A2: Se unio el host B a la sala ' + room );
    isChannelReady = true;
}

Socketio.prototype.createroom = function(room){
    console.log('B1.1: Host A create room ' + room);
    socket.emit('webrtc.join', room);
}

Socketio.prototype.joined = function(room, clientId){
    console.log('B1: ' + clientId + ' Se unio a la sala ' + room);
    isChannelReady = true;
}

Socketio.prototype.full = function(room, clientId){
    console.log('FULL: ' + clientId + ' esta llena la sala ' + room );
}

Socketio.prototype.wait = function(room, clientId){
    console.log('B2: Esperando por el coach en la sala ' + room );
}

Socketio.prototype.sendMessage = function(message){
    socket.emit('webrtc.message', message);
}

Socketio.prototype.receiveMessage = function(message){
    if(message.type === 'mediaready'){
        console.log('socketio: media ready');
        connection.start();
    }
    if(message.type === 'offer'){
        console.log('socketio: offer');
        if( isInitiator == false && isStarted == false ){
            connection.start();
        }
        peerConecction.setRemoteDescription(new RTCSessionDescription(message));
        connection.makeAnswer();
    }
    if(message.type == 'answer' && isStarted == true){
        console.log('socketio: answer');
        peerConecction.setRemoteDescription(new RTCSessionDescription(message));
    }
    if(message.type === 'candidate' && isStarted == true){
        console.log('socketio: candidate');
        var candidate = new RTCIceCandidate({
            sdpMLineIndex: message.label,
            candidate: message.candidate
        });
        peerConecction.addIceCandidate(candidate);
    }
}

// EVENT SOCKET IO
var socketio = new Socketio();
// Escuchadores para el host A
socket.on('webrtc.created', socketio.created);
socket.on('webrtc.join', socketio.join);
// Escuchadores para el host B
socket.on('webrtc.createroom', socketio.createroom);
socket.on('webrtc.joined', socketio.joined);
socket.on('webrtc.full', socketio.full);
socket.on('webrtc.wait', socketio.wait);
// Intercambio de información
socket.on('webrtc.message', socketio.receiveMessage);
