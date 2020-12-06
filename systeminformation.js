const si = require('systeminformation');

// promises style - new since version 3

module.exports = {
     cpuSingleCoreLog(){
        return si.cpuCurrentspeed().then(data => data.cores[0]);
    },
  

}


