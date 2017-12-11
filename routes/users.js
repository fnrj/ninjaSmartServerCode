var express = require('express');
var router = express.Router();
var Device = require("../models/device");
var User = require("../models/user");

// Function to generate a random apikey consisting of 32 characters
function getNewApikey() {
    var newApikey = "";
    var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    
    for (var i = 0; i < 32; i++) {
	   newApikey += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
    }
    return newApikey;
}


//<form action="http://localhost:3000/users/confirm/`+userEmail+`" method="POST">
// Function for sending email (account verification)
function sendMail(userEmail) {
    var endpoint1 = "http://ec2-13-58-6-147.us-east-2.compute.amazonaws.com/users/confirm/"; 
    var endpoint2 = "http://localhost:3000/users/confirm/"; 
    
    emailBody = `<b>Thanks for signing up for Sunsmart!</b> 
    To confirm your account, click the button below.
    <form action= "http://ec2-13-58-6-147.us-east-2.compute.amazonaws.com/users/confirm/`+userEmail+`" method="POST">
        <button type = "submit" name = "confirmation button">Confirm my account!</button>
    </form>`
    
    //http://localhost:3000/users/confirm

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

// GET request for checking if a user is already registered.
router.get('/lookup/:userEmail', function(req, res, next){
    User.find({userEmail : req.params.userEmail}, function(err, usr){
        if(err){
            return res.status(400).send(JSON.stringify({message: 'User query failed.'}));
        }
        if(usr.length == 0){
            res.status(200).send(JSON.stringify({'registered':false}));
        } else{
            res.status(200).send(JSON.stringify({'registered':true}));
        }
    });    
})

// POST registers a new device given the device ID and user email
router.post('/register', function(req, res, next) {
    var responseJson = {
        userDeviceRegistered: false,
        deviceMessage : "",
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
    // See if User is already registered
    User.findOne({ userEmail: req.body.userEmail }, function(err, user) {
        if (user !== null) {
            console.log('That user is already registered with sunsmart.');            
            responseJson.message = "User: " + req.body.userEmail + " is already registered with sunsmart!";
            res.status(400).send(JSON.stringify(responseJson));
        return;
        }
        else {
                var newUser = new User({
                userEmail: req.body.userEmail,
                password: req.body.password,
                active: false
            });
            console.log(newUser);
            newUser.save(function(err, newUser) {
                if (err) {
                    console.log("Error: " + err);
                    responseJson.message = err;
                    res.status(400).send(JSON.stringify(responseJson));
                }
                else {
                    console.log('sending email!');
                    //send verification email from sunsmart to activate account.
                    sendMail(req.body.userEmail);
                }
            });
            Device.findOne({deviceId: req.body.deviceId}, function(err,device){
                if (device !== null) {
                    console.log('That device is already registered with another user.');            
                    responseJson.message = "Device Id: " + req.body.deviceId + " is already registered with another user!";
                    res.status(400).send(JSON.stringify(responseJson));
                    return;
                }
                else {
                    // Get a new apikey
                    deviceApikey = getNewApikey();
                    // Create a new device with specified id, user email, and randomly generated apikey.
                    var newDevice = new Device({
                        apikey: deviceApikey,
                        deviceId: req.body.deviceId,
                        userEmail: req.body.userEmail,
                    });
                    console.log(newDevice);
                    // Save device. If successful, return success. If not, return error message.
                    newDevice.save(function(err, newDevice) {
                        if (err) {
                            console.log("Error: " + err);
                            responseJson.message = err;
                            res.status(400).send(JSON.stringify(responseJson));
                        }
                        else {
                            console.log('new device saved!');
                            responseJson.userDeviceRegistered = true;
                            responseJson.apikey = deviceApikey;
                            responseJson.deviceMessage = "User and its Device ID " + req.body.deviceId + " was registered.";
                            res.status(201).send(JSON.stringify(responseJson));
                        }
                    });
                }                
            });
        } 
    });
});

/* Confirm a user and activate their account */
router.post('/confirm/:email', function(req, res, next) {
    console.log('Attempting to activate account: ' + req.params.email);
    User.findOne({ userEmail: req.params.email }, function(err, acc) {
        if(!acc){
            console.log('That user does not exist! Cannot validate.');
            res.status(400).send(JSON.stringify({message: "Email is already validated or doesn't exist!"}));
        } else{
            acc.active = true; 
            acc.save(function(err, updatedAcc){
                if(err){
                    res.status(400).send(JSON.stringify({message: "Found your account, but could not update it."}))
                } else{
                    //res.status(201).send(JSON.stringify({message: "Your account has been successfully activated."})); 
                    // need to redirect to not give a 404, but maybe should have a confirmation page or something
                    res.redirect('/login.html');                      
                }
            })
        }
    });  
});

/* Create a session for the user. */
router.post('/dashboard', function(req, res, next){
    console.log(req.body);
    User.findOne({$and: [{userEmail: req.body.userEmail}, {password: req.body.password}]}, function(err, acc){
        if(!acc){
            res.status(400).send(JSON.stringify({message: "Invalid username or password!"}));
        } else if(!acc.active){
            res.status(400).send(JSON.stringify({message: "Account exists but is not activated!"}));
        } else{
            res.status(200).send(JSON.stringify({message: "Credentials are correct and validated!"}))
        }
    })
});

var jwt = require("jwt-simple");
var secret = "alexkylesteph513";
/* Intermediate route: form posts to auth. Redirect to dashboard if the user is logged in. */
router.post('/authenticate', function(req, res, next){
    console.log("Authenticate...");
    console.log(req.body.userEmail);
    console.log(req.body.password);
    User.findOne({$and: [{userEmail: req.body.userEmail}, {password: req.body.password}]}, function(err, acc){
        //first 2 cases need some kind of error handling, i.e. redirecting to login page
        if(!acc){
            return res.status(400).send(JSON.stringify({message: "Invalid username or password!"}));
        } else if(!acc.active){
            return res.status(400).send(JSON.stringify({message: "Account exists but is not activated!"}));
        } else{
           var token = jwt.encode({userEmail : req.body.userEmail}, secret);
            req.session.user = token;
 	    res.status(200).json({ token: token , redirect: '/dashboard.html'});
            //req.session.user = req.body.userEmail;
            //res.redirect('../dashboard.html');
        }
    });
})


/* Look up the user account to determine status of login attempt */
router.get('/:email/:password', function(req, res, next){
     
    User.findOne({$and: [{userEmail: req.params.email}, {password: req.params.password}]}, function(err, acc){
        if(!acc){
            return res.status(200).send(JSON.stringify({message: "invalid"}));
        } else if(!acc.active){
            return res.status(200).send(JSON.stringify({message: "inactive"}));
        } else{
            return res.status(200).send(JSON.stringify({message: "validated"}))
        }
    });
})



/* DELETE request for removing a user from the database*/
router.delete('/remove/:email', function(req, res, next){
    Device.remove({userEmail: req.params.email}, function(err){
        if(err){
            res.status(400).send(JSON.stringify({message: "Could not complete your request."}));
        } else{
            res.status(200).send(JSON.stringify({message: "User deleted."}));
        }
    })
});

/* GET request for retrieving all users form the database */
router.get('/searching', function(req, res, next){
    User.find({}, function(err, acc){
        res.status(200).send(JSON.stringify(acc));
    }); 
})


/*Request for extracting the user from the database*/
router.get('/current', function(req, res, next){
    if(req.session.user){
	var decoded = jwt.decode(req.session.user, secret);
        return res.status(200).send(JSON.stringify({user: decoded.userEmail}));
        //return res.status(200).send(JSON.stringify({user: req.session.user}));
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
    if (!req.headers["x-auth"] ) { 
        return res.status(401).json({error: "Missing X-Auth header"});
    }
    var token = req.headers["x-auth"];
    var decoded = jwt.decode(token, secret);
    if(!req.session.user ||
         req.session.user!==token
	){
        return res.status(400).send(JSON.stringify({'message':'User is not logged in!'}));
    }
    User.findOne({userEmail:decoded.userEmail}, function(err, acc){    
	//User.findOne({userEmail:req.session.user}, function(err, acc){
        //if query fails return 400 - this will kick out to login.html
        if(err || !acc){
            return res.status(400).send(JSON.stringify({message: "Query failed! Check log in."}));
        } else{
            return res.status(200).send(JSON.stringify(
                {devices: acc.devices, 
                 userEmail: acc.userEmail, 
                 password: Array(acc.password.length + 1).join("*"),  
                 message: "Successful login"}
            ));            
        }
    });
})

/* Get all of the user's devices*/
router.get('/devices', function(req, res, next){
    
    if (!req.headers["x-auth"] ) { 
     	return res.status(401).json({error: "Missing X-Auth header"});
    }
    var token = req.headers["x-auth"];
    var decoded = jwt.decode(token, secret);
    var decoded = jwt.decode(req.session.user, secret);
    if(!req.session.user ||
        req.session.user!==token
	){
        return res.status(400).send(JSON.stringify({'message':'User is not logged in!'}));
    }
    //Device.find({userEmail : req.session.user}, {deviceId:1, _id:0}, function(err, devices){
    //Now each user only has one device, list last 5 recent data 
    Device.find({userEmail : decoded.userEmail}).sort({ "lastContact": "desc" }).limit(5).exec( function(err, devices){
        if(err){
            return res.status(400).send(JSON.stringify({'message': 'Query failed. Could not look up user.'}))
        } else{
            return res.status(200).send({devices: devices});
        }
    })
    
})


/* Update the user's password */
router.put('/updatePassword', function(req, res, next){
    if( !req.body.hasOwnProperty("oldPassword") || !req.body.hasOwnProperty("newPassword1") || !req.body.hasOwnProperty("newPassword2")) {
        return res.status(400).send(JSON.stringify({'message':'Did not fill out password fields correctly!'})); //also checked on front end 
    }
    if (!req.headers["x-auth"] ) { 
        return res.status(401).json({error: "Missing X-Auth header"});
    }
    var token = req.headers["x-auth"];
    var decoded = jwt.decode(token, secret);
    if(!req.session.user ||
         req.session.user!==token
	){
        return res.status(400).send(JSON.stringify({'message':'User is not logged in!'}));
    }
    if(req.body.newPassword1 != req.body.newPassword2){
        return res.status(400).send(JSON.stringify({'message': 'Passwords do not match!'}));
    }

    User.findOneAndUpdate({userEmail:decoded.userEmail}, { $set: { password: req.body.newPassword1 } }, function(err, acc) {
        if(err){
            return res.status(400).send(JSON.stringify({message: 'Could not look up the session user.'}));
        } else{
            if(req.body.oldPassword != acc.password){
                return res.status(400).send(JSON.stringify({message: 'Invalid password entered.'}));
            }
            return res.status(200).send(JSON.stringify({message: 'Your password was updated'}));
        }
    });    

})

/* Delete a device for the user */
router.delete('/removeDevice', function(req, res, next){
    	if (!req.headers["x-auth"] ) { 
        	return res.status(401).json({error: "Missing X-Auth header"});
    	}
    	var token = req.headers["x-auth"];
    	var decoded = jwt.decode(token, secret);
	if(!req.session.user||
         req.session.user!==token
	){  	
        	return res.status(400).send(JSON.stringify({'message': 'User is not logged in!'}));
    	}	
 	Device.remove({userEmail:decoded.userEmail}, function(err){
        if(err){
            res.status(400).send(JSON.stringify({message: "Could not complete your request."}));
        } else{
            res.status(200).send(JSON.stringify({message: "All photon data deleted."}));
        }
    })
});




/* Add a device for an existing user */
router.post('/addDevice', function(req, res, next){
    if (!req.headers["x-auth"] ) { 
        return res.status(401).json({error: "Missing X-Auth header"});
    }
    var token = req.headers["x-auth"];
    var decoded = jwt.decode(token, secret);
    if(!req.session.user ||
         req.session.user!==token
	){    
        return res.status(400).send(JSON.stringify({'message': 'User is not logged in!'}));
    }
    
    Device.findOne({deviceId: req.body.newDevice}, function(err, device){
        if(device !== null){
            console.log(device);
            return res.status(400).send(JSON.stringify({'message': 'that device is already registered.'}));
        } else{
            deviceApikey = getNewApikey();
            var newDevice = new Device({
                apikey: deviceApikey,
                //deviceId: req.body.deviceId,
                deviceId: req.body.newDevice,
                userEmail: decoded.userEmail
            });          
            newDevice.save(function(err, newDevice){
                if(err){
                    return res.status(400).send(JSON.stringify({'message':err}));                    
                } else{
                    return res.status(201).send(JSON.stringify({'message':'Device added!', 'deviceId':req.body.newDevice, 'apikey':newDevice.apikey}));
                }
            })
        }
    });
})

router.get('/usersession/graph/data', function(req, res, next){
        
    if (!req.headers["x-auth"] ) { 
        return res.status(401).json({error: "Missing X-Auth header"});
    }
    var token = req.headers["x-auth"];
    var decoded = jwt.decode(token, secret);
    if(!req.session.user ||
         req.session.user!==token
	){    
        return res.status(400).send(JSON.stringify({'message': 'User is not logged in!'}));
    }
    
    console.log('TO QUERY POINTS')
    var data = [1,2,3,1,2,1,1,2,1,1,2,2] // example data extension for filling with white
    
    //retrieve user's devices sorted by logged time
    User.findOne({userEmail : decoded.userEmail}, function(err, user){
        if(err){
            return res.status(400).send(JSON.stringify({'message':err}));                                
        }else{
            return res.status(200).send(JSON.stringify({'uv':data, 'colors':extend(user.colors, data)}))
        }
    })
})

function extend(colors, data){
    /* Extend the users colors up the same length as data with white nodes*/
    while(colors.length < data.length){
        colors.push('white');
    }
    return colors;
}

function rawToUVI(devices){
    var UVI = [];
    for(var i = 0; i < devices.length; i++){
        UVI.append(/* Conversion equation goes here */);
    }
    return UVI;
}

/* Save the colors of the graph */
router.post('/usersession/graph/colors', function(req, res, next){
    if (!req.headers["x-auth"] ) { 
        return res.status(401).json({error: "Missing X-Auth header"});
    }
    var token = req.headers["x-auth"];
    var decoded = jwt.decode(token, secret);
    if(!req.session.user ||
         req.session.user!==token
	){    
        return res.status(400).send(JSON.stringify({'message': 'User is not logged in!'}));
    }
    
    User.findOneAndUpdate({userEmail:decoded.userEmail}, {$set : {colors : req.body.colors}}, function(err, usr){
        if(!usr){
            return res.status(400).send(JSON.stringify({'message': 'Could not find user.'}));
        } else if(err){
            console.log(err);
            return res.status(400).send(JSON.stringify({'message': 'User lookup failed.'}));
        } else{
            return res.status(201).send(JSON.stringify({'message': 'Colors have been updated'}));
        }
    })    
})




module.exports = router;