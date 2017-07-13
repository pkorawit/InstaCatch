var mongoose = require('mongoose');
var instagram = require('./lib/instagram');
var config = require('./config');

// Connect to DB
mongoose.connect('mongodb://localhost:27017/instagram', {
    useMongoClient: true
});
// Set custom promise to Bluebird
mongoose.Promise = require('bluebird');

function intervalFunc() {

    for(var tag in config.hastags){        
        var url = `https://www.instagram.com/explore/tags/${config.hastags[tag]}/`;
        instagram.get(url, function (message) {
            console.log(`\ntime: ${Date()}\nhashtag: ${config.hastags[tag]}\nstatus: ${message.status}\n`);
        });        
    }
}
setInterval(intervalFunc, config.interval);


