const {
    TopicCreateTransaction,
    TopicMessageSubmitTransaction,
} = require("@hashgraph/sdk");
const si = require('systeminformation');
var process = require('process');

const frameworkAnalyzer = require("./frameworkAnalyzer");
const { myaccount, testerAccount } = require('./myaccount');

var txconfirmedcount = 0;
var sumTxInputTxComfirmed = 0;

const message = 'Hello world';
const numberOfTransactions = 2;

getTopicId(myaccount.client, message, numberOfTransactions);

async function getTopicId(client, message, numberOfTransactions) {
    // create topic
    const createResponse = await new TopicCreateTransaction().execute(client);

    // getting the receipt
    const createReceipt = await createResponse.getReceipt(client);

    const topicId = createReceipt.topicId;

    console.log(`Created new topic ${topicId}`)

    submitTransaction(topicId, message, client, numberOfTransactions)
}

async function submitTransaction(topicId, message, client, numberOfTransactions) {
    ///////// referent to analyzeTPC  /////////
    const startCpuUsage = await si.currentLoad().then(data => {
        return data;
    })
    ///////// referent to analyzeTPC  /////////

    ///////// referent to analyzeTPDIO  /////////
    const dataPreviousIO = await si.disksIO().then(data => {
        return data;
    })
    ///////// referent to analyzeTPDIO  /////////

    ///////// referent to analyzeTPND  /////////
    const dataPreviousNet = await si.networkStats().then(data => { return data; })
    const previousUPLOAD = dataPreviousNet[0].tx_bytes;
    const previousDOWNLOAD = dataPreviousNet[0].rx_bytes;
    ///////// referent to analyzeTPND  /////////

    const milibefore = Date.now();//get the transaction beginning in millisec for analyzeTPS

    const previousProcessMemoryUsage = process.memoryUsage().rss;

    for (let index = 0; index < numberOfTransactions; index++) {
        var txInput = Date.now();//it's for analyzeARD

        // send one message
        const sendResponse = await new TopicMessageSubmitTransaction({
            topicId: topicId,
            message: message,
        }).execute(client);

        const sendReceipt = await sendResponse.getReceipt(client);

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

    const postProcessMemoryUsage = process.memoryUsage().rss;

    ///////// referent to analyzeTPC  /////////
    const cpuUsageByTheProcess = await si.currentLoad().then(data => {
        return data;
    })
    const coreFrequency = await si.cpuCurrentSpeed().then(data => data.cores[0]);
    ///////// referent to analyzeTPC  /////////

    ///////// referent to analyzeTPMS  /////////
    const dataPostMem = await si.processes().then(data => {
        return data;
    })
    const RMEM = dataPostMem.list[0].mem_rss;
    const VMEM = dataPostMem.list[0].mem_vsz;
    ///////// referent to analyzeTPMS  /////////

    ///////// referent to analyzeTPDIO  /////////
    const dataPostIO = await si.disksIO().then(data => {
        return data;
    })

    const DISKR = (dataPostIO.rIO - dataPreviousIO.rIO) / 1000;
    const DISKW = (dataPostIO.wIO - dataPreviousIO.wIO) / 1000;
    ///////// referent to analyzeTPDIO  /////////    

    ///////// referent to analyzeTPND  /////////
    const dataPostNet = await si.networkStats().then(data => { return data; })
    const postUPLOAD = dataPostNet[0].tx_bytes;
    const postDOWNLOAD = dataPostNet[0].rx_bytes;

    const UPLOAD = (postUPLOAD - previousUPLOAD) / 1000;
    const DOWNLOAD = (postDOWNLOAD - previousDOWNLOAD) / 1000;
    ///////// referent to analyzeTPND  /////////

    const TPS = frameworkAnalyzer.analyzeTPS(txconfirmedcount, milibefore, miliafter);
    console.log("Transactions per second (txs/s): ", TPS);

    const ARD = frameworkAnalyzer.analyzeARD(sumTxInputTxComfirmed, txconfirmedcount)
    console.log("Average Response Delay in seconds (txs/s): ", ARD);

    const TPC = frameworkAnalyzer.analyzeTPC(txconfirmedcount, coreFrequency, cpuUsageByTheProcess.raw_currentload_user)
    console.log("Transactions Per CPU in seconds (txs/(GHz · s)): ", TPC);

    const TPMS = frameworkAnalyzer.analyzeTPMS(txconfirmedcount, RMEM, VMEM)
    console.log("Transacoes de memoria por segundo (txs/(MB · s)): ", TPMS);

    const TPDIO = frameworkAnalyzer.analyzeTPDIO(txconfirmedcount, DISKR, DISKW)
    console.log("Transacoes por disco (txs/kilobytes): ", TPDIO);

    const TPND = frameworkAnalyzer.analyzeTPND(txconfirmedcount, UPLOAD, DOWNLOAD)
    console.log("Transacoes de dados na rede (txs/kilobytes): ", TPND);

    ////////// LOGS /////////
    console.log('Resident Set Size process Node memory usage previous Mebabytes (MB): ', previousProcessMemoryUsage / 1000000)
    console.log('Resident Set Size process Node memory usage post Mebabytes (MB): ', postProcessMemoryUsage / 1000000)
    console.log('Transactions confirmed from t(i) to t(j): ' + txconfirmedcount);
    console.log('MilliTime before transaction: ' + milibefore);
    console.log('MilliTime after transaction: ' + miliafter);
    console.log('Sum of time in t (before transaction) and t (after success) in miliseconds: ' + sumTxInputTxComfirmed);
    console.log('Measured single core: ' + coreFrequency);
    console.log('Measured CPU user raw current load transaction: ' + cpuUsageByTheProcess.raw_currentload_user);
    console.log('Measured process real memory resident set size after transaction: ' + RMEM);
    console.log('Measured process virtual memory size after transaction: ' + VMEM);
    console.log('Measured data read IOs on all mounted drives before transaction: ' + dataPreviousIO.rIO);
    console.log('Measured data read read IOs on all mounted drives after transaction: ' + dataPostIO.rIO);
    console.log('Measured data written IOs on all mounted drives before transaction: ' + dataPreviousIO.wIO);
    console.log('Measured data written IOs on all mounted drives after transaction: ' + dataPostIO.wIO);
    console.log('Measured transferred bytes overall (upload) before transacion: ' + previousUPLOAD);
    console.log('Measured transferred bytes overall (upload) after transacion: ' + postUPLOAD);
    console.log('Measured received bytes overall (download) before transacion: ' + previousDOWNLOAD);
    console.log('Measured received bytes overall (download) after transacion: ' + postDOWNLOAD);
    ////////// LOGS /////////

    // log(topicId, client)
}

async function log(topicId, client) {

    const topicInfo = await new ConsensusTopicInfoQuery()
        .setTopicId(topicId)
        .execute(client);

    console.log(
        `Sequence Number: ${topicInfo.sequenceNumber}
     Running Hash: ${topicInfo.runningHash}
     Expiration Time: ${topicInfo.expirationTime}
     Topic Memo: ${topicInfo.topicMemo}`);

}

