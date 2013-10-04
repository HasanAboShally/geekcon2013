var Leap = require('./leapjs/leap');

var prevDirectionStr = null;
var prevPosition = null;
var moveCount = 0;
var circleCount = 0;
var threshold = 5; // percent

var secretPattern = ["up", "down", "up", "down", "left", "right", "in", "out", "down"];
var pattern = [];

var moveDelta = {
    x: 0,
    y: 0,
    z: 0
}

var boxRange = {
    x: { min: -300, max: 300 },
    y: { min: 0, max: 600 },
    z: { min: -300, max: 300 }
};

var LeapFrame = function (data) {

    this.frame = JSON.parse(data);

    var _isPatternCorrect = false;
    var _closingSignal = false;
    var _myFunction = function (frame) {

        if(frame.gestures.length > 0){
            var gesture = frame.gestures[0];
            if(gesture.type == 'circle'){
                if(gesture.normal[2] <= 0){
//                    console.log("----------------------- Running Clockwise -----------------------");
                }else{
                    circleCount++;
                    console.log(circleCount);
                    if(circleCount == 30){
                        _closingSignal = true;
                        circleCount = 0;
                        console.log("||| Running Counterclockwise:: >>> " + _closingSignal);
                    }
                }
            }
        }

        if (frame.pointables.length > 0) {

            var position = _fingerPosition(frame);

            if (!isInRange(position))
                return;

            if (!prevPosition) {
                prevPosition = position;
                return;
            }

            var move = getVector(prevPosition, position);
            moveCount++;

            moveDelta.x += move.x;
            moveDelta.y += move.y;
            moveDelta.z += move.z;

            prevPosition = position;

            if (moveCount % 5 == 0) {

                var directionStr;

                if (isMoveAboveThreshold(moveDelta)) {

                    var maxDir = Math.max(Math.abs(moveDelta.x), Math.abs(moveDelta.y), Math.abs(moveDelta.z));

                    if (maxDir == Math.abs(moveDelta.x)) {

                        if (moveDelta.x > 0)
                            directionStr = 'right';
                        else
                            directionStr = 'left';

                    }
                    if (maxDir == Math.abs(moveDelta.y)) {
                        if (moveDelta.y > 0)
                            directionStr = 'up';
                        else
                            directionStr = 'down';
                    }
                    if (maxDir == Math.abs(moveDelta.z)) {
                        if (moveDelta.z > 0)
                            directionStr = 'out';
                        else
                            directionStr = 'in';
                    }

                    if (directionStr != prevDirectionStr) {

                        console.log(directionStr);
                        pattern.push(directionStr);

                        if (pattern.length > secretPattern.length)
                            pattern.shift();

                        if (checkPattern()) {
                            _isPatternCorrect = true;
                            pattern = [];
                        }
                    }
                }

                moveDelta.x = 0;
                moveDelta.y = 0;
                moveDelta.z = 0;

                prevDirectionStr = directionStr;
            }
        }
    }

    function checkPattern() {

        var patternStr = pattern.join(',');
        var secretPatternStr = secretPattern.join(',');

        return (patternStr == secretPatternStr);
    }

    function isInRange(p) {
        return (p.x >= boxRange.x.min && p.x <= boxRange.x.max
          && p.y >= boxRange.y.min && p.y <= boxRange.y.max
          && p.z >= boxRange.z.min && p.z <= boxRange.z.max);
    }

    function getMaxAxis() {

        var max = arguments[0], maxAxis = 0;

        for (var i = 1; i < arguments.length; i++) {
            if (Math.abs(arguments[i]) > max) {
                max = Math.abs(arguments[i]);
                maxAxis = i;
            }
        }

        return maxAxis;
    }

    function getVector(p1, p2) {
        return {
            x: (p2.x - p1.x),
            y: (p2.y - p1.y),
            z: (p2.z - p1.z)
        };
    }

    function isMoveAboveThreshold(move) {

        return ((Math.abs(move.x) > (boxRange.x.max - boxRange.x.min) * (threshold / 100))
        || (Math.abs(move.y) > (boxRange.y.max - boxRange.y.min) * (threshold / 100))
        || (Math.abs(move.z) > (boxRange.z.max - boxRange.z.min) * (threshold / 100)));
    }

    /* -------------------------------- Original Source Code -------------------------------- */
    /**
     * Check if there is exploitable data in the current frame to move the servos
     * @return true if so, false else
     */
    var _isValid = function (frame) {
        _myFunction(frame);
        if (frame.pointables && _isPatternCorrect) {
            var pointableId = frame.pointables[0].handId;
            if (frame.hands && frame.hands[0]) {
                var handId = frame.hands[0].id;
                if (handId === pointableId) {
                    return true;
                }
            }
        }
        return false;
    };

    /**
     * Calculate the angle between 2 vectors in degrees
     * @param {Array} v1 - coordinates of the first vector
     * @param {Array} v2 - coordinates of the second vector
     * @return the angle in degrees
     */
    var _vectorAngle = function (v1, v2) {
        var vectorProduct = v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
        var v1Norm = Math.sqrt(v1.x * v1.x + v1.y * v1.y + v1.z * v1.z);
        var v2Norm = Math.sqrt(v2.x * v2.x + v2.y * v2.y + v2.z * v2.z);
        var cos = Math.acos(vectorProduct / (v1Norm * v2Norm));
        return cos * 180 / Math.PI;
    };

    var _palmPosition = function (frame) {
        return {
            x: frame.hands[0].palmPosition[0],
            y: frame.hands[0].palmPosition[1],
            z: frame.hands[0].palmPosition[2]
        };
    };

    var _palmDirection = function (frame) {
        return {
            x: frame.hands[0].direction[0],
            y: frame.hands[0].direction[1],
            z: frame.hands[0].direction[2]
        };
    };

    var _palmNormal = function (frame) {
        return {
            x: frame.hands[0].palmNormal[0],
            y: frame.hands[0].palmNormal[1],
            z: frame.hands[0].palmNormal[2]
        };
    };

    var _fingerPosition = function (frame) {
        return {
            x: frame.pointables[0].tipPosition[0],
            y: frame.pointables[0].tipPosition[1],
            z: frame.pointables[0].tipPosition[2]
        };
    };

    var _fingerDirection = function (frame) {
        return {
            x: frame.pointables[0].direction[0],
            y: frame.pointables[0].direction[1],
            z: frame.pointables[0].direction[2]
        };
    };

    var _fingerAngleY = function (frame) {
        return _vectorAngle(_palmNormal(frame), _fingerDirection(frame));
    };

    var _fingerAngleX = function (frame) {
        return _vectorAngle(_palmDirection(frame), _fingerDirection(frame));
    };

    var _deltaHandFinger = function (frame) {
        return {
            x: _palmPosition(frame).x - _fingerPosition(frame).x,
            y: _palmPosition(frame).y - _fingerPosition(frame).y,
            z: _palmPosition(frame).z - _fingerPosition(frame).z
        };
    };

    if (_isValid(this.frame)) {
        this.valid = true;
        this.palmPosition = _palmPosition(this.frame);
        this.palmDirection = _palmDirection(this.frame);
        this.palmNormal = _palmNormal(this.frame);
        this.fingerPosition = _fingerPosition(this.frame);
        this.fingerDirection = _fingerDirection(this.frame);
        this.fingerAngleY = _fingerAngleY(this.frame);
        this.fingerAngleX = _fingerAngleX(this.frame);
        this.deltaHandFinger = _deltaHandFinger(this.frame);
    }
    else {
        this.valid = false;
    }

    if(_closingSignal){
        this.closingSignal = true;
    }else{
        this.closingSignal = false;
    }

};

module.exports = LeapFrame;