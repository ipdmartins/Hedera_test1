const {
    Client,
    FileCreateTransaction,
    FileAppendTransaction,
    FileContentsQuery,
    PrivateKey,
    AccountId,
    Hbar
} = require("@hashgraph/sdk");
const si = require('systeminformation');
var process = require('process');
const fs = require('fs')

const frameworkAnalyzer = require("./frameworkAnalyzer");
const { myaccount, testerAccount } = require('./myaccount');

var txconfirmedcount = 0;
var sumTxInputTxComfirmed = 0;

const appendFileContent = 'Hello world';
const numberOfTransactions = 2;

fileCreator(myaccount, numberOfTransactions, appendFileContent);
myaccount.operatorPublicKey

async function fileCreator(myaccount, numberOfTransactions, appendFileContent) {

    const transaction = await new FileCreateTransaction()
        .setKeys([myaccount.operatorPublicKey])
        .setContents("UDESC init File: ")
        .setMaxTransactionFee(new Hbar(2))
        .execute(myaccount.client);

    const receipt = await transaction.getReceipt(myaccount.client);
    const nodeId = transaction.nodeId;
    const fileId = receipt.fileId;

    console.log("file ID = " + fileId + 'node ID: ' + nodeId);

    uploader(myaccount, numberOfTransactions, nodeId, fileId, appendFileContent);
}

async function uploader(myaccount, numberOfTransactions, nodeId, fileId, appendFileContent) {

    ///////// referent to analyzeTPC  /////////
    await si.currentLoad().then(data => {
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
        const transactionProccess = await (await new FileAppendTransaction()
            .setNodeAccountIds([nodeId])
            .setFileId(fileId)
            .setContents(appendFileContent)
            .setMaxTransactionFee(new Hbar(2))
            .execute(myaccount.client))
            .getReceipt(myaccount.client);

        const status = transactionProccess.status.toString();

        //se a transação foi efetivada, tx confirmadas adiciona 1
        if (status === "SUCCESS") {
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
    const RMEM = dataPostMem.list[0].memRss;
    const VMEM = dataPostMem.list[0].memVsz;
    ///////// referent to analyzeTPMS  /////////

    ///////// referent to analyzeTPDIO  /////////
    const dataPostIO = await si.disksIO().then(data => {
        return data;
    })

    const DISKR = (dataPostIO.rIO - dataPreviousIO.rIO);
    const DISKW = (dataPostIO.wIO - dataPreviousIO.wIO);
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

    const TPC = frameworkAnalyzer.analyzeTPC(txconfirmedcount, coreFrequency, cpuUsageByTheProcess.rawCurrentLoadUser)
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
    console.log('Measured CPU user raw current load transaction: ' + cpuUsageByTheProcess.rawCurrentLoadUser);
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

    let one = (TPS.TPS).toString()
    one = one.replace('.', ',')
    let two = (ARD.ARD).toString()
    two = two.replace('.', ',')
    let three = (TPC.TPC).toString()
    three = three.replace('.', ',')
    let four = (TPMS.TPMS).toString()
    four = four.replace('.', ',')
    let five = (TPDIO.TPDIO).toString()
    five = five.replace('.', ',')
    let six = (TPND.TPND).toString()
    six = six.replace('.', ',')

    var stream = fs.createWriteStream("/home/ipdmartins/Hashgraph/my_file.txt");
    stream.once('open', function (fd) {
        stream.write(`${one}\n`);
        stream.write(`${two}\n`);
        stream.write(`${three}\n`);
        stream.write(`${four}\n`);
        stream.write(`${five}\n`);
        stream.write(`${six}\n`);
        stream.end();
    });

    submitRecords(topicId);

}

async function submitRecords(topicId) {
    //Create the transaction
    const transaction = await new TopicMessageSubmitTransaction()
        .setTopicId(topicId)

    //Get the transactio message
    const getMessage = transaction.getMessage();

    console.log("MY MESSAGES: ", getMessage);
}