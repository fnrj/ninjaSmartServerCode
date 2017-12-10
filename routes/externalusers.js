var request = require("request");
var express = require('express');
var router = express.Router();
var ExternalUser = require("../models/externaluser");
var Device = require("../models/device");
var User = require("../models/user");

//update me to be unique
function getNewApikey() {
    var newApikey = "";
    var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < 32; i++) {
	   newApikey += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
    }
    return newApikey;
}

router.post('/registerKey', function(req, res, next){
    var newKey = getNewApikey();
    var newUser = new ExternalUser({
        userEmail:req.body.userEmail,
        apikey:newKey,
        active: true
    });
    console.log(newUser);
    newUser.save(function(err, usr){
        if(err){
            res.status(400).send(JSON.stringify({message: 'Invalid request.'}));
        }         
        else{
            res.status(201).send(JSON.stringify({message: 'Successfully registered!', apikey: newKey}));
        }
    })
})

router.get('/display', function(req, res, next){
    ExternalUser.find({}, function(err, acc){
        res.status(200).send(JSON.stringify(acc));
    }); 
})


router.get('/weather', function(req, res, next){
    if(!req.query.hasOwnProperty("key")){
        return res.status(400).send(JSON.stringify({message: 'No API key specified!'}));
    }
    else{
        ExternalUser.find({apikey : req.query.key}, function(err, acc){
            if(!acc.length){
                return res.status(400).send(JSON.stringify({message : 'Invalid API key!'}))
            } 
            else{
                if(req.query.hasOwnProperty("zipcode")){
                    Device.find({zipCode : req.query.zipcode}, function(err, devs){
                    res.status(200).send(JSON.stringify(aggregate(devs)));
                })}
                else if(req.query.hasOwnProperty("lat") && req.query.hasOwnProperty("lon")){
                    Device.find({$and: [{latitude : req.query.lat}, {longitude: req.query.lon}]}, function(err, devs){
                    res.status(200).send(JSON.stringify(aggregate(devs)));
                })} 
                else{
                    res.status(400).send(JSON.stringify({message: 'invalid query parameters. See usage manual.'}));
                }                
            }
        })
    }
    
});


function aggregate(devices){
    var average = 0;
    var cnt = 0;
        
    for(var i = 0; i < devices.length; i++){
        //only count photons that are activated
        if(devices[i].hasOwnProperty('uv')){
            cnt += 1;
            average += devices[i].uv;
        }       
    }
    if(cnt > 0){
        return {'averageUV' : average/cnt};
    }else{
        return {'message' : 'No data to return! That area does not have any active photons'};
    }
    
}

//queryByWeatherAPI({zip:req.query.zipcode});
//queryByWeatherAPI({latitude: req.query.lat, longitude: req.query.lon});

/*

function queryByWeatherAPI(queryObject){
    // Query through the sunsmart interface via weatherbit
    var apikey = '&key=52643b0bc4584b828b5adfaf488c5013';
    var endpoint = 'https://api.weatherbit.io/v2.0/forecast/3hourly?';
    responseJSON = '';
    
    if(queryObject.hasOwnProperty('zip')){
        console.log('Querying by zip code');
        endpoint = endpoint + '&postal_code=' + queryObject.zip + '&country=US' + apikey;
    } else{
        console.log('Querying by latitude and longitude');
        endpoint = endpoint + '&lat=' + queryObject.latitude+ '&lon=' + queryObject.longitude + apikey;        
    }
    endpoint = 'https://api.weatherbit.io/v2.0/forecast/3hourly?city=Raleigh,NC' + apikey;

    request.get(endpoint, function(err, res, body){
        responseJSON = JSON.parse(body);
    })
}
*/

module.exports = router;


