var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var User = new Schema({
    'accessToken':{type:String,required:true},
    'profileName':{type:String,required:true},
    'googleId':{type:String,required:true}
});

module.exports = mongoose.model('User',User);