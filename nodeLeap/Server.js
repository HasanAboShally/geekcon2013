var LeapFrame = require('./leapFrame');
var WebSocket = require('ws');
var Board = require('./node_modules/firmata').Board;




var isClappingEnabled = true;






var i = 0;
var isOpening = false;
var isOpen = false;
var isClosing = false;
var isClosed = true;
var pin = 9;

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
                // isOpen = false;
                // isClosed = false;   
                board.servoWrite(pin, -1);
                iterations++;
                console.log("servor opening " + iterations);
            } else if (isClosing) {
                // isOpen = false;
                // isClosed = false;   
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

// function openDoor() {
//     console.log("door is open");
//     isOpening = true;
// }

// function closeDoor() {
//     isClosing = true;
// }



function openDoorCallback() {

    if (isClosed) {
    console.log("============================================================================================");
    console.log("===================================== Welcome to Labgoo ====================================");
    console.log("============================================================================================");

    
        isOpening = true;
    }
}

function closeDoorCallback() {

    if (isOpen) {
    console.log("============================================================================================");
    console.log("===================================== Hope to See You Again=================================");
    console.log("============================================================================================");

    
        isClosing = true;
    }
}


// ===================================================================================================================== LeapMotion


var openDoorPattern = ["up", "down", "up", "down", "left", "right"];
var closeDoorPattern = ["down", "left", "up", "right"];

var wsLeapMotion = new WebSocket('ws://localhost:6437')
    .on('message', function (data, flags) {
        i++;

        if (i % 3 === 0) {
            var frame = new LeapFrame(data,
                                      openDoorPattern, closeDoorPattern,
                                      openDoorCallback, closeDoorCallback);
            i = 0;
        }
    });


    // if(isClappingEnabled){
    //     // Clap n' Nock
    //     var COMMANDS = { 
    //         CLOSE_DOOR: 0, 
    //         OPEN_DOOR: 1 
    //     };

    //     var stickIpAdress = "192.168.43.49";

    //     try{
    //         var wsClapping = new WebSocket('ws://192.168.43.127:10000')
    //             .on('message', function (command, flags) {
    //                 //console.log(command);
    //                 switch (+command) {
    //                     case COMMANDS.OPEN_DOOR: { openDoorCallback(); } break;
    //                     case COMMANDS.CLOSE_DOOR: { closeDoorCallback(); } break;
    //                 }
    //             });
    //     }
    //     catch(e){

    //     }
    // }