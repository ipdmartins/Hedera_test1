const { ContractFunctionSelector } = require("@hashgraph/sdk/lib/contract/ContractFunctionSelector");
const systeminformation = require("./systeminformation");
const si = require('systeminformation');
const Uriel = require('uriel');
const config = require('./config')
const process = require('process');

async function main(){
  const starCpuUsage = await process.cpuUsage()
  console.log('starCpuUsage: '+ starCpuUsage.user);

  const cpuUsageByTheProcess = await process.cpuUsage(starCpuUsage)
  console.log('cpuUsageByTheProcess: '+ cpuUsageByTheProcess.user);
  console.log('cpuUsageByTheProcess user: '+ cpuUsageByTheProcess.user);

}

setInterval(function() {
  si.networkStats().then(data => {
    console.log(data);

  })
}, 20000)
  // Create a new agent
  // let statsd = new Uriel(config);
 
  // Initialize and start the uriel agent
  // statsd.init();
 
  // close and shutdown the uriel agent
  // statsd.close();

// async function newAccount() {
//     console.log(await systeminformation.func())
// }

// si.networkStats().then(data => {
//     console.log('Transferred: ', data[0].tx_sec);
//     console.log('Transferred: ', data[0].rx_sec);
//   })

//   setInterval(function() {
//     si.networkStats().then(data => {
//         console.log(data);
//     })
// }, 1000)
