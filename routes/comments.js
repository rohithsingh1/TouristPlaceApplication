var express = require("express"),
    router = express.Router({ mergeParams: true }),
    middleware = require("../middleware"),
    Campground = require("../models/campground"),
    Comment = require("../models/comment");


router.post("/", function (req, res) {
    var id1 = req.params.id;
    var text = req.body.text;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var comments = { text: text, author: author };
    Campground.findById(id1, function (err, campground) {
        if (err) {
            req.flash("error", "Campground not found!!");
            res.redirect("/campgrounds/" + id1);
        }
        else {
            Comment.create(comments, function (err, commentcreated) {
                if (err) {
                    req.flash("error", "Something Went Wrong11!!");
                    res.redirect("/campgrounds/" + id1);
                }
                else {
                    campground.comments.push(commentcreated);
                    campground.save(function (err, commentsaved) {
                        if (err) {
                            req.flash("error", "Something Went Wrong12!!");
                            res.redirect("/campgrounds/" + id1);
                        }
                        else {
                            req.flash("success", "Comment Successfully added!!!");
                            res.redirect("/campgrounds/" + id1);
                        }
                    });
                }
            });
        }
    });
});
router.get("/:commentId/edit", middleware.checkUserComment, function (req, res) {
    var commentid = req.params.commentId;
    var id1 = req.params.id;
    Campground.findById(id1, function (err, campgroundfound) {
        if (err) {
            req.flash("error", "Campground not found!!");
            res.redirect("/campgrounds");
        }
        else {
            Comment.findById(commentid, function (err, commentfound) {
                if (err) {
                    req.flash("error", "Something Went Wrong!!");
                    res.redirect("/campgrounds/" + id1);
                }
                else {
                    res.render("comments/edit", { comment: commentfound, campground: campgroundfound });
                }
            });
        }
    });
});
router.put("/:commentId",  middleware.checkUserComment, function (req, res) {
    var id1 = req.params.id;
    var text = req.body.text;
    var newComment = { text: text };
    Comment.findByIdAndUpdate(req.params.commentId, newComment, function (err, commentupdated) {
        if (err) {
            res.redirect("/campgrounds/" + id1);
        }
        else {
            req.flash("success", "Comment successfull edited!!");
            res.redirect("/campgrounds/" + id1);
        }
    });
});
router.delete("/:commentId", middleware.isRegistered, middleware.checkUserComment, function (req, res) {
    var id1 = req.params.id;
    Comment.findById(req.params.commentId, function (err, commentfound) {
        if (err) {
            req.flash("error", "Comment not found!!");
            res.redirect("/campgrounds/" + id1);
        }
        else {
            Comment.findByIdAndRemove(req.params.commentId, function (err, commentupdated) {
                if (err) {
                    res.redirect("/campgrounds/" + id1);
                }
                else {
                    req.flash("error", "You Deleted The Comment!!");
                    res.redirect("/campgrounds/" + id1);
                }
            });
        }
    });
});

module.exports = router;