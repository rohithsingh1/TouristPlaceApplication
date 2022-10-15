let express = require("express"),
    router = express.Router({ mergeParams: true }),
    cloudinary = require('cloudinary').v2,
    upload = require("../upload/cloudinary").upload,
    middleware = require("../middleware"),
    Campground = require("../models/campground"),
    User = require("../models/user"),
    Picture = require("../models/pictures"),
    Register = require("../models/register"),
    CampgroundCart=require("../models/CampgroundCart");
    
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken=process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

cloudinary.config({ 
  cloud_name: 'def8dtkmv', 
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// SHOW - shows more info about one campground
router.get("/", middleware.isRegistered, middleware.isLoggedIn, function (req, res) {
    var campgroundsId = req.params.id;
    Campground.findById(req.params.id).populate("comments pictures reviews").populate(
        {
            path: " comments reviews",
            options: { sort: { createdAt: -1 } }
        }
    ).exec(async function (err, foundCampground) {
        if (err) {
            req.flash("error", "TourCamp not found!!!");
            res.redirect("back");
        } else {
            // console.log('foundCampground.location = ',foundCampground.location);
            // const geoData = await geocoder.forwardGeocode({
            // query: foundCampground.location,
            // limit: 1
            // }).send()
            // console.log('geoData = ',geoData.body.features[0].geometry.coordinates)
            var timer = 0;
            // var url = "https://geocoder.api.here.com/6.2/geocode.json?app_id=" + process.env.APP_ID + "&" + "app_code=" + process.env.APP_CODE + "&searchtext=" + foundCampground.location;
            if (!req.session.campgroundcart) {
                res.render("campgrounds/show", { cartarray: null, timer: timer, campgroundcartarray: null, campground: foundCampground });
            } else {
                var campgroundcart = new CampgroundCart(req.session.campgroundcart);
                var campgroundcartarray = campgroundcart.generateArray();
                var campgroundids = campgroundcart.generatecampgroundids();
                for (var i = 0; i < campgroundcartarray.length; i++) {
                    if (campgroundids[i] == campgroundsId) {
                        var size = campgroundcartarray[i].newregister.length;
                        break;
                    }
                }
                res.render("campgrounds/show", { campgroundids: campgroundids, campground: foundCampground });
            }
        }
    });
});

router.get("/edit", middleware.isRegistered, middleware.checkUserCampground, function (req, res) {
    //find the campground with provided ID
    Campground.findById(req.params.id, function (err, foundCampground) {
        if (err) {
            req.flash("error", "TourCamp not found!!!");
            res.redirect("back");
        } else {
            //render show template with that campground
            res.render("campgrounds/edit", { campground: foundCampground });
        }
    });
});

router.put("/", upload.single('photo'), function (req, res) {
    //var lat = data.results[0].geometry.location.lat;
    //var lng = data.results[0].geometry.location.lng;
    //var location = data.results[0].formatted_address;
    var campgroundid = req.params.id;
    Campground.findById(campgroundid, function (err, foundCampground) {
        if (err) {
            req.flash("error", " Campground not found!!!");
            res.redirect("back");
        } else {
            if (!req.file) {
                var image = foundCampground.image = req.body.image;
                var newData = { name: req.body.name, image: image, description: req.body.description, location: req.body.location, cost: req.body.cost };
                Campground.findByIdAndUpdate(req.params.id, newData, function (err, campground) {
                    if (err) {
                        req.flash("error", "Campground can not be updated!!!!");
                        res.redirect("back");
                    } else {
                        req.flash("success", "Successfully Updated!");
                        res.redirect("/campgrounds/" + req.params.id);
                    }
                });
            } else {
                cloudinary.uploader.upload(req.file.path, { timeout: 120000 }, function (error, result) {
                    if (error) {
                        req.flash("error", " Image can not be uploaded!!!");
                        res.redirect("back");
                    } else {
                        var image = result.secure_url;
                        var newData = { name: req.body.name, image: image, description: req.body.description, location: req.body.location, cost: req.body.cost };
                        Campground.findByIdAndUpdate(campgroundid, newData, function (err, updatedcampground) {
                            if (err) {
                                req.flash("error", " Campground can not be updated!!!");
                                res.redirect("back");
                            } else {
                                req.flash("success", " image(file) successfully updated!!!");
                                res.redirect("/campgrounds");
                            }
                        });
                    }
                });
            }
        }
    });
});

router.delete("/", middleware.isRegistered, middleware.checkUserCampground, function (req, res) {
    Campground.findByIdAndRemove(req.params.id, function (err, campground) {
        if (err) {
            res.redirect("/campgrounds/" + req.params.id);
        }
        else {
            req.flash("success", "TourCamp successfully Deleted!!!");
            res.redirect("/campgrounds");
        }
    });
});



router.get("/create/:userid", middleware.isRegistered, middleware.isLoggedIn, function (req, res) {
    var campgroundid = req.params.id;
    var userid = req.params.userid;
    Campground.findById(campgroundid, function (err, foundCampground) {
        if (err) {
            req.flash("error", "TourCamp not found!!!!");
            res.redirect("back");
        } else {
            var created = foundCampground.createdby = 'true';
            var CampgroundQuantity = foundCampground.Quantity;
            CampgroundQuantity--;
            var newData = {
                createdby: created,
                Quantity: CampgroundQuantity
            };
            Campground.findByIdAndUpdate(campgroundid, newData, function (err, updated) {
                if (err) {
                    req.flash("error", "TourCamp not found!!");
                    res.redirect("back");
                } else {
                    req.flash("success", "Successfully added the Campgrounds");
                    res.redirect("/campgrounds/notifications");
                }
            });
        }
    });
});
router.get("/destroy/:userid", middleware.isLoggedIn, function (req, res) {
    var campgroundid = req.params.id;
    var userid = req.params.userid;
    Campground.findById(campgroundid, function (err, foundCampground) {
        if (err) {
            req.flash("error", "TourCamp not found!!!!");
            res.redirect("back");
        } else {
            var CampgroundQuantity = foundCampground.Quantity;
            CampgroundQuantity--;
            var newData = {
                Quantity: CampgroundQuantity
            };
            Campground.findByIdAndUpdate(campgroundid, newData, function (err, updated) {
                if (err) {
                    req.flash("error", "TourCamp not found!!");
                    res.redirect("back");
                } else {
                    Campground.findByIdAndRemove(campgroundid, function (err, foundCampground) {
                        if (err) {
                            req.flash("error", "tourCamp not found!!!");
                            res.redirect("back");
                        } else {
                            req.flash("error", "Successfully deleted the Campground");
                            res.redirect("/campgrounds/notifications");
                        }
                    });
                }
            });
        }
    });
});

router.get("/AddDescription", function (req, res) {
    var campgroundid = req.params.id;
    Campground.findById(campgroundid, function (err, foundCampground) {
        if (err) {
            req.flash("error", " Campground not found!!!");
            res.redirect("back");
        } else {
            res.render("campgrounds/AddDescription", { campground: foundCampground });
        }
    });
});

router.post("/AddDescription", function (req, res) {
    var campgroundid = req.params.id;
    Campground.findById(campgroundid, function (err, foundCampground) {
        if (err) {
            req.flash("error", " Campground not found!!!");
            res.redirect("back");
        } else {
            var desc = req.body.description;
            var cost = req.body.cost;
            var desccampground = { description: desc, cost: cost };
            Campground.findByIdAndUpdate(campgroundid, desccampground, function (err, descadded) {
                if (err) {
                    req.flash("error", " Campground not found!!!");
                    res.redirect("back");
                } else {
                    req.flash("success", " description successfully added!!!");
                    res.redirect("/campgrounds");
                }
            });
        }
    });
});

router.post("/Addimage", upload.single('photo'), function (req, res) {
    var campgroundid = req.params.id;
    Campground.findById(campgroundid, function (err, foundCampground) {
        if (err) {
            req.flash("error", " Campground not found!!!");
            res.redirect("back");
        } else {
            console.log('req.file = ',req.file)
            if (!req.file) {
                var image = foundCampground.image = req.body.image;
                var CampgroundQuantity = foundCampground.Quantity;
                CampgroundQuantity++;
                var imageCampground = { image: image, Quantity: CampgroundQuantity,createdby: true };
                Campground.findByIdAndUpdate(campgroundid, imageCampground, function (err, imageadded) {
                    if (err) {
                        req.flash("error", " Campground can not be updated!!!");
                        res.redirect("back");
                    } else {
                        console.log('imageAdded in campground = ',imageadded);
                        req.flash("success", " image successfully updated!!!");
                        res.redirect("/campgrounds");
                    }
                });
            } else {
                console.log('req.file.path = ',req.file.path);
                cloudinary.uploader.upload(req.file.path, { timeout: 120000 }, function (error, result) {
                    if (error) {
                        req.flash("error", " Image can not be uploaded!!!");
                        res.redirect("back");
                    } else {
                        var image = foundCampground.image = result.secure_url;
                        var CampgroundQuantity = foundCampground.Quantity;
                        CampgroundQuantity++;
                        var imageCampground = { image: image, Quantity: CampgroundQuantity,createdby: true };
                        Campground.findByIdAndUpdate(campgroundid, imageCampground, function (err, updatedcampground) {
                            if (err) {
                                req.flash("error", " Campground can not be updated!!!");
                                res.redirect("back");
                            } else {
                                console.log('updatedcampground = ',updatedcampground)
                                req.flash("success", " image(file) successfully updated!!!");
                                res.redirect("/campgrounds");
                            }
                        });
                    }
                });
            }
        }
    });
});
router.post("/addpictures/:userid", upload.single('photo'), function (req, res) {
    var campgroundid = req.params.id;
    var userid = req.params.userid;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    Campground.findById(campgroundid, function (err, foundCampground) {
        if (err) {
            req.flash("error", "Campground not found!!");
            res.redirect("/campgrounds/" + campgroundid);
        } else {
            User.findById(userid, function (err, foundUser) {
                if (err) {
                    req.flash("error", "User not found!!");
                    res.redirect("/campgrounds/" + campgroundid);
                } else {
                    if (!req.file) {
                        var images = req.body.images;
                        var pictures = {
                            images: images,
                            author: author
                        };
                        Picture.create(pictures, function (err, insertpictures) {
                            if (err) {
                                req.flash("error", "Pictures not found!!");
                                res.redirect("/campgrounds/" + campgroundid);
                            } else {
                                foundCampground.pictures.push(insertpictures);
                                foundCampground.save(function (err, picturesaved) {
                                    if (err) {
                                        req.flash("error", "Pictures not saved!!");
                                        res.redirect("/campgrounds/" + campgroundid);
                                    } else {
                                        req.flash("success", "Pictures successfully uploaded!!");
                                        res.redirect("/campgrounds/" + campgroundid);
                                    }
                                });
                            }
                        });
                    } else {
                        cloudinary.uploader.upload(req.file.path, { timeout: 120000 }, function (error, result) {
                            if (error) {
                                req.flash("error", " Image can not be uploaded!!!");
                                res.redirect("back");
                            } else {
                                var images = result.secure_url;
                                var pictures = {
                                    images: images,
                                    author: author
                                };
                                Picture.create(pictures, function (err, insertpictures) {
                                    if (err) {
                                        req.flash("error", "Pictures not found!!");
                                        res.redirect("/campgrounds/" + campgroundid);
                                    } else {
                                        foundCampground.pictures.push(insertpictures);
                                        foundCampground.save(function (err, picturesaved) {
                                            if (err) {
                                                req.flash("error", "Pictures not saved!!");
                                                res.redirect("/campgrounds/" + campgroundid);
                                            } else {
                                                req.flash("success", "Pictures successfully uploaded!!");
                                                res.redirect("/campgrounds/" + campgroundid);
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                }
            });
        }
    });
});
router.get("/addtimer", function (req, res) {
    var campgroundid = req.params.id;
    Campground.findById(campgroundid, function (err, foundCampground) {
        if (err) {
            req.flash("error", "Campground not found!!");
            res.redirect("/campgrounds/" + campgroundid);
        } else {
            res.render("campgrounds/addtimer", { campground: foundCampground });
        }
    });
});
router.post("/addtimer", function (req, res) {
    var campgroundid = req.params.id;
    var d = new Date();
    var month = d.getMonth();
    var month_name = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var month_timer1 = req.body.month;
    var date = req.body.date;
    var month1 = month_name.indexOf(month_timer1);
    var year = 2019;
    var first_date = month_name[month1] + " " + date + " " + year;
    var tmp = new Date(first_date).toDateString();
    var sub = tmp.substring(4);
    Campground.findById(req.params.id).populate("comments").exec(function (err, foundCampground) {
        if (err) {
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            if (!req.session.campgroundcart) {
                res.render("campgrounds/show", { cartarray: null, campgroundcartarray: null, timer: sub, campground: foundCampground });
            } else {
                var campgroundcart = new CampgroundCart(req.session.campgroundcart);
                var campgroundcartarray = campgroundcart.generateArray();
                var campgroundids = campgroundcart.generatecampgroundids();
                for (var i = 0; i < campgroundcartarray.length; i++) {
                    if (campgroundids[i] == campgroundid) {
                        size = campgroundcartarray[i].newregister.length;
                        break;
                    }
                }
                res.render("campgrounds/show", { campgroundids: campgroundids, cartarray: size, timer: sub, campgroundcartarray: campgroundcartarray, campground: foundCampground });
            }
        }
    });
});
router.get("/registrations", middleware.isRegistered, middleware.isLoggedIn, function (req, res) {
    var campgroundsId = req.params.id;
    Campground.findById(campgroundsId, function (err, foundCampground) {
        if (err) {
            req.flash("error", "Something Went Wrong!!");
            res.redirect("/campgrounds/" + req.params.id);
        } else {
            if (!req.session.campgroundcart) {
                res.render("campgrounds/registrations", { registrations: null, campground: foundCampground });
            } else {
                var count = 0;
                var size;
                var k;
                var campgroundcart = new CampgroundCart(req.session.campgroundcart);
                var ids = campgroundcart.generatecampgroundids();
                var data = campgroundcart.generateArray();
                for (var i = 0; i < data.length; i++) {
                    if (ids[i] == campgroundsId) {
                        count++;
                        size = data[i].newregister.length;
                        k = i;
                        break;
                    }
                }
                if (count === 1) {
                    var obj = ids[k];
                    return res.render("campgrounds/registrations", { registrations: data, campgroundsId: obj, size: size, campground: foundCampground });
                } else {
                    return res.redirect("/campgrounds/" + campgroundsId);
                }
            }
        }
    });
});
router.get("/acceptregistrations/:registerId", function (req, res) {
    var campgroundsId = req.params.id;
    var registerId = req.params.registerId;
    Campground.findById(campgroundsId, function (err, foundCampground) {
        if (err) {
            req.flash("error", "Something Went Wrong!!");
            res.redirect("/campgrounds/registrations/" + campgroundsId);
        } else {
            var campgroundcart = new CampgroundCart(req.session.campgroundcart);
            var data = campgroundcart.duplicategenerateArray();
            //var ids = campgroundcart.generatecampgroundids();
            for (var i = 0; i < data.length; i++) {
                var break_state = 'false';
                if (data[i].campgroundid == campgroundsId) {
                    var size = data[i].newregister.length;
                    for (var j = 0; j < size; j++) {
                        var registerdata = data[i].newregister[j];
                        if (registerdata == registerId) {
                            var register2 = data[i].register1[j];
                            break_state = 'true';
                            break;
                        }
                    }
                }
                if (break_state === 'true')
                    break;
            }

            var username = register2.username;
            var avatar = register2.avatar;
            var firstName = register2.firstName;
            var lastName = register2.lastName;
            var email = register2.email;
            var register = {
                username: username,
                avatar: avatar,
                firstName: firstName,
                lastName: lastName,
                email: email
            };
            Register.create(register, function (err, registered) {
                if (err) {
                    req.flash("success", "registered!!!!");
                    res.redirect("/campgrounds/registrations/" + campgroundsId);
                } else {
                    foundCampground.register.push(registered);
                    foundCampground.save(function (err, saved) {
                        if (err) {
                            req.flash("error", "not registered!!!! 222");
                            res.redirect("/campgrounds/registrations/" + campgroundsId);
                        } else {
                            req.flash("success", " registered!!!!");
                            res.redirect("/campgrounds/registrations/" + campgroundsId);
                        }
                    });
                }
            });
        }
    });
});
router.get("/rejectregistrations/:registerId", function (req, res) {
    var campgroundsId = req.params.id;
    var registerId = req.params.registerId;
    Campground.findById(campgroundsId, function (err, foundCampground) {
        if (err) {
            req.flash("error", "Something Went Wrong!!");
            res.redirect("/campgrounds/registrations/" + campgroundsId);
        } else {
            var campgroundcart = new CampgroundCart(req.session.campgroundcart);
            campgroundcart.acceptandreject(campgroundsId, registerId);
            req.flash("error", "sorry your are rejected!!!");
            res.redirect("/campgrounds/registrations/" + campgroundsId);
        }
    });
});
module.exports = router;