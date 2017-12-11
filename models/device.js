var db = require("../db");

//Device GPS settings are set to Tucson by default.

var deviceSchema = new db.Schema({
    apikey:       String,
    deviceId:     String, 
    userEmail:    String,
    loggedTime:   { type: Date, default: Date.now },
    lastContact:  { type: Date, default: Date.now },
    latitude:	{type: Number, default: 32.2217},
    longitude:	{type: Number, default: -110.9275}, 
    uv:		Number, //(aggregated from last 10 mins)
    zipCode:	{type: Number, default: 80027}, // nearby zipCode from google Geocoding
    address: 	String, //(nearby address from google Geocoding)
});


var Device = db.model("Device", deviceSchema);

//Device.remove({}, function(){});


module.exports = Device;
