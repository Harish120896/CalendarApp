var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var Event = new Schema({
    'start_date': { type: String, required: true },
    'end_date': { type: String, required: true },
    'userId': { type: String, required: true },
    'text':{type: String, required: true},
});

module.exports = mongoose.model('Event', Event);