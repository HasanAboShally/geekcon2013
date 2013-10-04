var i = 0;
var LeapFrame = require('./leapFrame');

var WebSocket = require('ws');
var ws = new WebSocket('ws://localhost:6437');
ws.on('open', function () {
    ws.send('something');
});

var isOpen = false;
ws.on('message', function (data, flags) {
    i++;

    if (i % 3 === 0) {
        var frame = new LeapFrame(data);
        if(frame.valid && !isOpen){
            isOpen = true;
            console.log("============================================================================================");
            console.log("===================================== Welcome to Labgoo ====================================");
            console.log("============================================================================================");
        }else if(frame.closingSignal && isOpen){
            isOpen = false;
            console.log("============================================================================================");
            console.log("===================================== Hope to See You Again=================================");
            console.log("============================================================================================");
        }
        i = 0;
    }
});