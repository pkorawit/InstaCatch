var fs = require('fs')
var request = require('request');

var download = function (uri, filename, callback) {
    request.head(uri, function (err, res, body) {        
        request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
};

module.exports.download = download;