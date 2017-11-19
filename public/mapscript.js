//	Source: https://developer.here.com/api-explorer/maps-js/v3.0/markers/markers-on-the-map
//	Author: HERE
//	Note: D3 code for map and marker obtained from Source, but modified to facilitate Ajax call, process raw data from sensor, clear and reload new stream data, and provide minimal functionality

function liveStreamMap(map) {
	var platform = new H.service.Platform({
  		app_id: 'DemoAppId01082013GAL',
  		app_code: 'AJKnXv84fjrb0KIHawS0Tg',
  		useCIT: true,
  		useHTTPS: true
	});

	var defaultLayers = platform.createDefaultLayers();
	var map = new H.Map(document.getElementById('map'),
  		defaultLayers.normal.map,{
  			center: {lat:32.3, lng:-111},
  			zoom: 12
	});

	var dataMarker = undefined;
	console.log(dataMarker);
	var text = [];
	$.get("http://ec2-13-58-6-147.us-east-2.compute.amazonaws.com/devices/status/all?userEmail=testElephant@gmail.com", text, function(text) {
		var dataObject = JSON.parse(text);
		const coordinates = new Object();
		coordinates.lat = dataObject.devices[1].longitude;
		coordinates.lng = dataObject.devices[1].latitude;  
		console.log(coordinates);  

  		var dataMarker = new H.map.Marker(coordinates);
		console.log(dataMarker);
 	 	map.addObject(dataMarker);
	})
};
	
function clearMap() {
	var myNode = document.getElementById("map");
	myNode.innerHTML = '';
}

liveStreamMap();
setInterval(clearMap, 20000.5);
setInterval(liveStreamMap, 20000.75);

