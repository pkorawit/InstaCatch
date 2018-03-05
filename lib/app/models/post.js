var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PostSchema = new Schema({
    created_at: Date,
    shortcode : String,
    media: Object
});

module.exports = mongoose.model('instagram', PostSchema);