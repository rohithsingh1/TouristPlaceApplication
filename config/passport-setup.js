// config/passport.js

// load all the things we need
var LocalStrategy = require('passport-local').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

// load up the user model
var User = require('../models/user');


module.exports = function (passport) {

    // used to serialize the user for the session
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });

    // code for login (use('local-login', new LocalStategy))
    // code for signup (use('local-signup', new LocalStategy))
    // code for facebook (use('facebook', new FacebookStrategy))
    // code for twitter (use('twitter', new TwitterStrategy))
    // =========================================================================
    // GOOGLE ==================================================================
    // =========================================================================
    passport.use(new GoogleStrategy({

        clientID: process.env.GOOGLE_CLIENT_ID1,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET1,
        callbackURL: process.env.GOOGLE_REDIRECT1

    },
        function (token, refreshToken, profile, done) {
            console.log("profile", profile);
            // make the code asynchronous
            // User.findOne won't fire until we have all our data back from Google
            process.nextTick(function () {

                // try to find the user based on their google id
                User.findOne({ 'google.id': profile.id }, function (err, user) {
                    //console.log("user", user);
                    if (err)
                        return done(err);

                    if (user) {
                        //console.log(done());
                        // if a user is found, log them in
                        return done(null, user);
                    } else {
                        // if the user isnt in our database, create a new user
                        var newUser = new User();
                        var password = "touristplace12345";
                        // set all of the relevant information
                        newUser.username = profile.displayName;
                        newUser.avatar = profile.photos[0].value;
                        newUser.email = profile.emails[0].value;
                        newUser.isUser = 'true';
                        newUser.google.id = profile.id;
                        newUser.google.token = token;
                        newUser.google.username = profile.displayName;
                        newUser.google.email = profile.emails[0].value; // pull the first email
                        newUser.google.photo = profile.photos[0].value;
                        newUser.google.isUser = 'true';
                        // save the user
                        User.register(newUser, password, function (err, user) {
                            //console.log("newuser********", user);
                            if (err) {
                                User.findOne({ email: newUser.email }, function (err, useremail) {
                                    //console.log("useremail=====================================", useremail);
                                    if (err) {
                                        return done(err);
                                    } else {
                                        return done(null, useremail);
                                    }
                                });
                            } else {
                                return done(null, user);
                            }
                        });
                        // newUser.save(function (err) {
                        //     if (err)
                        //         throw err;
                        //     return done(null, newUser);
                        // });
                    }
                });
            });

        }));

};



















// var passport = require("passport");
// var GoogleStrategy = require("passport-google-oauth20");
// var User = require("../models/user");
//   //passport.use(User.createStrategy());
// // passport.serializeUser(User.serializeUser());
// // passport.deserializeUser(User.deserializeUser());
// passport.serializeUser(function (user, done) {
//     done(null, user.id);
// });
// passport.deserializeUser(function (id, done) {
//     User.findById(id, function (user) {
//         done(null, user);
//     })
// });
// passport.use(new GoogleStrategy({
//     // options for GoogleStrategy
//     callbackURL: process.env.GOOGLE_REDIRECT, // this must match your google api settings
//     clientID: process.env.GOOGLE_CLIENT_ID, // e.g. asdfghjkljhgfdsghjk.apps.googleusercontent.com
//     clientSecret: process.env.GOOGLE_CLIENT_SECRET // e.g. _ASDFA%DFASDFASDFASD#FAD-
// }, function (accessToken, refreshToken, email, profile, done) {
//     //callback function
//     //console.log("email", email);
//     //console.log(profile);
//     var password = "touristplace12345";
//     var newuser = new User({
//         username: profile.displayName,
//         googleid: profile.id,
//         email: profile.emails[0].value,
//         avatar: profile.photos[0].value,
//         isUser: true
//     });
//     User.register(newuser, password, function (err, user) {
//         console.log(user);
//         if (err) {
//             console.log("user already registerd!!!!!!!");
//             User.findOne({ googleid: profile.id }, function (err, user1) {
//                 if (err) {
//                     console.log("user not found in database!!!!!");
//                     done(null, user);
//                 } else {
//                     console.log("current user", user1);
//                     done(null, user1);
//                 }
//             });
//         } else {
//             console.log("new user", user);
//             done(null, user);
//         }
//     });
// })
// )