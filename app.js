require('dotenv').config();
let express=require("express"),
  app=express(),
  bodyParser=require("body-parser"),
  mongoose=require("mongoose"),
  passport=require("passport"),
  LocalStrategy=require("passport-local").Strategy,
  flash=require("connect-flash"),
  request=require("request"),
  path=require('path'),
  cookieSession=require("cookie-session"),
  fetch=require('node-fetch'),
  session=require("express-session"),
  MongoStore=require("connect-mongo")(session),
  methodOverride=require("method-override"),
  dbconfig=require('./config/dbconfig');

//models....
let User = require("./models/user");


dbconfig()
//requiring routes
let indexRoutes = require("./routes/index"),
  campgroundRoutes = require("./routes/campgrounds1"),
  morecampgroundRoutes = require("./routes/campgrounds2"),
  campgrounduserregister = require("./routes/campgrounduserregister"),
  CampgroundReviews = require("./routes/reviews"),
  commentRoutes = require("./routes/comments"),
  registerRoute = require("./routes/register"),
  userRoutes = require("./routes/user"),
  googleRoutes = require("./routes/google");



app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(methodOverride('_method'));
app.locals.moment = require('moment');
// app.use(cookieSession({
//   maxAge: 24 * 60 * 60 * 1000,
//   keys: ["Once again Rusty wins cutest dogseswsder!"]
// }));
const store = new MongoStore({
    mongooseConnection: mongoose.connection,
    url: process.env.MONGO_URL,
    secret: 'Once again Rusty wins cutest dog!',
    touchAfter : 24*60*60
})
  
const sessionConfig={
  store,
  name: 'session',
  secret: 'Once again Rusty wins cutest dog!',
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now()+1000*60*60*24*7,
    maxAge : 1000*60*60*24*7
  }
}
app.use(session(sessionConfig));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
var passportSetup = require("./config/passport-setup")(passport);
app.use(function (req, res, next) {
  res.locals.currentUser = req.user;
  res.locals.session = req.session;
  res.locals.quantity = 0;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});
app.use("/", indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id", morecampgroundRoutes);
app.use("/campgrounds/:id/register", campgrounduserregister);
app.use("/campgrounds/:id/reviews", CampgroundReviews);
app.use("/campgrounds/:id/comments", commentRoutes);
app.use("/campgrounds/register", registerRoute);
app.use("/users", userRoutes);
app.use("/auth/google", googleRoutes);

const port = process.env.PORT || 5000;
app.listen(port, process.env.IP, function () {
  console.log("The Tourist Server Has Started!");
});
