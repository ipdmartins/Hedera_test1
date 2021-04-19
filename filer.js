const {
    Client,
    FileCreateTransaction,
    FileAppendTransaction,
    FileInfoQuery,
    PrivateKey,
    AccountId,
    Hbar
} = require("@hashgraph/sdk");
require("dotenv").config();

const frameworkAnalyzer = require("./frameworkAnalyzer");
const si = require('systeminformation');
var process = require('process');
const fs = require('fs')

module.exports = class Filer {
    constructor() {
        this.path = '/home/ipdmartins/Hashgraph/';
    }

    async fileCreator(numberOfTransactions, appendFileContent, bytes, lotes) {
        const client = Client.forTestnet();
        if (process.env.OPERATOR_PRIVATE_KEY != null && process.env.OPERATOR_ID != null) {
            const operatorKey = PrivateKey.fromString(process.env.OPERATOR_PRIVATE_KEY);
            const operatorId = AccountId.fromString(process.env.OPERATOR_ID);
            client.setOperator(operatorId, operatorKey);
        }
        const resp = await new FileCreateTransaction()
            .setKeys([client.operatorPublicKey])
            .setContents("UDESC-ipdmartins-TCC-Hashgraph")
            // .setContents("[e2e::FileCreateTransaction]")
            .setMaxTransactionFee(new Hbar(3))
            .execute(client);

        const receipt = await resp.getReceipt(client);
        const fileId = receipt.fileId;
        console.log("file ID = " + fileId);
        this.uploader(client, numberOfTransactions, fileId, appendFileContent, resp, bytes, lotes);
    }

    async uploader(client, numberOfTransactions, fileId, appendFileContent, resp, bytes, lotes) {

        ///////// referent to analyzeTPND  /////////
        const dataPreviousNet = await si.networkStats().then(data => { return data; })
        const previousUPLOAD = dataPreviousNet[0].tx_bytes;
        const previousDOWNLOAD = dataPreviousNet[0].rx_bytes;
        ///////// referent to analyzeTPND  /////////

        var sumTxInputTxComfirmed = 0;
        var txconfirmedcount = 0;
        const previousProcessMemoryUsage = process.memoryUsage().rss;
        
        const milibefore = Date.now();//get the transaction beginning in millisec for analyzeTPS

        for (let index = 0; index < numberOfTransactions; index++) {
            var txInput = Date.now();//it's for analyzeARD

            //Submits a message to a public topic 
            await (await new FileAppendTransaction()
                .setNodeAccountIds([resp.nodeId])
                .setFileId(fileId)
                .setContents(appendFileContent)
                .setMaxTransactionFee(new Hbar(3))
                .execute(client))
                .getReceipt(client);

            //getting consensus timestamp on blockchain in seconds for analyzeARD
            var txConfirmed = Date.now();

            sumTxInputTxComfirmed += (txConfirmed - txInput)//it's for analyzeARD

            txconfirmedcount++;
        }

        //get the transaction's end in millicsec for analyzeTPS
        const miliafter = Date.now();

        const postProcessMemoryUsage = process.memoryUsage().rss; 

        ///////// referent to analyzeTPND  /////////
        const dataPostNet = await si.networkStats().then(data => { return data; })
        const postUPLOAD = dataPostNet[0].tx_bytes;
        const postDOWNLOAD = dataPostNet[0].rx_bytes;

        const UPLOAD = (postUPLOAD - previousUPLOAD) / 1000;
        const DOWNLOAD = (postDOWNLOAD - previousDOWNLOAD) / 1000;
        ///////// referent to analyzeTPND  /////////

        console.log();
        console.log('Resultado equivalente a: ' + bytes + ' bytes, ' +lotes+ ' lotes e com fileId: ' + fileId);
        const TPS = frameworkAnalyzer.analyzeTPS(txconfirmedcount, milibefore, miliafter);
        console.log("Transactions per second (txs/s): ", TPS);

        const ARD = frameworkAnalyzer.analyzeARD(sumTxInputTxComfirmed, txconfirmedcount)
        console.log("Average Response Delay in seconds (txs/s): ", ARD);

        const TPND = frameworkAnalyzer.analyzeTPND(txconfirmedcount, UPLOAD, DOWNLOAD)
        console.log("Transacoes de dados na rede (txs/kilobytes): ", TPND);

        ////////// LOGS /////////
        console.log('Resident Set Size process Node memory usage previous Mebabytes (MB): ', previousProcessMemoryUsage / 1000000)
        console.log('Resident Set Size process Node memory usage post Mebabytes (MB): ', postProcessMemoryUsage / 1000000)
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
        // let three = (TPC.TPC).toString()
        // three = three.replace('.', ',')
        // let four = (TPMS.TPMS).toString()
        // four = four.replace('.', ',')
        // let five = (TPDIO.TPDIO).toString()
        // five = five.replace('.', ',')
        let six = (TPND.TPND).toString()
        six = six.replace('.', ',')

        const result = `${one};${two};${six}\n`

        fs.appendFile(this.path+bytes+'_bytes'+lotes+'_lotes.txt', result, (err) => {
            if (err) throw err;
        });

        this.submitRecords(fileId, client, bytes);
    }

    async submitRecords(fileId, client, bytes) {
        //Create the query
        const query = new FileInfoQuery()
            .setFileId(fileId);

        //Sign the query with the client operator private key and submit to a Hedera network
        const getInfo = await query.execute(client);

        console.log("Transação de " + bytes + " bytes, com file size: " + getInfo.size + ' bytes' + ' com fileId: ' + fileId);

    }

}
