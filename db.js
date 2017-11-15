var mongoose = require("mongoose");

mongoose.connect("mongodb://localhost/mydb", {
   useMongoClient: true,
});

module.exports = mongoose;

