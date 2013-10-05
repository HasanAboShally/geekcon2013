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
            if (iterations >= 30) {
                if (isOpening) {
                    isOpening = false;
                    isOpen = true;
                    isClosed = false;
                } else if(isClosing) {
                    isClosing = false;
                    isClosed = true;
                    isOpen = false;
                }

                iterations = 0;
            }
            else if (isOpening) {
                isOpen = false;
                isClosed = false;   
                board.servoWrite(pin, -1);
                iterations++;
                console.log("servor opening " + iterations);
            } else if (isClosing) {
                isOpen = false;
                isClosed = false;   
                board.servoWrite(pin, 1);
                iterations++;
                console.log("servor closing " + iterations);
            }
            else {
                board.servoWrite(pin, 92);
                // console.log("servor reset");
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
    isClosing = true;
}

ws.on('message', function (data, flags) {
    i++;

    if (i % 3 === 0) {
        var frame = new LeapFrame(data);
        if(frame.valid && !isOpening && !isClosing && isClosed){
            console.log('servo should be running');
             // open();
        }else if(frame.closingSignal && !isOpening && !isClosing && isOpen){
            console.log('servo should be reversing');
             // close();
        }
        i = 0;
    }
});