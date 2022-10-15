var express = require("express"),
    router = express.Router(),
    passport = require("passport"),
    LocalStrategy = require("passport-local"),
    async = require("async"),
    nodemailer = require("nodemailer"),
    crypto = require("crypto"),
    User = require("../models/user");
passport.use(User.createStrategy());
//passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


router.get("/", function (req, res) {
    res.render("landing");
});

router.get("/register", function (req, res) {
    res.render("register");
});
// handle sign up logic
router.post("/register", function (req, res) {
    var avatar = "https://i.imgur.com/FazP1AJ.jpg";
    var newUser = new User({
        username: req.body.username,
        email: req.body.email,
        avatar: avatar,
        isUser : true
    });
    console.log("nrewUser", newUser);
    if (req.body.adminCode === 'rohithsingh') {
        newUser.isAdmin = true;
    }
    let password = req.body.password;
    if (req.body.password === req.body.conformPassword) {
        User.register(newUser, password, function (err, user) {
            console.log(user);
            if (err) {
                console.log("err", err.message);
                req.flash("error", "Account is already registered!!!!");
                return res.render("register");
            }
            else {
                passport.authenticate("local")(req, res, function () {
                    console.log("u are authenticated!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
                    req.flash("success", "Successfully Signed Up! Nice to meet you " + req.body.username);
                });
                //return res.render("accountverification", { email: user.email });
                return  res.render("login");
            }
        });
    } else {
        req.flash("error", "Passwords do not match.");
        return res.redirect('back');
    }
});
router.post("/accountverification", function (req, res, next) {
    var email = req.body.email;
    async.waterfall([
        function (done) {
            crypto.randomBytes(20, function (err, buf) {
                var token = buf.toString('hex');
                done(err, token);
            });
        },
        function (token, done) {
            User.findOne({ email: req.body.email }, function (err, user) {
                console.log("email to send to user", user);
                if (!user) {
                    req.flash('error', 'No account with that email address exists.');
                    return res.redirect('/register');
                }
                user.registrationToken = token;
                user.registrationTokenExpires = Date.now() + 7200000; // 1 hour
                user.save(function (err) {
                    done(err, token, user);
                });
            });
        },
        function (token, user, done) {
            var smtpTransport = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: 'rohithsinghthakur3@gmail.com',
                    pass: process.env.GMAILPW
                }
            });
            var mailOptions = {
                to: user.email,
                from: 'rohithsinghthakur3@gmail.com',
                subject: 'Node.js Account verification',
                text: 'You are receiving this because you (or someone else) have requested for the verification of your account.\n\n' +
                    'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                    'http://' + req.headers.host + '/campgrounds/register/' + user._id + '/token/' + token + '\n\n' +
                    'If you did not request this, please ignore this email .\n'
            };
            smtpTransport.sendMail(mailOptions, function (err) {
                console.log('mail sent');
                req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');

                done(err, 'done');
            });
        }
    ], function (err) {
        if (err) return next(err);
        res.redirect('/register');
    });
});

//show login form
router.get("/login", function (req, res) {
    res.render("login");
});
// handling login logic
router.post("/login", (req, res, next) => {
    console.log('req.body', req.body)
    next()
}, passport.authenticate("local", {
    successRedirect: "/campgrounds",
    failureRedirect: "/login",
    failureFlash: true,
    successFlash: "Welcome to TourCamp!"
})
);
// logout route
router.get("/logout", function (req, res) {
    req.logout();
    req.flash("success", "See you later!");
    res.redirect("/campgrounds");
});
// forgot password
router.get('/forgot', function (req, res) {
    res.render('forgot');
});
router.post('/forgot', function (req, res, next) {
    async.waterfall([
        function (done) {
            crypto.randomBytes(20, function (err, buf) {
                var token = buf.toString('hex');
                done(err, token);
            });
        },
        function (token, done) {
            User.findOne({ email: req.body.email }, function (err, user) {
                if (!user) {
                    req.flash('error', 'No account with that email address exists.');
                    return res.redirect('/register');
                }

                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 7200000; // 1 hour

                user.save(function (err) {
                    done(err, token, user);
                });
            });
        },
        function (token, user, done) {
            var smtpTransport = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: 'rohithsinghthakur3@gmail.com',
                    pass: process.env.GMAILPW
                }
            });
            var mailOptions = {
                to: user.email,
                from: 'rohithsinghthakur3@gmail.com',
                subject: 'Node.js Password Reset',
                text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                    'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                    'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                    'If you did not request this, please ignore this email and your password will remain unchanged.\n'
            };
            smtpTransport.sendMail(mailOptions, function (err) {
                console.log('mail sent');
                req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
                done(err, 'done');
            });
        }
    ], function (err) {
        if (err) return next(err);
        res.redirect('/forgot');
    });
});
router.get('/reset/:token', function (req, res) {
    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function (err, user) {
        if (!user) {
            req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect('/forgot');
        }
        res.render('reset', { token: req.params.token });
    });
});
router.post('/reset/:token', function (req, res) {
    async.waterfall([
        function (done) {
            User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function (err, user) {
                //console.log("user == "+ user.setPassword);
                if (!user) {
                    req.flash('error', 'Password reset token is invalid or has expired.');
                    return res.redirect('back');
                }
                if (req.body.password === req.body.confirm) {
                    user.setPassword(req.body.password, function (err) {
                        user.resetPasswordToken = undefined;
                        user.resetPasswordExpires = undefined;

                        user.save(function (err) {
                            req.logIn(user, function (err) {
                                done(err, user);
                            });
                        });
                    })
                } else {
                    req.flash("error", "Passwords do not match.");
                    return res.redirect('back');
                }
            });
        },
        function (user, done) {
            var smtpTransport = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: 'rohithsinghthakur3@gmail.com',
                    pass: process.env.GMAILPW
                }
            });
            var mailOptions = {
                to: user.email,
                from: 'learntocodeinfo@mail.com',
                subject: 'Your password has been changed',
                text: 'Hello,\n\n' +
                    'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
            };
            smtpTransport.sendMail(mailOptions, function (err) {
                req.flash('success', 'Success! Your password has been changed.');
                done(err);
            });
        }
    ], function (err) {
        res.redirect('/campgrounds');
    });
});
module.exports = router;

