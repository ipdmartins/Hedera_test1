const si = require('systeminformation');

// promises style - new since version 3

function test(){

    si.cpuCurrentspeed().then(data => console.log(data));
}

test();