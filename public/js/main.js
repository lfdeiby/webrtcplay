'use string';
var isChannelReady = false;
var isInitiator = false;
var isStarted = false;
var localStream;
var remoteStream;
var pc;
var dataChannel;
var turnReady;
var pcConfig = {
    'iceServers':[{ 'urls': 'stun:stun.l.google.com:19302' }]
};
var consola = document.querySelector('#console')

var photo = document.getElementById('photo');
var photoContext = photo.getContext('2d');
var trail = document.getElementById('trail');
var snapAndSendBtn = document.getElementById('snapandsend');
var photoContextW;
var photoContextH;
snapAndSendBtn.addEventListener('click', snapAndSend);

var sdpConstraints = {
    offerToReceiveAudio: true,
    offerToReceiveVideo: true
};

var room = 'foo',
    socket = io.connect();

/**
 * SECCION PARA ENVIAR A CREAR O UNIRSE AL SESSION VIA SOCKET.IO
 */
if( room != ""){
    // socket.emit('create or join', room);
    trace("1. initBackground Create or Join room " + room);
}

socket.on('created', function(room, clientId){
    trace('2-A. Create room ' + room);
    isInitiator = true;
    trace('3-A. isInitiator = true ');
});

socket.on('full', function(room, clientId){
    console.log('Message fro client: Room ' + room + ' is full :\'(');
});

socket.on('ipaddr', function(ipaddr){
    console.log('Message from client: server ip address is ' + ipaddr);
});

socket.on('join', function(room){
    trace('5-A. Se unio un host al room ' + room);
    isChannelReady = true;
    trace('6-A. isChannelReady = true ');
});

socket.on('joined', function(room, clientId){
    trace('2-B: Host B inicio en el room ' + room + ' and id is:' + clientId);
    isChannelReady = true;
});

socket.on('log', function(array){
    //console.log.apply(console, array);
});

/**
 * ENVIAR Y RECIBIR MENSAJES A TREVÉS DEL SOCKET.IO PARA CONFIGURAR LOS PEER
 */

 function sendMessage(message){
     // trace('AUX: Client sending message: '+ message);
     socket.emit('message', message);
 }

 socket.on('message', function(message){
    // console.log('Client received message: ', message);
    if( message === 'got user media'){
        trace('7-A. got user media');
        maybeStart();
    }else if( message.type == 'offer' ){
        trace('5-B: Recibir la offerta del host A.');
        if( isInitiator == false && isStarted == false ){
            trace('6-B: Hacer la conección.');
            maybeStart();
        }
        pc.setRemoteDescription(new RTCSessionDescription(message));
        doAnswer();

    }else if( message.type == 'answer' && isStarted == true){
        trace('11-A: Recibir la respuesta answer de host B');
        pc.setRemoteDescription(new RTCSessionDescription(message));
        
    }else if( message.type == 'candidate' && isStarted == true){
        trace('N-B: Agreagar el iceCandidate del host A.');
        var candidate = new RTCIceCandidate({
            sdpMLineIndex: message.label,
            candidate: message.candidate
        });
        pc.addIceCandidate(candidate);

    }else if( message == 'bye' && isStarted == true ){
        handleRemoteHangup();
    }
 });

/**
 * CONFIGURACIÓN DE LOS PEERCONECTION
 */

 var localVideo = document.querySelector('#localVideo');
 var remoteVideo = document.querySelector('#remoteVideo');

 var constraints = {
    audio: true,
    video: {width: {min: 1280}, height: {min: 720}}
}


navigator.mediaDevices.getUserMedia(constraints)
    .then( gotStream )
    .catch(function(e){  
        console.log(e);
        alert('getUserMEdia() error: ' + e.name) ;
    });


function gotStream(stream){
    trace('4-A, 3-B. gotStream()');
    localStream = stream;
    localVideo.autoplay = true;
    localVideo.muted = true;
    localVideo.srcObject = stream;
    localVideo.onloadedmetadata = function(){
        photo.width = photoContextW = localVideo.videoWidth;
        photo.height = photoContextH = localVideo.videoHeight;

        
    }
    sendMessage('got user media');
    if( isInitiator == true ){
        maybeStart();
    }
}

console.log('Getting user media with constraints', constraints);
 
if( location.hostname !== 'localhost' ){
    requestTurn(
         'https://computeengineondemand.appspot.com/turn?username=41784574&key=4080218913'
    );
}

function maybeStart(){
    trace('AUX maybeStart intentar hacer la conexion: ' + 
        'isStarted=' + (isStarted ? 'true' : 'false') +
        ', localStream=' + (localStream ? 'true' : 'false') +
        ', isChannelReady=' + (isChannelReady ? 'true' : 'false')
    );
    if( isStarted == false && typeof localStream !== 'undefined' && isChannelReady == true){
        trace('8-A, 7-B. crear la conexion de pares');
        createPeerConnection();
        pc.addStream(localStream);
        isStarted = true;
        if( isInitiator ){
            trace('9-A: Hacer la llamada');
            doCall();
        }
    }
    else{
        trace('AUX maybeStart esperar a que se conecte el cliente');
    }
}

window.onbeforeunload = function(){ this.sendMessage('bye'); }

/**
 * CREAR LA CONEXION
 */
function createPeerConnection(){
    try {
        pc = new RTCPeerConnection(null);
        pc.onicecandidate = handleIceCandidate;
        pc.onaddstream = handleRemoteStreamAdded;
        pc.onremovestream = handleRemoteStreamRemoved;
        trace("8-A-1, 7-B-1: Conección creada");
        
        // AGREGAR EL DATA CHANEL
        if( isInitiator ){
            trace('DCH A1: Iniciar el data Channel');
            dataChannel = pc.createDataChannel('photos');
            onDataChannelCreated(dataChannel);
        }else{
            pc.ondatachannel = function(event){
                trace('DCH B1: Unirse al data channel');
                dataChannel = event.channel;
                onDataChannelCreated(dataChannel);
            }
        }
    } catch (error) {
        console.log('Failed to create peerConnection, exception: ' + error.message);
        return;
    }
}

function handleIceCandidate(event){
    trace('AUX: escuchador de IceCandidate ' + JSON.stringify(event) );
    if( event.candidate ){
        sendMessage({
            type: 'candidate',
            label: event.candidate.sdpMLineIndex,
            id: event.candidate.sdpMid,
            candidate: event.candidate.candidate
        })
    }else{
        trace("AUX: fin del candidato");
    }
}

function handleCreateOfferError(event){
    trace('AUX escuchador de la offerta Error: ' + event.toString());
}

// EVENTOS DEL DATA CHANNEL
function onDataChannelCreated(channel){
    trace('Data Chanel Creado: ' + channel.toString());
    channel.onopen = function(){
        snapAndSendBtn.disabled = false;
    };

    channel.onclose = function(){
        snapAndSendBtn.disabled = true;
    };

    channel.onmessage = ( adapter.browserDetails.browser === 'firefox' )
        ? receiveDataFirefoxFactory()
        : receiveDataChromeFactory();
}

function receiveDataChromeFactory(){
    var buffer, count;
    return function onmessage(event){
        var data = event.data;
        console.log("Type of:", typeof data);
        if( data instanceof ArrayBuffer ){
            console.log('Receive: ArrayBuffer data');
        }
        if( data instanceof Blob ){
            console.log('Receive: Blob data');
        }
        if( data instanceof String ){
            console.log('Receive: String');
        }
        if( typeof event.data === 'string' ){
            buffer = window.buff = new Uint8ClampedArray(parseInt(event.data));
            count = 0;
            trace('DCH: Esperando en Chrome el total de ' + buffer.byteLength + " bytes");
            return;
        }
        var data = new Uint8ClampedArray(event.data);
        buffer.set(data, count);
        count += data.byteLength;
        console.log("count:" + count);

        if( count === buffer.byteLength ){
            trace('DCH: Trasferencias realizada render photo');
            renderPhoto(buffer);
        }
    }
}

function receiveDataFirefoxFactory(){
    var count, total, parts;
    return function onmessage(event){
        if( typeof event.data === 'string' ){
            total = parseInt(even.data);
            parts = [];
            count = 0;
            trace('Esperando en firefox el total de ' + total + ' bytes');
            return;
        }
        parts.push(event.data);
        count += event.data.size;
        
        if( count === total ){
            var buffer = new Uint8ClampedArray(total);
            var compose = function(i, pos) {
                var reader = new FileRender();
                reader.onload = function(){
                    buffer.set(new Uint8ClampedArray(this.result), pos);
                    if( i + 1 === parts.length ){
                        renderPhoto( buffer );
                    }else{
                        compose( i + 1, pos + this.result.byteLength );
                    }
                };
                reader.readAsArrayBuffer(parts[i]);
            };
            compose(0, 0);
        }
    }
}

function renderPhoto( data ){
    trace('DCH Render: Renderear el archvio enviado');
    var canvas = document.createElement('canvas');
    canvas.width = photoContextW;
    canvas.height = photoContextH;
    canvas.classList.add('incomingPhoto');

    trail.insertBefore(canvas, trail.firstChild);
    var context = canvas.getContext('2d');
    var img = context.createImageData(photoContextW, photoContextH);
    img.data.set(data);
    context.putImageData(img, 0, 0);
}

function doCall(){
    trace('10-A: Crear la offerta al host A');
    pc.createOffer(sdpConstraints)
    .then(setLocalAndSendMessage)
    .catch(handleCreateOfferError);
}

function doAnswer(){
    console.log('8-B Enviar la respuesta answer al host A');
    pc.createAnswer()
    .then( setLocalAndSendMessage, onCreateSessionDescriptionError );
}

function setLocalAndSendMessage( sessionDescription ){
    trace('AUX: setear la sessionDescription');
    pc.setLocalDescription( sessionDescription );
    trace('AUX: Enviar mensaje offerta/answer: Type: ' + 
        JSON.stringify(sessionDescription.type) + " ..... " );
    sendMessage(sessionDescription);
}

function onCreateSessionDescriptionError(error){
    console.log('Failed to create session description: ' + error.toString());
}

function requestTurn(turnUrl){
    var turnExists = false;
    for( var i in pcConfig.iceServers ){
        if( pcConfig.iceServers[i].urls.substr(0, 5) === 'turn:'){
            turnExists = true;
            turnReady = true;
            break;
        }
    }
    if( turnExists == false ){
        console.log('Gettrin TURN server from', turnUrl);
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function(){
            if( ShadowRoot.readyState === 4 && xhr.status == 200 ){
                var turnServer = JSON.parse(xhr.responseText);
                console.log('Got TURN server: ', turnServer);
                pcConfig.iceServers.puch({
                    'urls': 'turn:' + turnServer.username + '@' + turnServer.turn,
                    'creadential': turnServer.password
                });
                turnReady = true;
            }
        }
        xhr.open('GET', turnUrl, true);
        xhr.send();
    }
}

function handleRemoteStreamAdded(event){
    console.log('Remote stream added');
    remoteStream = event.stream;
    remoteVideo.srcObject = remoteStream;
}

function handleRemoteStreamRemoved(event){
    console.log('Remote stream removed. Event: ', event);
}

function hangup(){
    console.log('Hanging up.');
    stop();
    sendMessage('bye');
}

function handleRemoteHangup(){
    console.log('Sessio terminated.');
    stop();
    // isInitiator = false;
    isStarted = false;
    isChannelReady = false;
}

function stop(){
    isStarted = false;
    pc.close();
    pc = null;
}

function trace(text){
    var html = document.createElement('p');
    html.innerHTML = `${text}`;
    consola.appendChild(html);
}

function snapAndSend(){
    snapPhoto();
    sendPhoto();
}

function snapPhoto(){
    photoContext.drawImage( localVideo, 0, 0, photo.width, photo.height);
}

function sendPhoto(){
    var sum = 0;
    var CHUNK_LEN = 64000;
    var img = photoContext.getImageData(0, 0, photoContextW, photoContextH),
        len = img.data.byteLength,
        n = len / CHUNK_LEN | 0;
    
    if( !dataChannel ){
        trace("DCH ERROR: El data channel no esta habilitado");
        return;
    }else if( dataChannel.readyState == 'closed' ){
        trace("DCH ERROR: Se perdio la coneccion con el peer connection");
        return;
    }
        
    trace('DCH Start Send: Empezar a enviar el archivo peso de: ' + len + ' bytes');
    dataChannel.send(len);

    for( var i=0; i < n; i++ ){
        var start = i * CHUNK_LEN,
            end = (i + 1) * CHUNK_LEN;
        var dataSend = img.data.subarray(start, end);
        dataChannel.send(dataSend);
        sum += dataSend.length;
        console.log('Count A: ' + sum );
    }

    if( len % CHUNK_LEN ){
        var dataSend = img.data.subarray( n * CHUNK_LEN);
        sum += dataSend.length;
        dataChannel.send(dataSend);
        console.log('Count A: ' + sum );
    }
    trace('DCH Finalizo la enviada de archivo peso de: ' + len + ' bytes');
}