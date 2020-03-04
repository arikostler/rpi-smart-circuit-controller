const express = require('express');
const router = express.Router();

let switches = [
    {
        id: 0,
        name: 'light',
        pin: 0,
        state: 0
    }, {
        id: 1,
        name: 'fan',
        pin: 1,
        state: 1
    }
];

router.get('/switch', async function (req, res, next) {
    let ret = {};
    if (req.query.id != null) {
        for (let i = 0; i < switches.length; i++) {
            if (switches[i].id == req.query.id) {
                ret = switches[i];
                i = switches.length;
            }
        }
        await res.json(ret);
    } else {
        await res.json(switches); // fixme update switch states before sending
    }
});

router.post('/switch', async function (req, res, next) {
    console.log(req.body);
    for (let i = 0; i < switches.length; i++) {
        if (switches[i].id == req.body.id) {
            switches[i].state = req.body.state;
            // fixme update physical pin state
            i = switches.length;
        }
    }
    await res.json(switches);
});

module.exports = router;
