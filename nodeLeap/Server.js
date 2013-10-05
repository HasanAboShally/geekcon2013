var LeapFrame = require('./leapFrame');
var WebSocket = require('ws');

function openDoor() {
    console.log("============================================================================================");
    console.log("===================================== Welcome to Labgoo ====================================");
    console.log("============================================================================================");
}

function closeDoor() {
    console.log("============================================================================================");
    console.log("===================================== Hope to See You Again=================================");
    console.log("============================================================================================");
}


// ===================================================================================================================== LeapMotion


var i = 0;
var openDoorPattern = ["up", "down", "up"];
var closeDoorPattern = ["down", "left", "up", "right"];

var wsLeapMotion = new WebSocket('ws://localhost:6437')
    .on('message', function (data, flags) {
        i++;

        if (i % 3 === 0) {
            var frame = new LeapFrame(data,
                                      openDoorPattern, closeDoorPattern,
                                      openDoor, closeDoor);
            i = 0;
        }
    });


// Clap n' Nock
var COMMANDS = { CLSOE_DOOR: 0, OPEN_DOOR: 1 };

var wsClapping = new WebSocket('ws://192.168.1.206:10000')
    .on('message', function (command, flags) {
        switch (command) {
            case COMMANDS.OPEN_DOOR: { openDoor(); } break;
            case COMMANDS.CLSOE_DOOR: { closeDoor(); } break;
        }
    });
