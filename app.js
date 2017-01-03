var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var exphbs = require('express-handlebars');
var session = require('express-session');
var passport = require('passport');
var mongoose = require('mongoose');
var GoogleStrategy = require('passport-google-oauth20');
var credentials = require('./config/credentials');
var mongoose = require('mongoose');
var User = require('./models/users');


mongoose.connect(credentials.mongodb.urlEndPoint);

var db = mongoose.connection;

db.on('error', function(){console.log('connection error');});

db.once('open', function () {
  console.log("connection established successfully.");
});

var indexRouter = require('./routes/index');

var app = express();

app.engine('handlebars', exphbs({ defaultLayout: 'index' }));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'handlebars');



app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({ name:'user', secret: "!@#sdf345423@#$Cc@342", saveUninitialized: true, resave: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById({
    id, function(err, user) {
      if (err)
        done(err);
      done(null, user);
    }
  });
});


passport.use(new GoogleStrategy({
  clientID: credentials.googleAuth.clientID,
  clientSecret: credentials.googleAuth.clientSecret,
  callbackURL: credentials.googleAuth.callbackURL
},
  function (accessToken, refreshToken, profile, done) {
    process.nextTick(function () {
      User.findOne({ 'googleId': profile.id }, function (err, user) {
        if (err)
          return done(err);
        if (user) {
          user.accessToken = accessToken;
          user.save(function (err) {
            if (err)
              throw err;
            return done(null, user);
          });
        } else {

          var newUser = new User();
          newUser.googleId = profile.id;
          newUser.accessToken = accessToken;
          newUser.profileName = profile.displayName;
          newUser.save(function (err) {
            if (err)
              throw err;
            return done(null, newUser);
          });
        }
      });

    });
  }));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
