/*
The process.cpuUsage() method is an inbuilt application programming interface of the Process module 
which is used to get the user, system CPU time usage of the current process. It is returned as an object 
with property user and system, values are in microseconds. Return values may differ from the actual time 
elapsed especially for multi-core CPUs.
*/

// Allocating process module 
const process = require('process'); 

function main() {
    var startTime = process.hrtime()
    var startUsage = process.cpuUsage()

    
    var now = Date.now()

    console.log('startTime:      ', startTime)
    console.log('startUsage:      ', startUsage)
    console.log('now:      ', now)
    
    // Loop to delay almost 500 miliseconds 
    while (Date.now() - now < 500)
    
    var elapTime = process.hrtime(startTime)//o que faz???
    var elapUsage = process.cpuUsage(startUsage)//o que faz???
    console.log('elapTime:      ', elapTime)
    console.log('elapUsage:      ', elapUsage)

    var elapTimeMS = secNSec2ms(elapTime)
    var elapUserMS = secNSec2ms(elapUsage.user)
    var elapSystMS = secNSec2ms(elapUsage.system)
    var cpuPercent = Math.round(100 * (elapUserMS + elapSystMS) / elapTimeMS)

    console.log('elapsed time ms:  ', elapTimeMS)
    console.log('elapsed user ms:  ', elapUserMS)
    console.log('elapsed system ms:', elapSystMS)
    console.log('cpu percent:      ', cpuPercent)

    function secNSec2ms(secNSec) {
        if (Array.isArray(secNSec)) {
            return secNSec[0] * 1000 + secNSec[1] / 1000000;
        }
        return secNSec / 1000;
    }

}

main();