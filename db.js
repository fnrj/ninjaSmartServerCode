var mongoose = require("mongoose");

var database = mongoose.connect("mongodb://localhost/sunsmart", {
   useMongoClient: true,
});

module.exports = mongoose;

