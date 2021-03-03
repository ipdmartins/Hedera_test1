
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const { myaccount, testerAccount } = require('./myaccount');
const frameworkAnalyzer = require("./frameworkAnalyzer");
const Topic = require('./topic');
const Filer = require('./filer');

const message1 = 'L';
const message10 = 'Lorem ipsu';
const message100 = 'Lorem ipsum egestas lorem aliquam sapien, vivamus taciti innunc Lorem ipsum egestas lorem aliquam se';

if (isMainThread) {
    for (let index = 0; index < 5; index++) {
        const worker = new Worker(__filename, { workerData: { num: 100, cond: 1 } })
        worker.once('message', function () {
            console.log('Thread worker id: ' + worker.threadId + ' finished');
        })
        worker.on('error', console.error); 
        console.log('Iniciando worker id: ' + worker.threadId);
    }

    for (let index = 0; index < 5; index++) { 
        const worker = new Worker(__filename, { workerData: { num: 400, cond: 10 } })
        worker.once('message', function () {
            console.log('Thread worker id: ' + worker.threadId + ' finished');
        })
        worker.on('error', console.error);
        console.log('Iniciando worker id: ' + worker.threadId);
    }

    for (let index = 0; index < 5; index++) {
        const worker = new Worker(__filename, { workerData: { num: 25, cond: 100 } })
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

    const cond = workerData.cond;

    if(cond === 1){
        const topic = new Topic();
        topic.getTopicId(testerAccount, message1, numberOfTransactions, frameworkAnalyzer, cond)
    }

    if(cond === 10){
        const topic = new Topic();
        topic.getTopicId(testerAccount, message10, numberOfTransactions, frameworkAnalyzer, cond)
    }

    if(cond === 100){
        const topic = new Topic();
        topic.getTopicId(testerAccount, message100, numberOfTransactions, frameworkAnalyzer, cond)
    }

    
    // const filer = new Filer();
    // filer.fileCreator(numberOfTransactions, message)

    parentPort.postMessage("Concluded");
}
