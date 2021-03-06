var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs')
var urllib = require('url');
var path = require('path');
var InstaTag = require('./app/models/tag');
var downloader = require('./download');

//Get by TAG
var gettag = function (url, callback) {

    // Download html file from URL
    request(url, function (error, response, html) {

        if (error) console.log(error);

        // Use jQuery manipulate DOM
        var $ = cheerio.load(html);

        // Find script tag then extract json data
        $('script').each(function (i, elem) {

            var jsCode = $(this).html();

            // Extract json data from Js code at 'window._sharedData'
            if (jsCode.search("window._sharedData") != -1) {

                // Clean up undesired data from target json    
                var jsonString = jsCode.replace("window._sharedData", "")
                    .replace(" = ", "")
                    .replace(";", "");

                // Convert json string to object
                var grams;
                try {
                    grams = JSON.parse(jsonString);
                } catch (e) {
                    return callback({
                        status: 'JSON parsing error'
                    });
                }

                // Loop through TabPage
                for (page = 0; page < grams.entry_data.TagPage.length; page++) {

                    //Extract only tag data
                    var tag = grams.entry_data.TagPage[page].graphql.hashtag;

                    // Loop through entry
                    for (i = 0; i < tag.edge_hashtag_to_media.edges.length; i++) {

                        var entry = tag.edge_hashtag_to_media.edges[i].node;
                        // Save data to db 
                        var tagDb = new InstaTag;
                        tagDb.created_at = Date.now();
                        tagDb.updated_at = Date.now();
                        tagDb.entry = entry;
                        tagDb.tagname = tag.name;
                        console.log(entry.id + ' saved!');
                        tagDb.save(function (err) {
                            if (err) return handleError(err);
                        });
                    }
                }
            }
        });
    });

    return callback({
        status: 'success'
    });

};

module.exports.get = gettag;