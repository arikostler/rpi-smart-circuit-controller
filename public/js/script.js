let switches = [];

$(async function () {
    await getPhysicalSwitches();
    updateAllWebSwitches();
});

async function switchClick(html_id) {
    console.log(`${html_id}: ${getWebSwitchState(html_id)}`);
    await setPhysicalSwitch(html_id, getWebSwitchState(html_id));

}

function getWebSwitchState(html_id) {
    return $('#' + html_id).prop('checked');
}

async function setPhysicalSwitch(switch_id, switch_state) {
    await $.post('/api/switch', {id: switch_id, state: switch_state}, function (data) {
        console.log(data)
        updateAllWebSwitches();
    })
}

function updateWebSwitch(html_id, switch_state) {
    $('#' + html_id).prop('checked', switch_state);
}

async function getPhysicalSwitches() {
    switches = await $.getJSON('/api/switch');
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
