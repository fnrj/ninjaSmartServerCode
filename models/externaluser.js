var db = require("../db");


/*External users are those using the Sunsmart Api*/

var externalUserSchema = new db.Schema({
    userEmail:    String,
    apikey:       String,
    keyDate:  { type: Date, default: Date.now },
    active:       Boolean //deactivate API Key XX days of use 
});


var ExternalUser = db.model("ExternalUser", externalUserSchema);

module.exports = ExternalUser;



