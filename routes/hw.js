var express = require('express');
var router = express.Router();
var Device = require("../models/device");
var HwData = require("../models/hwdata");

/* POST: Register new device. */
router.post('/hit', function(req, res, next) {

    var responseJson = { 
	status : "",
        message : ""
    };

    // Ensure the POST data include properties id and email
    if( !req.body.hasOwnProperty("deviceId") ) {
        responseJson.status = "ERROR";
        responseJson.message = "Reqeust missing deviceId parameter.";
        res.status(201).send(JSON.stringify(responseJson));
    }
    else if( !req.body.hasOwnProperty("apikey") ) {
        responseJson.status = "ERROR";
        responseJson.message = "Request missing apikey parameter.";
        res.status(201).send(JSON.stringify(responseJson));
    }
    else if( !req.body.hasOwnProperty("longitude") ) {
        responseJson.status = "ERROR";
        responseJson.message = "Request missing longitude parameter.";
        res.status(201).send(JSON.stringify(responseJson));
    }
    else if( !req.body.hasOwnProperty("latitude") ) {
        responseJson.status = "ERROR";
        responseJson.message = "Request missing latitude parameter.";
        res.status(201).send(JSON.stringify(responseJson));
    }
    else if( !req.body.hasOwnProperty("time") ) {
        responseJson.status = "ERROR";
        responseJson.message = "Request missing time parameter.";
        res.status(201).send(JSON.stringify(responseJson));
    }
    else {
	// Find the device and verify the apikey
	Device.findOne({ deviceId: req.body.deviceId }, function(err, device) {
	    if (device !== null) {
		if (device.apikey != req.body.apikey) {
		    responseJson.status = "ERROR";
		    responseJson.message = "Invalid apikey for device ID " + req.body.deviceId + ".";
		    res.status(201).send(JSON.stringify(responseJson));
		}
		else {
		    // Create a new hw data with user email time stamp 
		    var newHwData = new HwData({
			userEmail: device.userEmail,
			time: req.body.time,
			longitude: req.body.longitude,
			latitude: req.body.latitude
		    });

		    // Save device. If successful, return success. If not, return error message.                                                        
		    newHwData.save(function(err, newHwData) {
			if (err) {
			    responseJson.status = "ERROR";
			    responseJson.message = "Error saving data in db.";
			    res.status(201).send(JSON.stringify(responseJson));
			}
			else {
			    responseJson.status = "OK";
			    responseJson.message = "Data saved in db with object ID " + newHwData._id + ".";
			    res.status(201).send(JSON.stringify(responseJson));
			}
		    });
		}
	    } 
	    else {
		responseJson.status = "ERROR";
		responseJson.message = "Device ID " + req.body.deviceId + " not registered.";
		res.status(201).send(JSON.stringify(responseJson));	    
	    }
	});
    }
});

module.exports = router;
