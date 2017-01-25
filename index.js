var express = require('express');
var bodyParser = require('body-parser');
var app = express();

var Hs100Api = require('hs100-api');
var config = require('./config.json');

var client = new Hs100Api.Client();
var plug = client.getPlug({host: config.ip});

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

var port = process.env.PORT || 8010;

var router = express.Router();

function display(res) {
  console.log(res);
}

router.get('/', function(req, res) {
  getState(function(plug) {
      res.json(plug);
    });
  });

router.route('/state')
  .get(function(req, res) {
    getState(function(plug) {
      res.json(plug);
    });
  });

  router.route('/schedule')
    .get(function(req, res) {
      getSchedule(function(plug) {
        res.json(plug);
      });
    });

router.route('/on')
  .get(function(req, res) {
    on();
    res.json({state: 'on'});
  });

router.route('/off')
  .get(function(req, res) {
    off();
    res.json({state: 'off'});
  });

router.route('/toggle')
  .get(function(req, res) {
    getState(function(plug) {
      if(plug.relay_state === 1) {
        off();
        res.json({state: 'off'});
      }else {
        on();
        res.json({state: 'on'});
      }
    });
  });

function getState(cb) {
  plug.getInfo().then(function(plug) {
    display(plug);
    cb(plug);
  });
}

function getSchedule(cb) {
  plug.getScheduleRules().then(function(plug) {
    display(plug);
    cb(plug);
  });
}

function on() {
  plug.setPowerState(true).then(display);
}

function off() {
  plug.setPowerState(false).then(display);
}

function toggle() {
  plug.getSysInfo().then(function(plug) {
    if(plug.relay_state === 1) {
      off();
    }else {
      on();
    }
  });
}

app.use('/', router);
app.listen(port);
console.log('listening to port ' + port);
