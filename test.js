const { ContractFunctionSelector } = require("@hashgraph/sdk/lib/contract/ContractFunctionSelector");
// const systeminformation = require("./systeminformation");
const si = require('systeminformation');
// const Uriel = require('uriel');
// const config = require('./config')
// const process = require('process');
const axios = require('axios');

async function main(){
  // const starCpuUsage = await process.cpuUsage()
  // console.log('starCpuUsage: '+ starCpuUsage.user);

  // const cpuUsageByTheProcess = await process.cpuUsage(starCpuUsage)
  // console.log('cpuUsageByTheProcess: '+ cpuUsageByTheProcess.user);
  // console.log('cpuUsageByTheProcess user: '+ cpuUsageByTheProcess.user);

  const resp = await fetch("https://api.testnet.kabuto.sh/v1/transaction/bc3acda19d79aef2f8da592e312a0642850b93bb50d5ee6423546de0a654809d563b4aa6b5ae4b34284c85f5d0286c14");
  const transactions = await resp.json();
  console.log(transactions);
}

setInterval(function() {
  si.currentLoad().then(data => {
      console.log(data);
  })
}, 2000)



// var data = null;

// xhr.addEventListener("readystatechange", function () {
//   if (this.readyState === this.DONE) {
//     const data = this.responseText
//     console.log(this.responseText);
//     console.log(data.id);
//   }
// });

// xhr.open("GET", "https://api.testnet.kabuto.sh/v1/transaction/bc3acda19d79aef2f8da592e312a0642850b93bb50d5ee6423546de0a654809d563b4aa6b5ae4b34284c85f5d0286c14");
// xhr.setRequestHeader("accept", "application/json");

// xhr.send(data);


// axios({
//   method: 'get',
//   url: "https://api.testnet.kabuto.sh/v1/transaction/bc3acda19d79aef2f8da592e312a0642850b93bb50d5ee6423546de0a654809d563b4aa6b5ae4b34284c85f5d0286c14",
//   responseType: 'stream'
// })
//   .then(function (response) {
//     console.log(response.data.writable);
//     // response.data.pipe(fs.createWriteStream('ada_lovelace.jpg'))
//   });

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
