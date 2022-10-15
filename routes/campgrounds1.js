var express = require("express"),
    router = express.Router(),
    cloudinary = require('cloudinary'),
    upload = require("../upload/cloudinary").upload,
    middleware = require("../middleware"),
    request = require("request"),
    fetch = require('node-fetch'),
    Campground = require("../models/campground"),
    CampgroundCart = require("../models/CampgroundCart");
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
//INDEX - show all campgrounds
router.get("/", middleware.isLoggedIn, function (req, res) {
    var perPage = 8;
    var outside;
    var pageQuery = parseInt(req.query.page);
    var pageNumber = pageQuery ? pageQuery : 1;
    if (req.query.search) {
        console.log("req.query.serach", req.query.search);
        var search = req.query.search;
        var noMatch = null;
        var campground_name = new RegExp(escapeRegex(req.query.search), 'gi');
        Campground.find({ $or: [{ name: campground_name }, { "author.username": campground_name }, { location: campground_name }] }).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, allCampgrounds) {
            Campground.count({ $or: [{ name: campground_name }, { "author.username": campground_name }, { location: campground_name }] }).exec(function (err, count) {
                console.log("newly created", allCampgrounds);
                if (err) {
                    console.log(err);
                    res.redirect("back");
                } else {
                    if (allCampgrounds.length < 1) {
                        //noMatch = "No TourCamp Match, please try again";
                        var placesearch = "https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input= " + req.query.search + "&inputtype=textquery&fields=photos,formatted_address,name,rating,opening_hours,place_id,plus_code,geometry&key=" + process.env.GOOGLE_PLACES_API_KEY;
                        //console.log(placesearch);
                        request(placesearch, function (error, response, body) {
                            if (!error && response.statusCode == 200) {
                                var data = JSON.parse(body);
                                //console.log("place_api", data);
                                var name = data.candidates[0].name;
                                var location = data.candidates[0].formatted_address;
                                var lat = data.candidates[0].geometry.location.lat;
                                var lng = data.candidates[0].geometry.location.lng;
                                var author = {
                                    id: req.user._id,
                                    username: req.user.username
                                }
                                var length = data.candidates[0].photos[0];
                                if (length) {
                                    var place_photos_height = data.candidates[0].photos[0].height;
                                    var place_photos_reference = data.candidates[0].photos[0].photo_reference;
                                    var place_photos_width = data.candidates[0].photos[0].width;
                                    var place_photos = "https://maps.googleapis.com/maps/api/place/photo?maxwidth=" + place_photos_width + "&photoreference=" + place_photos_reference + "&key=" + process.env.GOOGLE_PLACES_API_KEY;
                                    //console.log(place_photos);
                                }
                                var place_id = data.candidates[0].place_id;
                                request(place_photos, function (error, response, body) {
                                    if (!error && response.statusCode == 200) {
                                        var createdby = 'true';
                                        var newCampground = { name: name, createdby: createdby, location: location, author: author };
                                        Campground.create(newCampground, function (err, newlyCreated) {
                                            if (err) {
                                                req.flash("error", "Tourcamp not found!!!");
                                                res.redirect("back");
                                            } else {
                                                req.flash("success", "Successfully updated the campgrounds list!!!!");
                                                //console.log("newlycreated,", newlyCreated);
                                                Campground.find({ $or: [{ name: newlyCreated.name }, { location: newlyCreated.location }] }).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, allCampgrounds) {
                                                    Campground.count({ $or: [{ name: newlyCreated.name }, { location: newlyCreated.location }] }).exec(function (err, count) {
                                                        if (err) {
                                                            //console.log(err);
                                                            res.redirect("back");
                                                        } else {
                                                            return res.render("campgrounds/index", {
                                                                campgrounds: allCampgrounds,
                                                                current: pageNumber,
                                                                pages: Math.ceil(count / perPage),
                                                                noMatch: noMatch,
                                                                search: req.query.search
                                                            });
                                                        }
                                                    });
                                                });
                                            }
                                        });
                                    }
                                });

                            }
                        });
                    } else {
                        res.render("campgrounds/index", {
                            campgrounds: allCampgrounds,
                            current: pageNumber,
                            pages: Math.ceil(count / perPage),
                            noMatch: noMatch,
                            search: req.query.search
                        });
                        console.log("all campgrouds", allCampgrounds);
                    }
                }
            });
        });
    } else {
        // get all campgrounds from DB
        Campground.find({ createdby: 'true' }).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, allCampgrounds) {
            Campground.count().exec(function (err, count) {
                if (err) {
                    req.flash("error", "Campground not found!!!");
                    res.redirect("back");
                } else {
                    console.log('all campgrounds = ',allCampgrounds)
                    res.render("campgrounds/index", {
                        campgrounds: allCampgrounds,
                        current: pageNumber,
                        pages: Math.ceil(count / perPage),
                        noMatch: noMatch,
                        search: false
                    });
                }
            });
        });
    }
});
router.get("/new", middleware.isLoggedIn, function (req, res) {
    res.render("campgrounds/new");
});
router.post("/", middleware.isLoggedIn, function (req, res) {
    let name = req.body.name;
    let image = "";
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var cost = req.body.cost;
    var location = req.body.location;
    var newCampground = { name: name, image: image, description: desc, location: location, cost: cost, author: author };
    Campground.create(newCampground, function (err, newlyCreated) {
        if (err) {
            req.flash("error", "Tourcamp not found!!!");
            res.redirect("back");
        } else {
            req.flash("success", "Soon be added to campgrounds list!!!!");
            res.render("campgrounds/Addimage", { campground: newlyCreated });
        }
    });
});
router.get("/notifications", middleware.isRegistered, middleware.isLoggedIn, function (req, res) {
    Campground.find({ createdby: 'false' }, function (err, foundCampground) {
        if (err) {
            req.flash("error", "TourCamp not found!!!");
            res.redirect("back");
        } else {
            res.render("campgrounds/notifications", { campgrounds: foundCampground });
        }
    });
});


function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};
module.exports = router;