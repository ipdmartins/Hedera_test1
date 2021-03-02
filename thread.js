const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const {
    TopicMessageSubmitTransaction,
} = require("@hashgraph/sdk");

const teste = require('./topic')

if(isMainThread){
    // console.log('main')
    new Worker(__filename, {workerData: {num: 145}})
    new Worker(__filename, {workerData: {num: 343}})
    new Worker(__filename, {workerData: {num: 4546}})
}else {
    if(!workerData) return;
    // console.log('thread', workerData.num)
    teste(workerData.num)
}




// const pool = new Pool({ max: CPUS });


// const consensus = workerData => {
//     return new Promise((resolve, reject) => {
//         const worker = new Worker(__filename, { workerData });

//         worker.on('message', resolve);
//         worker.on('error', reject);
//         worker.on('exit', code => {
//             if (code !== 0) reject(new Error(`Worker stopped with exit code ${code}`));
//         });
//     });
// }

// if (!isMainThread) {
//     const sharedArray = workerData.arr;
//     Atomics.add(sharedArray, workerData.position, 'hello world');
//     parentPort.postMessage(sharedArray);
// }

// const consensus = workerData => {
//     return new Promise((resolve, reject) => {
//         pool.acquire(__filename, { workerData }, (err, worker) => {
//             if (err) reject(err);
//             console.log(`started worker ${worker} pool size: ${pool.size}`);
//             worker.on('message', resolve);
//             worker.on('error', reject);
//             worker.on('exit', code => {
//                 if (code !== 0) reject(new Error('Worker stopped with exit code: ' + code));
//             });
//         })
//         // const worker = new Worker(__filename, {workerData});

//     })
// }

// const filer = workerData => {
//     return new Promise((resolve, reject) => {
//         pool.acquire(__filename, { workerData }, (err, worker) => {
//             if (err) reject(err);
//             console.log(`started worker ${worker} pool size: ${pool.size}`);
//             worker.on('message', resolve);
//             worker.on('error', reject);
//             worker.on('exit', code => {
//                 if (code !== 0) reject(new Error('Worker stopped with exit code: ' + code));
//             });
//         })
//         const worker = new Worker(__filename, {workerData});

//     })
// }

if (!isMainThread) {
    console.log('AQUI')
    console.log(workerData.iterations)
    const sharredArray = workerData.arr;
    const numberOfTransactions = workerData.iterations;
    var sumTxInputTxComfirmed = 0;
    var txconfirmedcount = 0;

    const milibefore = Date.now();//get the transaction beginning in millisec for analyzeTPS

    for (let index = 0; index < numberOfTransactions; index++) {
        var txInput = Date.now();//it's for analyzeARD

        // send one message
        const sendResponse = new TopicMessageSubmitTransaction({
            topicId: workerData.topicId,
            message: workerData.message,
        }).execute(workerData.client);

        const sendReceipt = sendResponse.getReceipt(workerData.client);

        const status = sendReceipt.status.toString();

        //se a transação foi efetivada, tx confirmadas adiciona 1
        if (status === 'SUCCESS') {
            //getting consensus timestamp on blockchain in seconds for analyzeARD
            var txConfirmed = Date.now();

            sumTxInputTxComfirmed += (txConfirmed - txInput)//it's for analyzeARD

            txconfirmedcount++;
        } else {
            console.log(`transaction ${index + 1} failed.`)
        }
    }

    //get the transaction's end in millicsec for analyzeTPS
    const miliafter = Date.now();

    const result = {
        milibefore,
        sumTxInputTxComfirmed,
        txconfirmedcount,
        miliafter
    }

    Atomics.add(sharredArray, workerData.position, result);
    parentPort.postMessage(result);
}


// module.exports = consensus;