const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const Pool = require('worker-thread-pool');
const CPUS = require('os').cpus().length;
const pool = new Pool({max: CPUS});

const sideExecution = workerData => {
    return new Promise((resolve, reject ) =>{
        pool.acquire(__filename, {workerData}, (err, worker) => {
            if(err) reject(err);
            console.log(`started worker ${worker} pool size: ${pool.size}`);
            worker.on('message', resolve);
            worker.on('error', reject);
            worker.on('exit', code =>{
                if(code !==0) reject(new Error('Worker stopped with exit code: '+ code));
            });
        })
        // const worker = new Worker(__filename, {workerData});

    })
}

if(!isMainThread) {
    // const result = () =>{
    //     let num = 0;
    //     for (let index = 0; index < workerData.iterations; index++) {
    //         num++;
    //     }
    //     return num;
    // } 
    parentPort.postMessage(workerData.iterations);
    Atomics.add()
  }

  module.exports = sideExecution;