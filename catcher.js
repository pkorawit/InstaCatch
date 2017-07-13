var mongoose = require('mongoose');
var igtag = require('./lib/igtag');
var igloc = require('./lib/igloc');
var config = require('./config');

// Connect to DB
mongoose.connect('mongodb://localhost:27017/instagram', {
    useMongoClient: true
});
// Set custom promise to Bluebird
mongoose.Promise = require('bluebird');

function startCatch() {
    //Get by Tags
    try {
        for(var tag in config.hastags){        
            var url = `https://www.instagram.com/explore/tags/${config.hastags[tag]}/`;
            igtag.get(url, function (message) {
                console.log(`\ntime: ${Date()}\nhashtag: ${config.hastags[tag]}\nstatus: ${message.status}\n`);
            });        
        }        
    } catch (error) {
        console.log(error);
    }

    //Get by Locations
    try {
        for(var loc in config.locations){        
            var url = `https://www.instagram.com/explore/locations/${config.locations[loc]}/`;
            igloc.get(url, function (message) {
                console.log(`\ntime: ${Date()}\nlocation: ${config.locations[loc]}\nstatus: ${message.status}\n`);
            });        
        }        
    } catch (error) {
        console.log(error);
    }    
}

console.log('Start catching ...');
startCatch();
function intervalFunc() {
    startCatch();
}
setInterval(intervalFunc, config.interval);


