var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs')
var urllib = require('url');
var path = require('path');
var InstaTag = require('./app/models/loc');
var downloader = require('./download');

//Get by TAG
var getloc = function (url, callback) {

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
                console.log(grams);
                try {
                    grams = JSON.parse(jsonString);
                } catch (e) {
                    return callback({
                        status: 'JSON parsing error'
                    });
                }

                // Loop through TabPage
                for (page = 0; page < grams.entry_data.LocationsPage.length; page++) {

                    //Extract only tag data
                    var loc = grams.entry_data.LocationsPage[page].location;

                    // Loop through entry
                    for (i = 0; i < loc.media.nodes.length; i++) {

                        var entry = loc.media.nodes[i];
                        // Save data to db 
                        var locDb = new InstaTag;
                        locDb.created_at = Date.now();
                        locDb.updated_at = Date.now();
                        locDb.entry = entry;
                        locDb.location_id = loc.id;
                        locDb.location_name = loc.name;
                        console.log(loc.id + ' ' + entry.id + ' saved!');
                        locDb.save(function (err) {
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

module.exports.get = getloc;