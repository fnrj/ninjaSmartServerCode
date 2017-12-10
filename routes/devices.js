var express = require('express');
var router = express.Router();
var Device = require("../models/device");

// Documentation for endpoints at: https://docs.google.com/document/d/1JscD6zSzdL7VYqShu37UaFyvOF-uRN5BAqr-0ns_tkM/edit

// GET request to check if device is registered.
router.get('/:devid', function(req, res, next){
    Device.find({deviceId : req.params.devid}, function(err, dev){
        if(err){
            return res.status(400).send(JSON.stringify({message: 'Device query failed.'}));
        }
        if(dev.length == 0){
            res.status(200).send(JSON.stringify({'registered':false}));
        } else{
            res.status(200).send(JSON.stringify({'registered':true}));
        }
    });
})


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
        console.log(allDevices);
        if (err) {
            var errormsg = {"message": err};
            return res.status(400).send(JSON.stringify(errormsg));
        }
        else if(!allDevices.length){
            if(deviceId=="all"){ responseJson.message = "No device registered yet.";}
            else {responseJson.message = "Device ID " + deviceId + " not registered.";}
            return res.status(400).send(JSON.stringify(responseJson));
        }	    
        else {
            // Create JSON response consisting of an array of devices
            responseJson.message = "Return device info.";
            for (var doc of allDevices) {
                // For each found device add a new element to the array
                // with the device id and last contact time
                responseJson.devices.push({ "deviceId":   	doc.deviceId, 
                                "lastContact": 	doc.lastContact,
                                "loggedTime": 	doc.loggedTime,
                                "userEmail": 	doc.userEmail,
                                "longitude": 	doc.longitude,
                                "latitude": 	doc.latitude,
                                "uv": 		doc.uv,
                                "zipcode": 		doc.zipcode,
                                "address": 		doc.address});
            }
            return res.status(200).send(JSON.stringify(responseJson));
        }
    });
});


// PUT request from photon to update coordinates and UV exposure.
router.post('/status/:devid', function(req, res, next) {
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
    else if( !req.body.hasOwnProperty("loggedTime") ) {
        responseJson.status = "ERROR";
        responseJson.message = "Request missing data logged time.";
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
		    var newData = new Device({
                    //copy from original device data
                        apikey: device.apikey,
                        deviceId: device.deviceId,
                        userEmail: device.userEmail,
                    //new photon posted data
                    	lastContact: req.body.lastContact,
                    	loggedTime: req.body.loggedTime,
                    	longitude: req.body.longitude,
                    	latitude: req.body.latitude,
                    	uv: req.body.uv
                    });		

	     	    // update device data 
                    // Save device. If successful, return success. If not, return error message.                                                        
                    newData.save(function(err, updateDevice) {
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
    else if( !req.body.hasOwnProperty("loggedTime") ) {
        responseJson.status = "ERROR";
        responseJson.message = "Request missing data logged time.";
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
                    device.loggedTime = req.body.loggedTime;
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


          
                   
module.exports = router;
