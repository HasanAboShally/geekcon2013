var i = 0;
var LeapFrame = require('./leapFrame');

var WebSocket = require('ws');
var ws = new WebSocket('ws://192.168.1.206:10000');


ws.on('message', function (data, flags) {

    console.log(data);
});
