let switches = [];
let polling_task = null;
let poll_info = {lastChange: 0};
let weather_task = null;

$(async function () {
    await getPhysicalSwitches();
    updateAllWebSwitches();
    // await updateWeatherDisplay();
    polling_task = setInterval(async function () {
        try {
            let data = await $.getJSON('/api/lastChange');
            if (poll_info.lastChange !== data.lastChange) {
                await getPhysicalSwitches();
                updateAllWebSwitches();
                poll_info = data;
            }
        } catch (e) {
            console.error('Could not poll server to check for updates! Is the server down?', e);
        }
    }, 2000);
    // weather_task = setInterval(async function () {
    //     try {
    //         await updateWeatherDisplay();
    //     } catch (e) {
    //         console.error('Could not poll server to check for updates! Is the server down?', e);
    //     }
    // }, 15000);
});

function switchClick(html_id) {
    console.log(`${html_id}: ${getWebSwitchState(html_id)}`);
    let switch_id = null;
    let found = false;
    for (let i = 0; i < switches.length; i++) {
        if (switches[i].name == html_id) {
            switch_id = switches[i].id;
            found = true;
        }
    }
    if (found) {
        setPhysicalSwitch(switch_id, getWebSwitchState(html_id));
    } else {
        console.error("Switch could not be found!");
    }
}

function getWebSwitchState(html_id) {
    return $('#' + html_id).prop('checked');
}

function setPhysicalSwitch(switch_id, switch_state) {
    $.post('/api/switch', {id: switch_id, state: switch_state}, function (data) {
        console.log(data);
        switches = data;
        updateAllWebSwitches();
    });
}

function updateWebSwitch(html_id, switch_state) {
    $('#' + html_id).prop('checked', switch_state);
}

async function getPhysicalSwitches() {
    switches = await $.getJSON('/api/switch');
    return switches;
}

async function getPhysicalSwitchState(switchId) {
    let json = await $.getJSON('/api/switch?id=' + switchId);
    return json["state"];
}

function updateAllWebSwitches() {
    for (let i = 0; i < switches.length; i++) {
        updateWebSwitch(switches[i].name, switches[i].state);
    }
}

async function getDhtSensorData() {
    try {
        let json = await $.getJSON('/api/dht');
        json.ftemperature = (json.temperature * (9 / 5)) + 32;
        return json;
    } catch (e) {
        console.error('Could not retrieve Temperature/Humidity data!', e);
    }
}

async function updateWeatherDisplay() {
    let data = await getDhtSensorData();
    $('#humid').text(data.humidity);
    $('#temp').text(data.ftemperature.toFixed(1));
}
