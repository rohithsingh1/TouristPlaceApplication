var express = require("express"),
    router = express.Router({ mergeParams: true }),
    middleware = require("../middleware"),
    Campground = require("../models/campground"),
    Review = require("../models/rating");

router.get("/", middleware.isRegistered, middleware.isLoggedIn, function (req, res) {
    var campgroundid = req.params.id;
    Campground.findById(req.params.id).populate({
        path: "reviews",
        options: { sort: { createdAt: -1 } } // sorting the populated reviews array to show the latest first
    }).exec(function (err, campground) {
        if (err || !campground) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        res.render("reviews/index", { campground: campground });
    });
});
router.get("/new", middleware.isLoggedIn, function (req, res) {
    Campground.findById(req.params.id, function (err, campground) {
        console.log(campground);
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        } else {
            res.render("reviews/new", { campground: campground });
        }
    });
});
router.post("/", function (req, res) {
    var campgroundid = req.params.id;
    Campground.findById(req.params.id).populate("reviews").exec(function (err, campground) {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        Review.create(req.body.review, function (err, review) {
            if (err) {
                req.flash("error", err.message);
                return res.redirect("back");
            }
            //add author username/id and associated campground to the review
            review.author.id = req.user._id;
            review.author.username = req.user.username;
            review.campground = campground;
            //save review
            review.save();
            campground.reviews.push(review);
            // calculate the new average review for the campground
            campground.rating = calculateAverage(campground.reviews);
            //save campground
            campground.save();
            req.flash("success", "Your review has been successfully added.");
            res.redirect('/campgrounds/' + campgroundid);
        });
    });
});
router.get("/:reviewid/edit", middleware.isRegistered, middleware.isLoggedIn, function (req, res) {
    var campgroundid = req.params.id;
    var reviewid = req.params.reviewid;
    Campground.findById(campgroundid, function (err, foundCampground) {
        if (err) {
            req.flash("error", "Campground not found!!");
            res.redirect("/campgrounds/" + campgroundid);
        } else {
            Review.findById(reviewid, function (err, foundreview) {
                if (err) {
                    req.flash("error", "Campground review not found!!");
                    res.redirect("/campgrounds/" + campgroundid);
                } else {
                    res.render("reviews/edit", { campground_id: campgroundid, review: foundreview });
                }
            });
        }
    });
});
router.put("/:reviewid", function (req, res) {
    var campgroundid = req.params.id;
    var reviewid = req.params.reviewid;
    Review.findByIdAndUpdate(reviewid, req.body.review, { new: true }, function (err, updatedReview) {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        Campground.findById(campgroundid).populate("reviews").exec(function (err, campground) {
            if (err) {
                req.flash("error", err.message);
                return res.redirect("back");
            }
            // recalculate campground average
            campground.rating = calculateAverage(campground.reviews);
            //save changes
            campground.save();
            req.flash("success", "Your review was successfully edited.");
            res.redirect('/campgrounds/' + campgroundid);
        });
    });
});
router.delete("/:reviewid", middleware.isRegistered, middleware.isLoggedIn, function (req, res) {
    var campgroundid = req.params.id;
    var reviewid = req.params.reviewid;
    Review.findByIdAndRemove(reviewid, function (err) {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        Campground.findByIdAndUpdate(campgroundid, { $pull: { reviews: reviewid } }, { new: true }).populate("reviews").exec(function (err, campground) {
            if (err) {
                req.flash("error", err.message);
                return res.redirect("back");
            }
            // recalculate campground average
            campground.rating = calculateAverage(campground.reviews);
            //save changes
            campground.save();
            req.flash("success", "Your review was deleted successfully.");
            res.redirect("/campgrounds/" + campgroundid);
        });
    });
});
function calculateAverage(reviews) {
    if (reviews.length === 0) {
        return 0;
    }
    var sum = 0;
    reviews.forEach(function (element) {
        sum += element.rating;
    });
    return sum / reviews.length;
}
module.exports = router;