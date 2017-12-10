var db = require("../db");

var userSchema = new db.Schema({
    userEmail:    String,
    active:       Boolean, 
    password:     String, //make me more secure when hashing is added!
    lastContact:  { type: Date, default: Date.now },
});


var User = db.model("User", userSchema);

//User.remove({}, function(){});

module.exports = User;