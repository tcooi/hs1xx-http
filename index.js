var express = require('express');
var bodyParser = require('body-parser');
var app = express();

const { Client } = require('tplink-smarthome-api');
const config = require('./config.json');

var client = new Client();
let devices = [];

console.log('Devices found in config file:')

for (let [key, value] of Object.entries(config)) {
  console.log(`id: ${key}, ip: ${value}`);
  devices[key] = client.getPlug({host: value});
}

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

var port = process.env.PORT || 8010;

var router = express.Router();

function display(res) {
  console.log(res);
}

function getState(cb) {
  plug.getInfo().then(function(state) {
    display(state);
    cb(state);
  });
}

function getSchedule(cb) {
  plug.getScheduleRules().then(function(state) {
    display(state);
    cb(state);
  });
}

function on() {
  plug.setPowerState(true).then(display);
}

function off() {
  plug.setPowerState(false).then(display);
}

function toggle() {
  plug.getSysInfo().then(function(state) {
    if(state.relay_state === 1) {
      off();
    }else {
      on();
    }
  });
}

router.get('/all/info', (req, res) => {
  let id = req.params.id;
  devices[id].getSysInfo().then( x => {
    res.json(x);
  })
})

router.get('/:id/info', (req, res) => {
  let id = req.params.id;
  devices[id].getSysInfo().then( x => {
    res.json(x);
  })
})

router.get('/:id/getnextaction', (req, res) => {
  let id = req.params.id;
  devices[id].schedule.getNextAction().then( x => {
    console.log(x)
  })
})

router.get('/all/on', (req, res) => {
  for (let id in devices) {
    devices[id].setPowerState(true).then(display);
  }
})

router.get('/all/off', (req, res) => {
  for (let id in devices) {
    devices[id].setPowerState(false).then(display);
  }
})

router.get('/:id/on', (req, res) => {
  let id = req.params.id;
  devices[id].setPowerState(true).then(display);
  // console.log(devices[a])
  })

router.get('/:id/off', (req, res) => {
  let id = req.params.id;
  devices[id].setPowerState(false).then(display);
  // console.log(devices[a])
  })

router.get('/:id/getschedule', (req, res) => {
  let id = req.params.id;
  devices[id].schedule.getRules().then( x => {
    console.log(x);
  });
})



router.get('/', function(req, res) {
  getState(function(plug) {
      res.json(plug);
    });
  });

router.route('/state')
  .get(function(req, res) {
    getState(function(state) {
      res.json(state);
    });
  });

  router.route('/schedule')
    .get(function(req, res) {
      getSchedule(function(state) {
        res.json(state);
      });
    });

router.route('/:id/on')
  .get(function(req, res) {
    on();
    res.json({state: 'on'});
  });

router.route('/:id/off')
  .get(function(req, res) {
    off();
    res.json({state: 'off'});
  });

router.route('/:id/toggle')
  .get(function(req, res) {
    getState(function(state) {
      if(state.sysInfo.relay_state === 1) {
        off();
        res.json(state);
      }else {
        on();
        res.json(state);
      }
    });
  });



app.use('/', router);
app.listen(port);
console.log('\nlistening to port ' + port);
