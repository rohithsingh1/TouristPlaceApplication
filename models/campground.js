var mongoose = require("mongoose");

var campgroundSchema = new mongoose.Schema({
   name: String,
   image: String,
   title: String,
   fileimage: String,
   description: String,
   cost: Number,
   url: String,
   createdAt: { type: Date, default: Date.now },
   location: String,
   lat: Number,
   lng: Number,
   phonenumber: Number,
   Quantity: { type: Number, default: 0 },
   createdby: { type: Boolean, default: false },
   author: {
      id: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User"
      },
      username: String
   },
   comments: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Comment"
      }
   ],
   pictures: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Picture"
      }
   ],
   register: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Register"
      }
   ],
   reviews: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Review"
      }
   ],
   rating: {
      type: Number,
      default: 0
   }
});

module.exports = mongoose.model("Campground", campgroundSchema);