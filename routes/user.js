var express = require("express"),
    router = express.Router(),
    cloudinary = require('cloudinary').v2,
    middleware = require("../middleware"),
    upload = require("../upload/cloudinary").upload,
    Campground = require("../models/campground"),
    Comment = require("../models/comment"),
    Review = require("../models/rating"),
    User = require("../models/user");

cloudinary.config({ 
  cloud_name: 'def8dtkmv', 
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// USER PROFILE
router.get("/:id", middleware.isLoggedIn, function (req, res) {
    User.findById(req.params.id, function (err, foundUser) {
        if (err) {
            req.flash("error", "Something went wrong.");
            res.redirect("back");
        }
        Campground.find().where('author.id').equals(foundUser._id).exec(function (err, campgrounds) {
            if (err) {
                req.flash("error", "Something went wrong.");
                res.redirect("back");
            } else {
                Comment.find().where('author.id').equals(foundUser._id).exec(function (err, comments) {
                    if (err) {
                        req.flash("error", "Something went wrong.");
                        res.redirect("back");
                    } else {
                        Review.find().where('author.id').equals(foundUser._id).exec(function (err, reviews) {
                            if (err) {
                                req.flash("error", "Something went wrong.");
                                res.redirect("back");
                            } else {
                                // console.log(foundUser);
                                // console.log(campgrounds);
                                // console.log(comments);
                                // console.log(reviews);
                                res.render("users/show", { user: foundUser, campgrounds: campgrounds, comments: comments, reviews: reviews });
                            }
                        });
                    }
                });
            }

        })
    });
});
router.post("/AddImage/:userid", upload.single('photo'), function (req, res) {
    var userid = req.params.userid;
    User.findById(userid, function (err, foundUser) {
        if (err) {
            req.flash("error", "Can not find User");
            res.redirect("back");
        } else {
            if (!req.file) {
                var image = foundUser.avatar = req.body.images;
                var userimage = { avatar: image };
                User.findByIdAndUpdate(foundUser._id, userimage, function (err, foundUser1) {
                    if (err) {
                        req.flash("error", "Image can not be updated!!");
                        res.redirect("back");
                    } else {
                        req.flash("success", " image successfully updated!!!");
                        res.redirect("/users/" + foundUser1._id);
                    }
                });
            } else {
                cloudinary.uploader.upload(req.file.path, { timeout: 120000 }, function (error, result) {
                    if (error) {
                        req.flash("error", "Image can not be uploaded!!");
                        res.redirect("back");
                    } else {
                        var image = foundUser.avatar = result.secure_url;
                        var userimage = { avatar: image };
                        User.findByIdAndUpdate(foundUser._id, userimage, function (err, foundUser1) {
                            if (err) {
                                req.flash("error", "Image can not be updated!!");
                                res.redirect("back");
                            } else {
                                req.flash("success", " image successfully updated!!!");
                                res.redirect("/users/" + foundUser1._id);
                            }
                        });
                    }
                });
            }
        }
    });
});
module.exports = router;