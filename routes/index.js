var express = require('express');
var router = express.Router();
var passport = require('passport');
var Events = require('../models/events');



router.get('/', function(req, res, next) {
  res.render('home');
});

router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'https://www.googleapis.com/auth/calendar']}));

// router.get('/auth/google/callback', passport.authenticate('google',{ failureRedirect: '/' }),
//     function (req, res) {
//       res.redirect('/profile');
// });
router.get('/auth/google/callback',function (req, res, next) {
    passport.authenticate('google', function (err, user) {
      if (err || !user) {
        res.redirect('/auth/google');
      } else {
        req.session.user = user;
        res.redirect('/profile');
      }
    })(req, res, next);
});

router.get('/profile',  function (req, res, next) {
  if(req.session.user)
    res.render('profile',{layout: false});
  else
    res.redirect('/');  
});

router.get('/profile/data',function(req, res, next){
  
  Events.find({userId:req.session.user._id}).lean().exec(function (err,events) {
    for (var i = 0; i < events.length; i++){
      var tmp_id = events[i]._id;
      delete events[i]._id;
      events[i]['id'] = tmp_id;
    }
    res.send(events);  
  })
});

router.post('/profile/data',function(req, res, next){
  if (req.body["!nativeeditor_status"] == "inserted"){
    var c_event = new Events({userId:req.session.user._id+"",text:req.body.text,start_date:req.body.start_date,end_date:req.body.end_date});
    c_event.save(function (err,event) {
      if(err) console.log(err);
      res.setHeader("Content-Type", "application/json");
      res.send({ action: "inserted", sid: req.body.id, tid: event._id });
    });
  } else if (req.body["!nativeeditor_status"] == "deleted"){
    Events.findByIdAndRemove(req.body.id, function (err, resp) {
      if (err) throw err;
      res.setHeader("Content-Type", "application/json");
      res.send({ action: "deleted", sid: req.body.id, tid: req.body.id });
    });  
  }else{
    var c_event = { userId: req.session.user._id + "", text: req.body.text, start_date: req.body.start_date, end_date: req.body.end_date };
    Events.findByIdAndUpdate(req.body.id,{
      $set: c_event
    }, {
        new: true
      }, function (err, resp) {
        if (err) throw err;
        res.setHeader("Content-Type", "application/json");
        res.send({ action: "updated", sid: req.body.id, tid: req.body.id });
      });
  }
});

router.get('/logout',function(req, res, next){
  delete req.session;
  res.redirect('/');
});

module.exports = router;


