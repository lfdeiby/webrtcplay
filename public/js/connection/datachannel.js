'use string';
var dataChannel;

function DataChannel(){

}

DataChannel.prototype.start = function(){
    if( isInitiator ){
        dataChannel = peerConecction.createDataChannel('chat');
        this.onDataChannelCreated(dataChannel);
    }else{
        var self = this;
        peerConecction.ondatachannel = function(event){
            dataChannel = event.channel;
            self.onDataChannelCreated(dataChannel);
        }
    }
}

DataChannel.prototype.onDataChannelCreated = function(channel){
    channel.onopen = this.listenerDataChannelOpen;
    channel.onclose = this.listenerDataChannelClose;
    channel.onmessage = this.listenerDataChannelMessage;
}

DataChannel.prototype.listenerDataChannelOpen = function(){
    console.log("DCH: channel open");
}

DataChannel.prototype.listenerDataChannelClose = function(){
    console.log("DCH: channel close");
}

DataChannel.prototype.listenerDataChannelMessage = function(){
    console.log("DCH: receibe message");
}
