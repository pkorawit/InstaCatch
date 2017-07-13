var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var LocationSchema = new Schema({
    created_at: Date,
    updated_at: Date,
    location_id : String,
    location_name : String,
    entry: Object
});

module.exports = mongoose.model('Location', LocationSchema);