
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const { myaccount, testerAccount } = require('./myaccount');
const frameworkAnalyzer = require("./frameworkAnalyzer");
const Topic = require('./topic');
const Filer = require('./filer');

const message = 'L';
// const message = 'Lorem ipsu';
// const message = 'Lorem ipsum egestas lorem aliquam sapien, vivamus taciti innunc Lorem ipsum egestas lorem aliquam se';

if (isMainThread) {
    for (let index = 0; index < 3; index++) {
        const worker = new Worker(__filename, { workerData: { num: 2 } })
        worker.once('message', function () {
            console.log('Thread worker id: ' + worker.threadId + ' finished');
        })
        worker.on('error', console.error);
        console.log('Iniciando worker id: ' + worker.threadId);
    }
} else {
    if (!workerData) return;

    setTimeout(executor, 2000);
    
}

function executor(){
    const numberOfTransactions = workerData.num;

    // const topic = new Topic();
    // topic.getTopicId(myaccount, message, numberOfTransactions, frameworkAnalyzer)
    
    const filer = new Filer();
    filer.fileCreator(numberOfTransactions, message)

    parentPort.postMessage("Concluded");
}
