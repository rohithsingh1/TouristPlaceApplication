var express = require("express"),
  router = express.Router(),
  User = require("../models/user");



router.get('/:userid/token/:token', function (req, res) {
  var userid = req.params.userid;
  User.findOne({ registrationToken: req.params.token, registrationTokenExpires: { $gt: Date.now() } }, function (err, user) {
    if (err) {
      req.flash('error', 'Registration token is invalid or has expired.');
      return res.redirect('/register');
    } else {
      var isuser = user.isUser = 'true';
      newData = { isUser: isuser };
      User.findByIdAndUpdate(userid, newData, function (err, foundUser) {
        console.log("foundUser", foundUser);
        if (err) {
          req.flash('error', foundUser.email + " not found!!!");
          return res.redirect('/register');
        } else {
          req.flash("success", "Successfully registered!!!");
          res.render('verification');
        }
      });
    }
  });
});
module.exports = router;