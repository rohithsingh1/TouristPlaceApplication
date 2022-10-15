var express = require("express"),
    router = express.Router(),
    passport = require("passport");
   
router.get("/", passport.authenticate("google", {
    scope: ["email", "profile"]
}));

router.get("/redirect", passport.authenticate("google", {
    successRedirect: '/campgrounds',
    failureRedirect: '/register'
}), function (req, res, next) {
});

module.exports = router;