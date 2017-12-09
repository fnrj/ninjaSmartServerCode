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



// Function for sending email (account verification)
function sendMail(userEmail) {
    var emailBody = `<b>Thanks for signing up for Sunsmart!</b> 
    To confirm your account, click the button below.
    <form action="http://localhost:3000/devices/confirm/`+userEmail+`" method="POST">
        <button type = "submit" name = "confirmation button">Confirm my account!</button>
    </form>`;

    var transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: 'sunsmart.ece513@gmail.com',
            pass: 'IoT2017!'
        }
    });
    console.log('transporter created.');
    var options = {
        subject: 'Sunsmart Account Registration',
        from: '"Sunsmart Team" <sunsmart.ece513@gmail.com>',
        to: userEmail,
        text: 'Welcome to Sunsmart!',
        html: emailBody        
    }
    console.log('configured. Sending.');

    transporter.sendMail(options, function(err, info){
        if(err){
            return console.log(err);
        } else{
            console.log('Message was sent successfully to %s', userEmail);
        }
    })
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
        console.log('missing properties');
        responseJson.message = "Missing request parameters";
        res.status(400).send(JSON.stringify(responseJson));
        return;
    }

    // See if device is already registered
    Device.findOne({ userEmail: req.body.userEmail }, function(err, device) {
        if (device !== null) {
            console.log('That user is already registered with sunsmart.');            
            responseJson.message = "User: " + req.body.userEmail + " is already registered with sunsmart!";
            res.status(400).send(JSON.stringify(req.body));
        }
        else {
            // Get a new apikey
	        deviceApikey = getNewApikey();
	        // Create a new device with specified id, user email, and randomly generated apikey.
            var newDevice = new Device({
                apikey: deviceApikey,
                devices: [],
                userEmail: req.body.userEmail,
                password: req.body.password,
                active: false
            });
            newDevice.devices.push(req.body.deviceId);
            console.log(newDevice);

            // Save device. If successful, return success. If not, return error message.
            newDevice.save(function(err, newDevice) {
                if (err) {
                    console.log("Error: " + err);
                    responseJson.message = err;
                    res.status(400).send(JSON.stringify(responseJson));
                }
                else {
                    console.log('sending email!');
                    //send verification email from sunsmart to activate account.
                    sendMail(req.body.userEmail);

                    responseJson.registered = true;
                    responseJson.apikey = deviceApikey;
                    responseJson.message = "Device ID " + req.body.deviceId + " was registered.";
                    res.status(201).send(JSON.stringify(responseJson));
                }
            });
        }
    });
});

// Confirm a user and activate their account (can't use put from straight HTML)
router.post('/confirm/:email', function(req, res, next) {
    Device.findOne({ userEmail: req.params.email }, function(err, acc) {
        if(!acc){
            console.log('That user does not exist! Cannot validate.');
            res.status(400).send(JSON.stringify({message: "Email is already validated or doesn't exist!"}));
        } else{
            acc.active = true; 
            acc.save(function(err, updatedAcc){
                if(err){
                    res.status(400).send(JSON.stringify({message: "Found your account, but could not update it."}))
                } else{
                    res.status(201).send(JSON.stringify({message: "Your account has been successfully activated."}));                    
                }
            })
        }
    });
    // need to redirect to not give a 404, but maybe should have a confirmation page or something
    //res.redirect('/login.html');    
});



/* Intermediate route: form posts to auth. Redirect to dashboard if the user is logged in. */
router.post('/authenticate', function(req, res, next){
    Device.findOne({$and: [{userEmail: req.body.userEmail}, {password: req.body.password}]}, function(err, acc){
        //first 2 cases need some kind of error handling, i.e. redirecting to login page
        if(!acc){
            return res.status(400).send(JSON.stringify({message: "Invalid username or password!"}));
        } else if(!acc.active){
            return res.status(400).send(JSON.stringify({message: "Account exists but is not activated!"}));
        } else{
            req.session.user = req.body.userEmail;
            res.redirect('../dashboard.html');
        }
    });
})


router.put('/add_device/:newDeviceID', function(req, res, next){
    //make sure user is signed in
    req.session.user = "abrooks9944@email.arizona.edu";
    if(!req.session.user){
        return res.status(400).send(JSON.stringify({message: "User is not logged in!"}));
    }
    Device.findOne({devices: req.params.newDeviceID}, function(err, owner){
        //device is not assigned to a used
        if(!owner){
            //check if user is logged in
            Device.findOne({userEmail : req.session.user}, function(err, usr){
                //err will not occur; user needs to authenticate with db to get here
                usr.devices.push(req.params.newDeviceID);
                return res.status(200).send(JSON.stringify({devices: usr.devices}));
            })
        } else{
            return res.status(400).send(JSON.stringify({message: "Device is already registered!"}));
        }
    });

})






/*************************************************************************
 *                              DEBUGGING ROUTES                         *                             
 *************************************************************************/
// DELETE request for removing a user from the database
router.delete('/remove/:email', function(req, res, next){
    Device.remove({userEmail: req.params.email}, function(err){
        if(err){
            res.status(400).send(JSON.stringify({message: "Could not complete your request."}));
        } else{
            res.status(200).send(JSON.stringify({message: "User deleted."}));
        }
    })
});

// GET request for retrieving all users form the database
router.get('/search', function(req, res, next){
    Device.find({}, function(err, acc){
        res.status(200).send(JSON.stringify(acc));
    }); 
})

/*Request for extracting the user from the database*/
router.get('/user', function(req, res, next){
    if(req.session.user){
        return res.status(200).send(JSON.stringify({user: req.session.user}));
    }else{
        return res.status(200).send(JSON.stringify({message: "No user!"}));
    }
})

/*Destroys an existing session*/
router.get('/logout', function(req, res, next){
    req.session.destroy();
})

/*Force redirect user out of the dashboard if they are not logged in.*/
router.get('/profile', function(req, res, next){
    Device.findOne({userEmail:req.session.user}, function(err, acc){
        //if query fails return 400 - this will kick out to login.html
        if(err || !acc){
            return res.status(400).send(JSON.stringify({message: "Query failed! Check log in."}));
        } else{
            console.log(acc.password);
            console.log(acc.password.length);
            return res.status(200).send(JSON.stringify(
                {devices: acc.devices, 
                 userEmail: acc.userEmail, 
                 password: Array(acc.password.length + 1).join("*"),  
                 message: "Successful login"}
            ));            
        }
    });
})


/*************************************************************************
 *                         END  DEBUGGING ROUTES                         *                             
 *************************************************************************/


module.exports = router;


