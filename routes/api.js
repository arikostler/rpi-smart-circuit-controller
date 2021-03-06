const express = require('express');
const router = express.Router();
const gpio = require('rpi-gpio').promise;
const dht = require('node-dht-sensor').promises;

let switches = [
    {
        id: 0,
        name: 'light',
        pin: 11,
        state: 0
    }, {
        id: 1,
        name: 'fan',
        pin: 12,
        state: 0
    }
];

let poll_info = {lastChange: Date.now()};

setupPins(switches).then(r => {
    console.log('GPIO pins initialized!');
}).catch(err => {
    console.error(err);
});

router.get('/dht', async function (req, res, next) {
    try {
        let ret = await dht_read();
        await res.json(ret);
    } catch (e) {
        console.error("Could not serve dht data to client. Telling client we have no DHT sensor for now...", e);
        await res.json({sensorType: 'none'});
    }
});

router.get('/switch', async function (req, res, next) {
    let ret = {};
    if (req.query.id != null) {
        for (let i = 0; i < switches.length; i++) {
            if (switches[i].id == req.query.id) {
                ret = switches[i];
                ret.state = getPinState(ret.pin);
                i = switches.length;
            }
        }
        await res.json(ret);
    } else {
        switches = await updatePinStates(switches);
        await res.json(switches);
    }
});

router.post('/switch', async function (req, res, next) {
    console.log(req.body);
    for (let i = 0; i < switches.length; i++) {
        if (switches[i].id == req.body.id) {
            switches[i].state = req.body.state == 'true';
            poll_info.lastChange = Date.now();
            await setPin(switches[i].pin, switches[i].state);
            i = switches.length;
        }
    }
    switches = await updatePinStates(switches);
    await res.json(switches);
});

router.get('/lastChange', async function (req, res, next) {
    await res.json(poll_info);
});

async function setPin(pin_num, pin_state) {
    return await gpio.write(pin_num, pin_state);
}

async function setupPins(arr) {
    for (let i = 0; i < arr.length; i++) {
        await gpio.setup(arr[i].pin, gpio.DIR_OUT);
        arr[i].state = await getPinState(arr[i].pin);
    }
}

async function updatePinStates(arr) {
    for (let i = 0; i < arr.length; i++) {
        arr[i].state = await getPinState(arr[i].pin);
    }
    return arr;
}

async function getPinState(pin) {
    return await gpio.read(pin);
}

async function dht_read() {
    try {
        //fixme cache sensor data to avoid excess server load
        let data = await dht.read(11, 4);
        data.sensorType = 'DHT11';
        return data;
    } catch (err) {
        console.error("Failed to read sensor data:", err);
    }
}


module.exports = router;
