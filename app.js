function initialize() {
var mapOptions = {
  center: { lat: 34.0737354, lng: -118.4455506},
  zoom: 15
};
var map = new google.maps.Map(document.getElementById('map-canvas'),
    mapOptions);
}
google.maps.event.addDomListener(window, 'load', initialize);