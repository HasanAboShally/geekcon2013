var i = 0;
var LeapFrame = require('./leapFrame');
var isOpening = false;
var isOpen = false;
var isClosing = false;
var isClosed = true;
var pin = 9;
var WebSocket = require('ws');
var Board = require('./node_modules/firmata').Board;

var board = new Board('/dev/cu.usbmodem1411', function() {
        console.log("board ready");

        var iterations = 0;
        board.pinMode(pin,board.MODES.SERVO);
        setInterval(function(){
            if (iterations >= 50) {
                isOpening = false;
                iterations = 0;
            }
            else if (isOpening) {
                board.servoWrite(pin,1);
                iterations++;
            } else {
                board.servoWrite(pin,92);
            }
        },100);
    });

var ws = new WebSocket('ws://localhost:6437');
ws.on('open', function () {
    ws.send('something');
});

function open() {
    console.log("open");
    isOpening = true;
}

function close() {
    console.log("close");
    sweep(-1);
}

ws.on('message', function (data, flags) {
    i++;

    if (i % 3 === 0) {
        var frame = new LeapFrame(data);
        if(frame.frame.hands && frame.frame.hands.length == 1 && !isOpening){
            isOpening = true;
            open();
        }
        i = 0;
    }
});