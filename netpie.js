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
    console.log('Connected...');
    microgear.setAlias("mygear");
    setInterval(function() {
        microgear.publish("/insta/post/total", "50");
        console.log('publish');
    },3000);    
});

microgear.connect(APPID);