var db = require("../db");

var userSchema = new db.Schema({
    userEmail:    String,
    active:       Boolean, 
    password:     String, //make me more secure when hashing is added!
    lastContact:  { type: Date, default: Date.now },
});

//function deviceCheck(arr){
	/* Check that all devices registered to a user are unique and that all users
	 * are registered to at least one device. */
//	return (arr === undefined || arr.length == 0) && (arr.length == new Set(arr).size);
//}

var User = db.model("User", userSchema);

module.exports = User;