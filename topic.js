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
        ///////// referent to analyzeTPND  /////////
        const dataPreviousNet = await si.networkStats().then(data => { return data; })
        const previousUPLOAD = dataPreviousNet[0].tx_bytes;
        const previousDOWNLOAD = dataPreviousNet[0].rx_bytes;
        ///////// referent to analyzeTPND  /////////

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

        ///////// referent to analyzeTPND  /////////
        const dataPostNet = await si.networkStats().then(data => { return data; })
        const postUPLOAD = dataPostNet[0].tx_bytes;
        const postDOWNLOAD = dataPostNet[0].rx_bytes;

        const UPLOAD = (postUPLOAD - previousUPLOAD) / 1000;
        const DOWNLOAD = (postDOWNLOAD - previousDOWNLOAD) / 1000;
        ///////// referent to analyzeTPND  /////////

        console.log();
        console.log('Resultado equivalente a: ' + bytes + ' bytes, com '+lotes+' lotes e com topicId: ' + topicId);
        const TPS = frameworkAnalyzer.analyzeTPS(txconfirmedcount, milibefore, miliafter);
        console.log("Transactions per second (txs/s): ", TPS);

        const ARD = frameworkAnalyzer.analyzeARD(sumTxInputTxComfirmed, txconfirmedcount)
        console.log("Average Response Delay in seconds (txs/s): ", ARD);

        const TPND = frameworkAnalyzer.analyzeTPND(txconfirmedcount, UPLOAD, DOWNLOAD)
        console.log("Transacoes de dados na rede (txs/kilobytes): ", TPND);

        ////////// LOGS /////////
        console.log('Transactions confirmed from t(i) to t(j): ' + txconfirmedcount);
        console.log('MilliTime before transaction: ' + milibefore);
        console.log('MilliTime after transaction: ' + miliafter);
        console.log('Sum of time in t (before transaction) and t (after success) in miliseconds: ' + sumTxInputTxComfirmed);
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
        let six = (TPND.TPND).toString()
        six = six.replace('.', ',')

        const result = `${one};${two};${six}\n`

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

