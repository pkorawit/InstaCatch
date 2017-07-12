var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TagSchema = new Schema({
    created_at: Date,
    updated_at: Date,
    tagname : String,
    entry: Object
});

module.exports = mongoose.model('Tag', TagSchema);