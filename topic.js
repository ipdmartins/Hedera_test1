const {
    TopicCreateTransaction,
    TopicMessageSubmitTransaction,
    TopicInfoQuery,
} = require("@hashgraph/sdk");
const si = require('systeminformation');
var process = require('process');
const fs = require('fs')

module.exports = class Topic {

    constructor() {
        this.path = '/home/ipdmartins/Hashgraph/';
    }

    async getTopicId(myaccount, message, numberOfTransactions, frameworkAnalyzer, bytes, lotes) {
        // create topic
        const createResponse = await new TopicCreateTransaction().execute(myaccount);

        // getting the receipt
        const createReceipt = await createResponse.getReceipt(myaccount);

        const topicId = createReceipt.topicId;

        console.log(`Created new topic ${topicId}`)

        this.submitTransaction(myaccount, message, numberOfTransactions, topicId, frameworkAnalyzer, bytes, lotes)
    }

    async submitTransaction(myaccount, message, numberOfTransactions, topicId, frameworkAnalyzer, bytes, lotes) {
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

        const previousProcessMemoryUsage = process.memoryUsage().rss;

        var sumTxInputTxComfirmed = 0;
        var txconfirmedcount = 0;

        const milibefore = Date.now();//get the transaction beginning in millisec for analyzeTPS

        for (let index = 0; index < numberOfTransactions; index++) {
            var txInput = Date.now();//it's for analyzeARD

            // send one message
            const sendResponse = await new TopicMessageSubmitTransaction({
                topicId: topicId,
                message: message,
            }).execute(myaccount);

            //getting consensus timestamp on blockchain in seconds for analyzeARD
            var txConfirmed = Date.now();

            const sendReceipt = await sendResponse.getReceipt(myaccount);

            const status = sendReceipt.status.toString();

            //se a transação foi efetivada, tx confirmadas adiciona 1
            if (status === 'SUCCESS') {
                sumTxInputTxComfirmed += (txConfirmed - txInput)//it's for analyzeARD

                txconfirmedcount++;
            } else {
                console.log(`transaction ${index + 1} failed.`)
            }
        }

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

        console.log();
        console.log('Resultado equivalente a: ' + bytes + ' bytes, ' +lotes+ ' lotes e com topicId: ' + topicId);
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
        console.log();
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

        const result = `${one};${two};${three};${four};${five};${six}\n`

        fs.appendFile(this.path+bytes+'_bytes'+lotes+'_lotes.txt', result, (err) => {
            if (err) throw err;
        });

        // var stream = fs.createWriteStream(`/home/ipdmartins/Hashgraph/file_${bytes}_bytes_ID_${topicId}.txt`);

        // stream.once('open', function (fd) {
        //     stream.write(`${one};`);
        //     stream.write(`${two};`);
        //     stream.write(`${three};`);
        //     stream.write(`${four};`);
        //     stream.write(`${five};`);
        //     stream.write(`${six}\n`);
        //     stream.end();
        // });

        this.log(topicId, myaccount, bytes)
    }

    async log(topicId, myaccount, bytes) {

        //Create the account info query
        const query = new TopicInfoQuery()
            .setTopicId(topicId);

        //Submit the query to a Hedera network
        const info = await query.execute(myaccount);

        //Print the account key to the console

        console.log("Transação de " + bytes + ' com topicId: ' + topicId);
        console.log(info.expirationTime);

    }

}

