const { FileCreateTransaction, Hbar } = require("@hashgraph/sdk");
require("dotenv").config();
const si = require('systeminformation');
var process = require('process');

const { myaccount, testerAccount } = require('./myaccount');
const frameworkAnalyzer = require("./frameworkAnalyzer");

var txconfirmedcount = 0;
var sumTxInputTxComfirmed = 0;

// messenger(myaccount.operatorAccountId, myaccount.client, testerAccount.testerAccountId, 50);
fileCreator(testerAccount.testerPublicKey, myaccount.client);

async function fileCreator(filePublicKey, client) {

    const fileKey = await Ed25519PrivateKey.generate();

    //Create the transaction
    const transaction = await new FileCreateTransaction()
        .setKeys([filePublicKey]) //A different key then the client operator key
        .setContents("the file contents")
        .setMaxTransactionFee(new Hbar(2))
        .freezeWith(client);

    //Sign with the file private key
    const signTx = await transaction.sign(fileKey);

    //Sign with the client operator private key and submit to a Hedera network
    const submitTx = await signTx.execute(client);

    //Request the receipt
    const receipt = await submitTx.getReceipt(client);

    //Get the file ID
    const newFileId = receipt.fileId;

    console.log("The new file ID is: " + newFileId);

    messenger(client, 3, topicId);
}

async function messenger(client, numberOfTransactions, topicId) {

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

        //Submits a message to a public topic 
        const transactionProccess = transaction(topicId, client)

        console.log(transactionProccess)

        //se a transação foi efetivada, tx confirmadas adiciona 1
        if (transactionProccess.status == "SUCCESS") {
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
    const coreFrequency = await si.cpuCurrentspeed().then(data => data.cores[0]);
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
    // console.log('Resident Set Size process Node memory usage previous Mebabytes (MB): ', previousProcessMemoryUsage / 1000000)
    // console.log('Resident Set Size process Node memory usage post Mebabytes (MB): ', postProcessMemoryUsage / 1000000)
    // console.log('Transactions confirmed from t(i) to t(j): ' + txconfirmedcount);
    // console.log('MilliTime before transaction: ' + milibefore);
    // console.log('MilliTime after transaction: ' + miliafter);
    // console.log('Sum of time in t (before transaction) and t (after success) in miliseconds: ' + sumTxInputTxComfirmed);
    // console.log('Measured single core: ' + coreFrequency);
    // console.log('Measured CPU user raw current load transaction: ' + cpuUsageByTheProcess.raw_currentload_user);
    // console.log('Measured process real memory resident set size after transaction: ' + RMEM);
    // console.log('Measured process virtual memory size after transaction: ' + VMEM);
    // console.log('Measured data read IOs on all mounted drives before transaction: ' + dataPreviousIO.rIO);
    // console.log('Measured data read read IOs on all mounted drives after transaction: ' + dataPostIO.rIO);
    // console.log('Measured data written IOs on all mounted drives before transaction: ' + dataPreviousIO.wIO);
    // console.log('Measured data written IOs on all mounted drives after transaction: ' + dataPostIO.wIO);
    // console.log('Measured transferred bytes overall (upload) before transacion: ' + previousUPLOAD);
    // console.log('Measured transferred bytes overall (upload) after transacion: ' + postUPLOAD);
    // console.log('Measured received bytes overall (download) before transacion: ' + previousDOWNLOAD);
    // console.log('Measured received bytes overall (download) after transacion: ' + postDOWNLOAD);
    ////////// LOGS /////////

    // submitRecords(topicId);

}

async function transaction(topicId, client) {
    try {
        //Create the transaction
        const transaction = await new TopicMessageSubmitTransaction({
            topicId: topicId,
            message: "Hello World",
        }).execute(client);


        return transaction;
    } catch (error) {
        console.log('Error transaction message: ' + error)
    }
}

async function submitRecords(topicId) {
    //Create the transaction
    const transaction = await new TopicMessageSubmitTransaction()
        .setTopicId(topicId)

    //Get the transactio message
    const getMessage = transaction.getMessage();

    console.log("MY MESSAGES: ", getMessage);
}