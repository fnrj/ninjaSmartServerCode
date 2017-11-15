var db = require("../db");

var deviceSchema = new db.Schema({
    apikey:       String,
    deviceId:     String,
    userEmail:    String,
    lastContact:  { type: Date, default: Date.now },
    longitude:	Number,
    latitude:	Number,
    uv:		Number, //(aggregated from last 10 mins)
    zipCode:	Number,// nearby zipCode from google Geocoding
    address: 	String //(nearby address from google Geocoding)
});

var Device = db.model("Device", deviceSchema);

module.exports = Device;
