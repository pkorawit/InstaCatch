var mongoose = require('mongoose');
var config = require('./config');
var Instagram = require('./lib/instafetch');
var PostDocument = require('./lib/app/models/post');
Instagram = new Instagram();

var dburl = 'mongodb://mean.psu.ac.th:27017/ptie';

// Connect to DB
mongoose.connect(dburl, {
    useMongoClient: true
});

// Set custom promise to Bluebird
mongoose.Promise = require('bluebird');

// Connect to NETPIE
var MicroGear = require('microgear');

const APPID = 'PTEI';
const KEY = 'zp4z7w9QoGFZgOd';
const SECRET = 'CInR0O0133Pzxma5sFqHtRYRC';

var microgear = MicroGear.create({
    key: KEY,
    secret: SECRET
});

microgear.on('connected', function() {
    console.log('Connected to NETPIE');
    microgear.setAlias("catcher");
    console.log('Start fetching ...');
    fetch();
    function intervalFunc() {
        fetch();
    }
    setInterval(intervalFunc, config.interval);
});

microgear.connect(APPID);

async function fetch() {
    //Fetch by Location
    for (var loc in config.locations) {
        var locationdata = await Instagram.getDataByLocation(config.locations[loc]);
        //var entries = locationdata.location.media.nodes; //Instagram API updated found on 11 May 2018
        var entries = locationdata.graphql.location.edge_location_to_media.edges;
        console.log('Location[' + config.locations[loc] + '] entries: ' + entries.length);
        for (var i = 0; i < entries.length; i++) {

            //console.log(entries[0]);
            var postdata = await Instagram.getPostByShortcode(entries[i].node.shortcode);  //Instagram API updated found on 11 May 2018                       

            //Store data to DB
            var postdb = new PostDocument;
            //Check if the selecte entry is existed in database
            PostDocument.findOne({
                shortcode: postdata.shortcode
            }, function(err, exist) {
                if (exist) {
                    console.log(postdata.shortcode + " : already existed");
                } else {
                    //Insert new data to db 
                    postdb.created_at = Date.now();
                    postdb.shortcode = postdata.shortcode;
                    postdb.media = postdata;
                    postdb.save(function(err) {
                        if (err) return handleError(err);
                        console.log(postdata.shortcode + " : saved");
                    });
                }
            });
        }
    }

    PostDocument.count({}, function(err, c) {
        if (err) console.log(err);
        console.log(`\ntime: ${Date()}\nlocation: ${config.locations[loc]}\nstatus: finished\n`);
        console.log(`Total : ${c}\n`);
        microgear.publish("/instagram/post/total", `${c}`);
        console.log("publish");
    });

    //Fetch by Hashtag
    for (var tag in config.hastags) {
        var hashtagdata = await Instagram.getDataByHashtag(config.hastags[tag]);
        var entries = hashtagdata.edges;
        console.log('Hashtag[' + config.hastags[tag] + '] entries: ' + entries.length);
        for (var i = 0; i < entries.length; i++) {
            var postdata = await Instagram.getPostByShortcode(entries[i].node.shortcode);
            //Store data to DB
            var postdb = new PostDocument;
            //Check if the selecte entry is existed in database
            PostDocument.findOne({
                shortcode: postdata.shortcode
            }, function(err, exist) {
                if (exist) {
                    console.log(postdata.shortcode + " : already existed");
                } else {
                    //Insert new data to db 
                    postdb.created_at = Date.now();
                    postdb.shortcode = postdata.shortcode;
                    postdb.media = postdata;
                    postdb.save(function(err) {
                        if (err) return handleError(err);
                        console.log(postdata.shortcode + " : saved");
                    });
                }
            });
        }
    }

    PostDocument.count({}, function(err, c) {
        if (err) console.log(err);
        console.log(`\ntime: ${Date()}\nhashtag: ${config.hastags[tag]}\nstatus: finished\n`);
        console.log(`Total : ${c}\n`);
        microgear.publish("/instagram/post/total", `${c}`);
        console.log("publish");
    });
}