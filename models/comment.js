var mongoose = require("mongoose");

var commentSchema = mongoose.Schema({
    text: String,
    createdAt: { type: Date, default: Date.now },
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    campgrounds: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Campground"
    }
},{
    timestamps: true
});

module.exports = mongoose.model("Comment", commentSchema);