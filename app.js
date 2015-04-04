<<<<<<< HEAD
var map;
var leftHandPrev;
var separationStart;
var MAX_ZOOM = 22;
var SEPARATION_SCALING = 1.25;
var LEFT_HAND = 0, RIGHT_HAND = 1;
var X = 0, Y = 1, Z = 2;
function move(frame) {
    // Look for any circle gestures and process the zoom
    // TODO: filter out multiple circle gestures per frame
    if(frame.valid && frame.gestures.length > 0){
        frame.gestures.forEach(function(gesture){
            filterGesture("circle", zoom)(frame, gesture);
        });
    }
    markHands(frame);
    // if there is one hand grabbing...
    if(frame.hands.length > 0 && isGripped(frame.hands[LEFT_HAND])) {
      var leftHand = frame.hands[LEFT_HAND];
      var rightHand = frame.hands.length > 1 ? frame.hands[RIGHT_HAND] : undefined;
      var separation;
      
      // If there was no previous closed position, capture it and exit
      if(leftHandPrev == null) {
        leftHandPrev = leftHand;
        return;
=======
function initialize() {
var mapOptions = {
  center: { lat: 34.0737354, lng: -118.4455506},
  zoom: 15
};
var map = new google.maps.Map(document.getElementById('map-canvas'),
    mapOptions);
}
google.maps.event.addDomListener(window, 'load', initialize);

// Store frame for motion functions
var previousFrame = null;
var paused = false;
var pauseOnGesture = false;

// Setup Leap loop with frame callback function
var controllerOptions = {enableGestures: true};

// to use HMD mode:
// controllerOptions.optimizeHMD = true;

Leap.loop(controllerOptions, function(frame) {
  if (paused) {
    return; // Skip this update
  }

  // Display Frame object data
  var frameOutput = document.getElementById("frameData");

  var frameString = "Frame ID: " + frame.id  + "<br />"
                  + "Timestamp: " + frame.timestamp + " &micro;s<br />"
                  + "Hands: " + frame.hands.length + "<br />"
                  + "Fingers: " + frame.fingers.length + "<br />"
                  + "Tools: " + frame.tools.length + "<br />"
                  + "Gestures: " + frame.gestures.length + "<br />";

  // Frame motion factors
  if (previousFrame && previousFrame.valid) {
    var translation = frame.translation(previousFrame);
    frameString += "Translation: " + vectorToString(translation) + " mm <br />";

    var rotationAxis = frame.rotationAxis(previousFrame);
    var rotationAngle = frame.rotationAngle(previousFrame);
    frameString += "Rotation axis: " + vectorToString(rotationAxis, 2) + "<br />";
    frameString += "Rotation angle: " + rotationAngle.toFixed(2) + " radians<br />";

    var scaleFactor = frame.scaleFactor(previousFrame);
    frameString += "Scale factor: " + scaleFactor.toFixed(2) + "<br />";
  }
  frameOutput.innerHTML = "<div style='width:300px; float:left; padding:5px'>" + frameString + "</div>";

  // Display Hand object data
  var handOutput = document.getElementById("handData");
  var handString = "";
  if (frame.hands.length > 0) {
    for (var i = 0; i < frame.hands.length; i++) {
      var hand = frame.hands[i];

      handString += "<div style='width:300px; float:left; padding:5px'>";
      handString += "Hand ID: " + hand.id + "<br />";
      handString += "Type: " + hand.type + " hand" + "<br />";
      handString += "Direction: " + vectorToString(hand.direction, 2) + "<br />";
      handString += "Palm position: " + vectorToString(hand.palmPosition) + " mm<br />";
      handString += "Grab strength: " + hand.grabStrength + "<br />";
      handString += "Pinch strength: " + hand.pinchStrength + "<br />";
      handString += "Confidence: " + hand.confidence + "<br />";
      handString += "Arm direction: " + vectorToString(hand.arm.direction()) + "<br />";
      handString += "Arm center: " + vectorToString(hand.arm.center()) + "<br />";
      handString += "Arm up vector: " + vectorToString(hand.arm.basis[1]) + "<br />";

      // Hand motion factors
      if (previousFrame && previousFrame.valid) {
        var translation = hand.translation(previousFrame);
        handString += "Translation: " + vectorToString(translation) + " mm<br />";

        var rotationAxis = hand.rotationAxis(previousFrame, 2);
        var rotationAngle = hand.rotationAngle(previousFrame);
        handString += "Rotation axis: " + vectorToString(rotationAxis) + "<br />";
        handString += "Rotation angle: " + rotationAngle.toFixed(2) + " radians<br />";

        var scaleFactor = hand.scaleFactor(previousFrame);
        handString += "Scale factor: " + scaleFactor.toFixed(2) + "<br />";
>>>>>>> origin/gh-pages
      }
      // if there is a right hand and its gripped...
      if(rightHand) {
        if(isGripped(rightHand)) {
          separation = Math.sqrt(
                            Math.pow(rightHand.stabilizedPalmPosition[X] - leftHand.stabilizedPalmPosition[X], 2) + 
                            Math.pow(rightHand.stabilizedPalmPosition[Y] - leftHand.stabilizedPalmPosition[Y], 2)
                          );
          // console.log("separation = " + separation + " ("+separationStart+")");
          // ...and no previous separation, capture and exit
          if(separationStart == null) {
            separationStart = separation;
            return;
          }
          // Calculate if we need to change the zoom level
          var currentZoom = map.getZoom();
          if(currentZoom > 1 && separation < (separationStart / SEPARATION_SCALING) ) {
            map.setZoom( currentZoom - 1 );
            separationStart = separation;
          } else if( currentZoom < MAX_ZOOM && separation > (SEPARATION_SCALING * separationStart) ) {
            map.setZoom( currentZoom + 1 );
            separationStart = separation;
          }
        // If the right hand is not gripped...
        } else if(separationStart != null) {
          separationStart = null;
        }
      }
      // Calculate how much the hand moved
      var dX = leftHandPrev.stabilizedPalmPosition[X] - leftHand.stabilizedPalmPosition[X];
      var dY = leftHandPrev.stabilizedPalmPosition[Y] - leftHand.stabilizedPalmPosition[Y];
      // console.log("Movement: " + dX + ","+dY);
      var center = map.getCenter();
      var scaling = 4.0 / Math.pow(2, map.getZoom()-1);
      var newLat = center.lat() + dY * scaling;
      var newLng = center.lng() + dX * scaling;
      var newCenter = new google.maps.LatLng(newLat, newLng);
      
      // console.log(newCenter)
      map.setCenter(newCenter);
      leftHandPrev = leftHand;
    } else {
      // If the left hand is not in a grab position, clear the last hand position
      if(frame.hands.length > LEFT_HAND && !isGripped(frame.hands[LEFT_HAND]) && leftHandPrev != null) {
        leftHandPrev = null;
      }
      // if the right hand is not in a grab position, clear the separation
      if(frame.hands.length > RIGHT_HAND && !isGripped(frame.hands[RIGHT_HAND]) && separationStart != null) {
        separationStart = null;
      }
       // console.log("Clearing lastHand");
    }
}
var handMarkers = [];
var HEIGHT_OFFSET = 150;
var BASE_MARKER_SIZE_GRIPPED = 350000, BASE_MARKER_SIZE_UNGRIPPED = 500000;
function markHands(frame) {
    var scaling = (4.0 / Math.pow(2, map.getZoom()-1));
      var bounds = map.getBounds();
      // FIXME: Sometimes this gets run too early, just exit if its too early.
      if(!bounds) { return; }
      var origin = new google.maps.LatLng(bounds.getSouthWest().lat(), bounds.getCenter().lng());
      var hands = frame.hands;
      for(var i in hands) {
          if(hands.hasOwnProperty(i)) {
            // Limit this to 2 hands for now
            if(i > RIGHT_HAND) {
              return;
            }
            var hand = hands[i];
            newCenter = new google.maps.LatLng(origin.lat() + ((hand.stabilizedPalmPosition[1] - HEIGHT_OFFSET) * scaling), origin.lng() + (hand.stabilizedPalmPosition[0] * scaling));
            // console.log(center.lat() + "," + center.lng());
            // console.log(newCenter.lat() + "," + newCenter.lng());
            var gripped = isGripped(hand);
            var baseRadius = gripped ? BASE_MARKER_SIZE_GRIPPED : BASE_MARKER_SIZE_UNGRIPPED;
            var handColor = getHandColor(hand);
            var handMarker = handMarkers[i];
            if(!handMarker) {
              handMarker = new google.maps.Circle();
              handMarkers[i] = handMarker;
            }
            handMarker.setOptions({
              strokeColor: handColor,
              strokeOpacity: 0.8,
              strokeWeight: 2,
              fillColor: handColor,
              fillOpacity: 0.35,
              map: map,
              center: newCenter,
              radius: baseRadius * scaling
            });
          }
      }
}
var zoomLevelAtCircleStart;
var INDEX_FINGER = 1;
function zoom(frame, circleGesture) {
    // Only zoom based on one index finger
    if(circleGesture.pointableIds.length == 1 &&
            frame.pointable(circleGesture.pointableIds[0]).type == INDEX_FINGER) {
        switch(circleGesture.state) {
            case "start":
                zoomLevelAtCircleStart = map.getZoom();
            // fall through on purpose...
            case "update":
                // figure out if we need to change the zoom level;
                var zoomChange = Math.floor(circleGesture.progress);
                var currentZoom = map.getZoom();
                var zoomDirection = isClockwise(frame, circleGesture) ? zoomChange : -zoomChange;
                if(zoomLevelAtCircleStart + zoomDirection != currentZoom) {
                    var newZoom = zoomLevelAtCircleStart + zoomDirection;
                    if(newZoom >= 0 && newZoom <= MAX_ZOOM) {
                        map.setZoom(newZoom);
                    }
                }
                break;
            case "stop":
                zoomLevelAtCircleStart = null;
                break;
        }
    }
}
function initialize() {
  var mapOptions = {
    zoom: 8,
    center: new google.maps.LatLng(-34.397, 150.644),
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    mapTypeControlOptions: {
        position: google.maps.ControlPosition.TOP_LEFT
    }
  };
  map = new google.maps.Map(document.getElementById('map-canvas'),
      mapOptions);
  // listen to Leap Motion
  Leap.loop({enableGestures: true}, move);
}
// ==== utility functions =====
/** Returns the truth that a Leap Motion API Hand object is currently in a gripped or "grabbed" state.
*/
function isGripped(hand) {
  return hand.grabStrength == 1.0;
}
function getHandColor(hand) {
    if(isGripped(hand)) {
        return "rgb(0,119,0)";
    } else {
        var tint = Math.round((1.0 - hand.grabStrength) * 119);
        tint = "rgb(119," + tint + "," + tint + ")";
        return tint;
    }
}
function filterGesture(gestureType, callback) {
    return function(frame, gesture) {
        if(gesture.type == gestureType) {
            callback(frame, gesture);
        }
    }
}
function isClockwise(frame, gesture) {
    var clockwise = false;
    var pointableID = gesture.pointableIds[0];
    var direction = frame.pointable(pointableID).direction;
    var dotProduct = Leap.vec3.dot(direction, gesture.normal);
    if (dotProduct  >  0) clockwise = true;
    return clockwise;
}
<<<<<<< HEAD
google.maps.event.addDomListener(window, 'load', initialize);
=======

//////////////////////////////////////////////////////////////////////////////
/*Swipe Gestures*/
/*
Leap.loop(function(frame) {

  frame.hands.forEach(function(hand, index) {
    var cat = ( cats[index] || (cats[index] = new Cat()) );
    cat.setTransform(hand.screenPosition(), hand.roll());
  });

}).use('screenPosition', {scale: 0.25});
*/

var cats = {};

Leap.loop(function(frame) {

  frame.hands.forEach(function(hand, index) {

    var cat = ( cats[index] || (cats[index] = new Cat()) );
    cat.setTransform(hand.screenPosition(), hand.roll());

  });

}).use('screenPosition', {scale: 0.25});


var Cat = function() {
  var cat = this;
  var img = document.createElement('img');
  img.src = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/109794/cat_2.png';
  img.style.position = 'absolute';
  img.onload = function () {
    cat.setTransform([window.innerWidth/2,window.innerHeight/2], 0);
    document.body.appendChild(img);
  }

  cat.setTransform = function(position, rotation) {

    img.style.left = position[0] - img.width  / 2 + 'px';
    img.style.top  = position[1] - img.height / 2 + 'px';

    img.style.transform = 'rotate(' + -rotation + 'rad)';

    img.style.webkitTransform = img.style.MozTransform = img.style.msTransform =
    img.style.OTransform = img.style.transform;

  };

};

cats[0] = new Cat();
//////////////////////////////////////////////////////////////////////////////
>>>>>>> origin/gh-pages
