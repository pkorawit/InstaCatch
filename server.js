var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var instagram = require('./lib/instagram');

// Configure app for bodyParser()
// lets us grab data from the body of POST
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

// Set up port for server to listen on
var port = process.env.PORT || 3000;

// Connect to DB
mongoose.connect('mongodb://localhost:27017/instagram', {
  useMongoClient: true
});
// Set custom promise to Bluebird
mongoose.Promise = require('bluebird');


// API Routes
var router = express.Router();

// Routes will all be prefixed with /api
app.use('/api', router);

// Serve static files
app.use(express.static('public'))

// MIDDLEWARE -
// Middleware can be very useful for doing validations. We can log
// things from here or stop the request from continuing in the event
// that the request is not safe.
// middleware to use for all requests
router.use(function (req, res, next) {
  //console.log('FYI...There is some processing currently going down...');
  next();
});

// Test Route
router.get('/', function (req, res) {
  res.json({
    message: 'Welcome to InstaCatch API!'
  });
});

router.route('/posts')
  .post(function (req, res) {
    // var vehicle = new Vehicle(); // new instance of a vehicle
    // vehicle.make = req.body.make;
    // vehicle.model = req.body.model;
    // vehicle.color = req.body.color;

    // vehicle.save(function(err) {
    //   if (err) {
    //     res.send(err);
    //   }
    //   res.json({message: 'Vehicle was successfully manufactured'});
    // });
  })

  .get(function (req, res) {
    InstaPost.find(function (err, post) {
      if (err) {
        res.send(err);
      }
      res.json(post);
    });
  });

router.route('/catch/tag/:hashtag')
  .get(function (req, res) {

    var url = `https://www.instagram.com/explore/tags/${req.params.hashtag}/`;
    try {
      instagram.get(url, function (message) {
        console.log(url + ' downloaded!');
        res.json({
          hashtag: req.params.hashtag,
          status: message.status
        });
      });
    } catch (err) {
      res.json({
        error: err
      });
    }
  });

router.route('/catch/location/:location_id')
  .get(function (req, res) {
    res.json({
      message: 'Location: ' + req.params.location_id + ' finished '
    });
  });

// Fire up server
app.listen(port);
// Print friendly message to console
console.log('Server listening on port ' + port);