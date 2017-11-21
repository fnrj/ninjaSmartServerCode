var text = [];
setInterval(postStream, 21000);

function postStream() {
			//$.get("http://ec2-13-58-6-147.us-east-2.compute.amazonaws.com/devices/status/all?userEmail=testElephant@gmail.com", text, function(text) {
			$.get("/devices/status/all?userEmail=testElephant@gmail.com", text, function(text) {
				var dataObject = JSON.parse(text);
				var addDate = new Date(dataObject.devices[1].lastContact);
				var addRow = $('<tr>');
				for(var i = 0; i < 1; i++) {
    					addRow.append($('<td id="a">' + dataObject.devices[1].longitude + '</td><td id="b">' + dataObject.devices[1].latitude + '</td><td id="c">' + dataObject.devices[1].uv + '</td><td id="d">' + addDate + '</td></tr>'));
				}
				$('#streamData').append(addRow);
			});
			return false;
}

window.onload = function() {
	postStream();
};
