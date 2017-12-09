var db = require("../db");

var deviceSchema = new db.Schema({
    apikey:       String,
    deviceId:     String, //{[String], validate: [deviceCheck, 'Invalid device configuration!']}, 
    userEmail:    String,
    loggedTime:   { type: Date, default: Date.now },
    lastContact:  { type: Date, default: Date.now },
    longitude:	Number,
    latitude:	Number,
    uv:		Number, //(aggregated from last 10 mins)
    zipCode:	Number,// nearby zipCode from google Geocoding
    address: 	String //(nearby address from google Geocoding)
});

//function deviceCheck(arr){
	/* Check that all devices registered to a user are unique and that all users
	 * are registered to at least one device. */
//	return (arr === undefined || arr.length == 0) && (arr.length == new Set(arr).size);
//}

var Device = db.model("Device", deviceSchema);

module.exports = Device;
