var express = require('express');
var router = express.Router();
var Device = require("../models/device");

// Function to generate a random apikey consisting of 32 characters
function getNewApikey() {
    var newApikey = "";
    var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    
    for (var i = 0; i < 32; i++) {
	newApikey += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
    }

    return newApikey;
}

// Documentation for endpoints at: https://docs.google.com/document/d/1JscD6zSzdL7VYqShu37UaFyvOF-uRN5BAqr-0ns_tkM/edit

// GET request return one or "all" devices registered and last time of contact.
router.get('/status/:devid', function(req, res, next) {
    var deviceId = req.params.devid;
    var responseJson = { 
        message : "",
	devices: []
    }; 

   if( !req.query.hasOwnProperty("userEmail")) {
        responseJson.message = "Missing account name(userEmail).";
        res.status(400).send(JSON.stringify(responseJson));
        return;
    }
    var userEmail = { "userEmail": req.query.userEmail };
    // Create query based on parameters deviceId
    if (deviceId == "all") {
	var query = {};
    }
    else {
	var query = { "deviceId": deviceId };
    }
    
    // Query the devices collection to returned requested documents
    Device.find({$and:[userEmail,query]}, function(err, allDevices) {  //return devices associated with username
	if (err) {
	    var errormsg = {"message": err};
	    res.status(400).send(JSON.stringify(errormsg));
	}
	else if(!allDevices.length){
		if(deviceId=="all"){ responseJson.message = "No device registered yet.";}
		else {responseJson.message = "Device ID " + deviceId + " not registered.";}
		res.status(400).send(JSON.stringify(responseJson));
	}	    
	else {
	    // Create JSON response consisting of an array of devices
	    responseJson.message = "Return device info.";
	    for (var doc of allDevices) {
		// For each found device add a new element to the array
		// with the device id and last contact time
		responseJson.devices.push({ "deviceId":   	doc.deviceId, 
					    "lastContact": 	doc.lastContact,
					    "userEmail": 	doc.userEmail,
					    "longitude": 	doc.longitude,
					    "latitude": 	doc.latitude,
					    "uv": 		doc.uv,
					    "zipcode": 		doc.zipcode,
					    "address": 		doc.address});
	    }
	    res.status(200).send(JSON.stringify(responseJson));
	}
    });
});

// PUT request from photon to update coordinates and UV exposure.
router.put('/status/:devid', function(req, res, next) {
    var deviceIdFromParam = req.params.devid;
    var responseJson = { 
	status : "",
        message : ""
    };
    // Ensure the POST data include properties id and email
    if( !req.body.hasOwnProperty("apikey") ) {
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
    else if( !req.body.hasOwnProperty("lastContact") ) {
        responseJson.status = "ERROR";
        responseJson.message = "Request missing lastContact parameter.";
        res.status(201).send(JSON.stringify(responseJson));
    }
    else if( !req.body.hasOwnProperty("uv") ) {
        responseJson.status = "ERROR";
        responseJson.message = "Request missing time parameter.";
        res.status(201).send(JSON.stringify(responseJson));
    }
    else {
	Device.findOne({ "deviceId": deviceIdFromParam }, function(err, device) {
	    if (device !== null) {
		if (device.apikey != req.body.apikey) {
		    responseJson.status = "ERROR";
		    responseJson.message = "Invalid apikey for device ID " + deviceIdFromParam + ".";
		    res.status(201).send(JSON.stringify(responseJson));
		}
		else {
		    // update device data 
		    device.lastContact = req.body.lastContact;
		    device.longitude = req.body.longitude;
		    device.latitude = req.body.latitude;
		    device.uv = req.body.uv;
		    // Save device. If successful, return success. If not, return error message.                                                        
		    device.save(function(err, updateDevice) {
			if (err) {
			    responseJson.status = "ERROR";
			    responseJson.message = "Error saving data in db.";
			    res.status(201).send(JSON.stringify(responseJson));
			}
			else {
			    responseJson.status = "OK";
			    responseJson.message = "Data saved in db with object ID " + updateDevice._id + ".";
			    res.status(201).send(JSON.stringify(responseJson));
			}
		    });
		}
	    }
	    else {
		responseJson.status = "ERROR";
		responseJson.message = "Device ID " + deviceIdFromParam + " not registered.";
		res.status(201).send(JSON.stringify(responseJson));	    
	    }
	})
     }
});


// DELETE request from photon to update coordinates and UV exposure.
router.delete('/status/:devid', function(req, res, next) {
    var deviceIdFromParam = req.params.devid;
    var responseJson = { 
	status : "",
        message : ""
    };
    // Ensure the POST data include properties id and email
    if( !req.body.hasOwnProperty("apikey") ) {
        responseJson.status = "ERROR";
        responseJson.message = "Request missing apikey parameter.";
        res.status(201).send(JSON.stringify(responseJson));
    }
    else if( !req.body.hasOwnProperty("userEmail") ) {
        responseJson.status = "ERROR";
        responseJson.message = "Request missing userEmail parameter.";
        res.status(201).send(JSON.stringify(responseJson));
    }
    else {
	Device.findOne({ "deviceId": deviceIdFromParam }, function(err, device) {
	    if (device !== null) {
		if (device.apikey != req.body.apikey) {
		    responseJson.status = "ERROR";
		    responseJson.message = "Invalid apikey for device ID " + deviceIdFromParam + ".";
		    res.status(201).send(JSON.stringify(responseJson));
		}
		else if (device.userEmail != req.body.userEmail) {
                    responseJson.status = "ERROR";
                    responseJson.message = "Wrong user email for device ID " + deviceIdFromParam + ".";
                    res.status(201).send(JSON.stringify(responseJson));
                }
		else {
		// remove this device
		device.remove(function(err, removeDevice) { 
			if (err) {
                    	responseJson.status = "ERROR";
                    	responseJson.message = "Error deleting device in db.";
                    	res.status(201).send(JSON.stringify(responseJson));
                	}
                	else {
                    	responseJson.status = "OK";
                    	responseJson.message = "Device deleted in db with device ID "+ device.deviceId + ".";
                    	res.status(201).send(JSON.stringify(responseJson));
			}
		});
	    	}
	    }
	    else {
		responseJson.status = "ERROR";
		responseJson.message = "Device ID " + deviceIdFromParam + " not registered.";
		res.status(201).send(JSON.stringify(responseJson));	    
	    }
	});
     }
});


// POST registers a new device given the device ID and user email
router.post('/register', function(req, res, next) {

    var responseJson = {
        registered: false,
        message : "",
        apikey : "none"
    };
    var deviceExists = false;

    // Ensure the request includes both the deviceId and email parameters
    if( !req.body.hasOwnProperty("deviceId") || !req.body.hasOwnProperty("userEmail")) {
        responseJson.message = "Missing request parameters";
        res.status(400).send(JSON.stringify(responseJson));
        return;
    }

    // See if device is already registered
    Device.findOne({ deviceId: req.body.deviceId }, function(err, device) {
        if (device !== null) {
            responseJson.message = "Device ID " + req.body.deviceId + " already registered.";
            res.status(400).send(JSON.stringify(responseJson));
        }
        else {
            // Get a new apikey
	    deviceApikey = getNewApikey();
	    // Create a new device with specified id, user email, and randomly generated apikey.
            var newDevice = new Device({
                deviceId: req.body.deviceId,
                userEmail: req.body.userEmail,
                apikey: deviceApikey
            });

            // Save device. If successful, return success. If not, return error message.
            newDevice.save(function(err, newDevice) {
                if (err) {
                    console.log("Error: " + err);
                    responseJson.message = err;
                    res.status(400).send(JSON.stringify(responseJson));
                }
                else {
                    responseJson.registered = true;
                    responseJson.apikey = deviceApikey;
                    responseJson.message = "Device ID " + req.body.deviceId + " was registered.";
                    res.status(201).send(JSON.stringify(responseJson));
                }
            });
        }
    });
});

module.exports = router;


