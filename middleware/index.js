var Comment = require("../models/comment");
var Campground = require("../models/campground");
var User = require("../models/user");
module.exports = {
    isLoggedIn: function (req, res, next) {
        //console.log("req.user===============", req.user);
        if (req.isAuthenticated()) {
            User.find({ isUser: 'true' }, function (err, founduser) {
                if (founduser.length > 0) {
                    return next();
                } else {
                    req.flash("error", "You must Verify your account to do that");
                    return res.redirect("/login");
                }
            });
        } else {
            req.flash("error", "You must be signed in to do that!");
            res.redirect("/login");
        }
    },
    isRegistered: function (req, res, next) {
        return next();
    },
    checkUserCampground: function (req, res, next) {
        if (req.isAuthenticated()) {
            Campground.findById(req.params.id, function (err, campground) {
                if (campground.author.id.equals(req.user._id) || req.user.isAdmin) {
                    next();
                } else {
                    req.flash("error", "You don't have permission to do that!");
                    res.redirect("/campgrounds/" + req.params.id);
                }
            });
        } else {
            req.flash("error", "You need to be signed in to do that!");
            res.redirect("/login");
        }
    },
    checkUserComment: function (req, res, next) {
        if (req.isAuthenticated()) {
            Comment.findById(req.params.commentId, function (err, comment) {
                if (comment.author.id.equals(req.user._id) || req.user.isAdmin) {
                    next();
                } else {
                    req.flash("error", "You don't have permission to do that!");
                    res.redirect("/campgrounds/" + req.params.id);
                }
            });
        } else {
            req.flash("error", "You need to be signed in to do that!");
            res.redirect("login");
        }
    }
}