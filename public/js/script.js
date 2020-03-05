let switches = [];

$(async function () {
    await getPhysicalSwitches();
    updateAllWebSwitches();
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
