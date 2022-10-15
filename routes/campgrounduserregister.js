var express = require("express"),
    router = express.Router({ mergeParams: true }),
    middleware = require("../middleware"),
    Campground = require("../models/campground"),
    User = require("../models/user"),
    CampgroundCart = require("../models/CampgroundCart");

router.get("/:userid/new", middleware.isRegistered, middleware.isLoggedIn, function (req, res) {
    var campgroundsId = req.params.id;
    var registerId = req.params.userid;
    Campground.findById(campgroundsId, function (err, foundCampground) {
        if (err) {
            req.flash("error", "Something Went Wrong!!");
            res.redirect("/campgrounds/" + campgroundsId);
        } else {
            User.findById(registerId, function (err, foundUser) {
                if (err) {
                    req.flash("error", "Something Went Wrong!!");
                    res.redirect("/campgrounds/" + campgroundsId);
                } else {
                    if (!req.session.campgroundcart) {
                        res.render("register/new", { campground: foundCampground, user: foundUser });
                    } else {
                        var count = 0;
                        var campgroundcart = new CampgroundCart(req.session.campgroundcart);
                        var data = campgroundcart.generateArray();
                        for (var i = 0; i < data.length; i++) {
                            var break_state = 'false';
                            var size = data[i].newregister.length;
                            for (var j = 0; j < size; j++) {
                                if ((data[i].newregister[j] == registerId) && (data[i].campgroundid == campgroundsId)) {
                                    count++;
                                    break_state = 'true';
                                    break;
                                }
                            }
                            if (break_state === 'true') {
                                break;
                            }
                        }
                        if (count === 1) {
                            req.flash("error", "you already registered!!!!");
                            return res.redirect("/campgrounds/" + campgroundsId);
                        } else {
                            req.flash("success", "you will be registered soon !!!");
                            return res.render("register/new", { campground: foundCampground, user: foundUser });
                        }
                    }
                }
            });
        }
    });
});
router.put("/:userid", function (req, res) {
    var campgroundsId = req.params.id;
    var register1 = {
        username: req.body.username,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        avatar: req.body.avatar
    };
    Campground.findById(campgroundsId, function (err, foundCampground) {
        if (err) {
            req.flash("error", "Something Went Wrong!!");
            res.redirect("/campgrounds/" + campgroundsId);
        } else {
            User.findByIdAndUpdate(req.params.userid, register1, function (err, foundUser) {
                if (err) {
                    req.flash("error", "Something Went Wrong!!");
                    res.redirect("/campgrounds/" + campgroundsId);
                } else {
                    var registerid = req.params.userid;
                    //var cart = new Cart(req.session.cart ? req.session.cart : {newuser: {}});
                    var campgroundcart = new CampgroundCart(req.session.campgroundcart ? req.session.campgroundcart : {});
                    campgroundcart.add(campgroundsId, registerid, foundUser);
                    campgroundcart.duplicateadd(campgroundsId, registerid, foundUser);
                    campgroundcart.idarray(campgroundsId);
                    req.session.campgroundcart = campgroundcart;
                    //var keys = Object.keys(req.session.campgroundcart.campground);
                    req.flash("success", "you will be registered soon !!!");
                    res.redirect("/campgrounds/" + campgroundsId);
                }
            });
        }
    });
});
module.exports = router;