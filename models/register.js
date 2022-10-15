var mongoose = require("mongoose");


var RegisterSchema = new mongoose.Schema({
    username: {type: String, unique: true, required: true},
    avatar: String,
    firstName: String,
    lastName: String,
    email: {type: String, unique: true, required: true}
});

//console.log(passportLocalMongoose);
module.exports = mongoose.model("Register", RegisterSchema);