var mongoose = require("mongoose");
var PictureSchema =  mongoose.Schema({
   images : String,
   createdAt: { type: Date, default: Date.now },
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    }
});
module.exports = mongoose.model("Picture", PictureSchema);