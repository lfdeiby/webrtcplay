'use strict';
var isChannelReady = false;
var isStarted = false;
var localStream;
var remoteStream;
var peerConecction;
var servers = {
    'iceServers':[{ 'urls': 'stun:stun.l.google.com:19302' }]
};
var dataChannelConnection = new DataChannel();

function Connection(){
    this.openVideo = true;
    this.openAudio = true;

    this.sessionDescriptionProtocol = {
        offerToReceiveAudio: this.openAudio,
        offerToReceiveVideo: this.openVideo
    }
}

Connection.prototype.init = function(){
    var constraints = {
        audio: this.openAudio,
        video: this.openVideo
    }
    var self = this;
    navigator.mediaDevices.getUserMedia(constraints)
    .then( self.gotStream.bind(self) )
    .catch( function(err){
        console.log('Error', err);
        self.error(ALERT_MESSAGE);
    });
}

Connection.prototype.start = function(){
    console.log('Start peer connection', isChannelReady);
    if( isStarted == false && typeof localStream !== 'undefined' && isChannelReady == true ){
        this.createPeerConnection();
        peerConecction.addStream(localStream);
        isStarted = true;
    }
}

Connection.prototype.call = function(){
    showLoading();
    this.makeOffer();
}

Connection.prototype.hangup = function(){
    console.log('Hungup peer connection');
    isChannelReady = false;
    isStarted = false;
    peerConecction.close();
    peerConecction = null;
    remoteStream = null;
}

Connection.prototype.toggleMicrophone = function(){
    this.openAudio = !this.openAudio;
    console.log('Close/Open Audio');
}

Connection.prototype.toggleVideo = function(){
    this.openVideo = !this.openVideo;
    console.log('Close/Open Video');
}

Connection.prototype.error = function(message){
    meAlert('danger', message);
}

Connection.prototype.gotStream = function(stream){
    localStream = stream;
    localVideo.autoplay = true;
    localVideo.muted = true;
    localVideo.srcObject = stream;
    socketio.sendMessage({type: 'mediaready', message:'mediaready'});
    if( isInitiator ){
        this.start();
    }
}

Connection.prototype.createPeerConnection = function(){
    try{
        console.log('Try connect to peerConnection');
        peerConecction = new RTCPeerConnection(null);
        peerConecction.onicecandidate = this.handleIceCandidate;
        peerConecction.onaddstream = this.handleRemoteStreamAdded;
        peerConecction.onremovestream = this.handleRemoteStreamRemoved;
        dataChannelConnection.start();
    }catch( err ){
        console.log("ERROR PeerConnection: ", err);
    }
}



// Listeners de peer connection
Connection.prototype.handleIceCandidate = function(event){
    if( event.candidate ){
        var message = {
            type: 'candidate',
            label: event.candidate.sdpMLineIndex,
            id: event.candidate.sdpMid,
            candidate: event.candidate.candidate
        };
        socketio.sendMessage(message);
    }
}

Connection.prototype.handleRemoteStreamAdded = function(event){
    closeLoading();
    localVideo.classList.add('minimize');
    remoteStream = event.stream;
    remoteVideo.srcObject = remoteStream;
}

Connection.prototype.handleRemoteStreamRemoved = function(event){
    remoteStream = null;
    remoteVideo.srcObject = null;
}

Connection.prototype.makeOffer = function(){
    peerConecction.createOffer( this.sessionDescriptionProtocol)
    .then( this.setLocalAndSendMessage )
    .catch(function(err){console.log('ERRR', err)});
}

Connection.prototype.makeAnswer = function(){
    peerConecction.createAnswer()
    .then( this.setLocalAndSendMessage )
    .catch(function(err){console.log('ERRR', err)});
}

Connection.prototype.setLocalAndSendMessage = function(sessionDescription){
    peerConecction.setLocalDescription( sessionDescription );
    socketio.sendMessage( sessionDescription );
}