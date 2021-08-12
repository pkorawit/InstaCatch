var mongoose = require('mongoose');
var config = require('./config');
var Instagram = require('./lib/instafetch');
var PostDocument = require('./lib/app/models/post');
Instagram = new Instagram();

var dburl = 'mongodb://localhost:27017/instagram';

// Connect to DB
mongoose.connect(dburl, {
    useMongoClient: true
});

// Set custom promise to Bluebird
mongoose.Promise = require('bluebird');

try {
    console.log('Start fetching ...');
    fetch();
    function intervalFunc() {
        fetch();
    }
    setInterval(intervalFunc, config.interval);
}
catch (error) {
    console.error(error);
}

async function fetch() {
    //Fetch by Location
    for (var loc in config.locations) {
        var locationdata = await Instagram.getDataByLocation(config.locations[loc]);
        //var entries = locationdata.location.media.nodes; //Instagram API updated found on 11 May 2018
        var entries = locationdata.graphql.location.edge_location_to_media.edges;
        console.log('Location[' + config.locations[loc] + '] entries: ' + entries.length);
        for (var i = 0; i < entries.length; i++) {

            try {
                
                //Get each post from entries
                const { node : postdata } = entries[i];                
                
                //Check if the selecte entry is existed in database
                const exist = await PostDocument.findOne({shortcode: postdata.shortcode});
                if (exist) {
                    console.log(postdata.shortcode + " : already existed");
                } else {
                    //Store data to DB
                    let postdb = new PostDocument;
                    postdb.created_at = Date.now();
                    postdb.shortcode = postdata.shortcode;
                    postdb.media = postdata;
                    await postdb.save();
                    console.log(postdata.shortcode + " : saved");
                }                
            }
            catch (error) {
                console.error(error);
            }
        }
    }

    PostDocument.count({}, function (err, c) {
        if (err) console.log(err);
        console.log(`\ntime: ${Date()}\nlocation: ${config.locations[loc]}\nstatus: finished\n`);
        console.log(`Total : ${c}\n`);
    });

    //Fetch by Hashtag
    for (var tag in config.hastags) {
        var hashtagdata = await Instagram.getDataByHashtag(config.hastags[tag]);
        var entries = hashtagdata.edges;
        console.log('Hashtag[' + config.hastags[tag] + '] entries: ' + entries.length);
        for (var i = 0; i < entries.length; i++) {

            try {
                
                //Get each post from entries
                const { node : postdata } = entries[i];                
                
                //Check if the selecte entry is existed in database
                const exist = await PostDocument.findOne({shortcode: postdata.shortcode});
                if (exist) {
                    console.log(postdata.shortcode + " : already existed");
                } else {
                    //Store data to DB
                    let postdb = new PostDocument;
                    postdb.created_at = Date.now();
                    postdb.shortcode = postdata.shortcode;
                    postdb.media = postdata;
                    await postdb.save();
                    console.log(postdata.shortcode + " : saved");
                }                
            }
            catch (error) {
                console.error(error);
            }
        }
    }

    PostDocument.count({}, function (err, c) {
        if (err) console.log(err);
        console.log(`\ntime: ${Date()}\nhashtag: ${config.hastags[tag]}\nstatus: finished\n`);
        console.log(`Total : ${c}\n`);
    });
}