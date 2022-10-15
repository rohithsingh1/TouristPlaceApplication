var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({

    username: { type: String, minlength: 6, unique: true, required: true },
    password: { type: String, minlength: 6 },
    phonenumber: Number,
    avatar: String,
    email: { type: String, unique: true, required: true },
    resetPasswordToken: {
        type: String,
        required : false
    },
    registrationToken: {
        type: String,
        required: false,
    },
    registrationTokenExpires: {
        type: Date,
        required: false
    },
    resetPasswordExpires: {
        type: Date,
        required : false
    },
    isUser: { type: Boolean, default: false },
    isAdmin: { type: Boolean, default: false },
    google: {
        id: String,
        token:String,
        username:String,
        email: String,
        photo: String,
        isUser: { type: Boolean, default: true },
    }
});

UserSchema.plugin(passportLocalMongoose, {
    usernameField: "email"
});
//console.log(passportLocalMongoose);
module.exports = mongoose.model("User", UserSchema);
