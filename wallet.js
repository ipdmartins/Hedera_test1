const { Ed25519PrivateKey, AccountCreateTransaction, AccountInfoQuery,
    AccountUpdateTransaction, TransferTransaction,
    AccountBalanceQuery } = require("@hashgraph/sdk");
const si = require('systeminformation');
const process = require('process');

const { myaccount, testerAccount } = require('./myaccount');
const frameworkAnalyzer = require("./frameworkAnalyzer");

var txconfirmedcount = 0;
var sumTxInputTxComfirmed = 0;
var cpuData = [];
var readData = [];
var writeData = [];
var downloadData = [];
var uploadData = [];
var miliTimeData = [];

// transfer(testerAccount.testerAccountId, 1000);
newAccount(myaccount.operatorAccountId, myaccount.client);

async function newAccount(operatorAccountId, client) {
    const myAccountBalance = await new AccountBalanceQuery()
        .setAccountId(operatorAccountId)
        .execute(client);

    //DELETE IN REAL TEST
    console.log(`MY ACCOUNT BALANCE BEFORE TRANSFER:: ${myAccountBalance}`);
    //DELETE IN REAL TEST

    const newPrivateKey = await Ed25519PrivateKey.generate();
    
    //Creating an account
    const newTransactionId = await new AccountCreateTransaction()
        .setKey(newPrivateKey.publicKey)
        .setInitialBalance(100)
        .execute(client);

    const transactionReceipt = await newTransactionId.getReceipt(client);

    const newAccountId = transactionReceipt.getAccountId();

    const newAccountBalance = await new AccountBalanceQuery()
        .setAccountId(newAccountId)
        .execute(client);

    //DELETE IN REAL TEST
    console.log("CLIENT ACCOUNT BALANCE BEFORE TRANSFER: " + newAccountBalance);
    //DELETE IN REAL TEST
    
    transfer(operatorAccountId, client, newAccountId, 5);
    //updateAccount(newAccountId, newPrivateKey);
}

async function transfer(operatorAccountId, client, receiverAccountId, numberOfTransactions) {
    ///////// referent to analyzeTPC  /////////
    const startCpuUsage = await si.currentLoad().then(data => {
        return data;
    })

    // cpuData.push(startCpuUsage.user);
    // console.log('startCpuUsage: '+ startCpuUsage.user);
    ///////// referent to analyzeTPC  /////////

    ///////// referent to analyzeTPDIO  /////////
    const dataPreviousIO = await si.disksIO().then(data => {
        return data;
      })
    
    readData.push(dataPreviousIO.rIO);
    writeData.push(dataPreviousIO.wIO);
    // console.log('previousREAD: '+ dataPreviousIO.rIO);
    // console.log('previousWRITE: '+ dataPreviousIO.wIO);
    ///////// referent to analyzeTPDIO  /////////

    ///////// referent to analyzeTPND  /////////
    const dataPreviousNet = await si.networkStats().then(data => {return data;})
    const previousUPLOAD = dataPreviousNet[0].tx_bytes;
    const previousDOWNLOAD = dataPreviousNet[0].rx_bytes;
    downloadData.push(previousDOWNLOAD);
    uploadData.push(previousUPLOAD);
    // console.log('previousUPLOAD: '+ previousUPLOAD);
    // console.log('previousDOWNLOAD: '+ previousDOWNLOAD);
    ///////// referent to analyzeTPND  /////////
    
    const milibefore = Date.now();//get the transaction beginning in millisec for analyzeTPS
    // const before = milibefore / 1000;//converting milisec to seconds
    miliTimeData.push(milibefore);
    
    // var calc = 0;
    var receipt = null;
    for (let index = 0; index < numberOfTransactions; index++) {
        var txInput = Date.now();//it's for analyzeARD

        const transaction = await new TransferTransaction()
        .addHbarTransfer(operatorAccountId, -144)
        .addHbarTransfer(receiverAccountId, 144)
        .execute(client);

        // const transation = (await new CryptoTransferTransaction()
        //     .addSender(myaccount.operatorAccountId, 55)
        //     .addRecipient(receiverAccountId, 55)
        //     .setTransactionMemo("sdk example")
        //     .execute(myaccount.client))
        //     .getReceipt(myaccount.client)
        // .getRecord(client)

        const transactionReceipt = await transaction.getReceipt(client);
        
        //se a transação foi efetivada, tx confirmadas adiciona 1
        if (transactionReceipt.status == "SUCCESS") {
            //getting consensus timestamp on blockchain in seconds for analyzeARD
            // var time = Date.now() / 1000;
            // var txConfirmed = (await transation.getRecord(myaccount.client)).consensusTimestamp.seconds;
            var txConfirmed = Date.now();
            sumTxInputTxComfirmed += (txConfirmed - txInput)//it's for analyzeARD
            // console.log('txConfirmed: '+txConfirmed+', txInput: '+txInput+', sumTxInputTxComfirmed: '+sumTxInputTxComfirmed);
            // calc += (time - txInput)//it's monitore what's going on analyzeARD
            // console.log('time: '+time+', txInput: '+txInput+', calc: '+calc);
            
            txconfirmedcount++;
        } else {
            console.log(`transaction ${index + 1} failed.`)
        }
    }
    const miliafter = Date.now();//get the transaction's end in millicsec for analyzeTPS
    // const after = miliafter / 1000;//converting milisec to seconds
    miliTimeData.push(miliafter);
    // console.log('Time after per sec: '+ after);
    
    ///////// referent to analyzeTPC  /////////
    const cpuUsageByTheProcess = await si.currentLoad().then(data => {
        return data;
    })
    const coreFrequency = await si.cpuCurrentspeed().then(data => data.cores[0]);

    cpuData.push(cpuUsageByTheProcess.user);
    // console.log('cpuUsageByTheProcess: '+ cpuUsageByTheProcess.user);
    // console.log('coreFrequency: '+ coreFrequency);
    ///////// referent to analyzeTPC  /////////

    ///////// referent to analyzeTPMS  /////////
    const dataPostMem = await si.processes().then(data => {
        return data;
    })
    const RMEM = dataPostMem.list[0].mem_rss;
    const VMEM = dataPostMem.list[0].mem_vsz;

    // console.log('postMem: '+ RMEM);
    // console.log('postVirtualMem: '+ VMEM)
    ///////// referent to analyzeTPMS  /////////
    
    ///////// referent to analyzeTPDIO  /////////
    const dataPostIO = await si.disksIO().then(data => {
        return data;
      })

    readData.push(dataPostIO.rIO);
    writeData.push(dataPostIO.wIO);

    // console.log('postREAD: '+ dataPostIO.rIO);
    // console.log('postWRITE: '+ dataPostIO.wIO);
    const DISKR = dataPostIO.rIO - dataPreviousIO.rIO;
    const DISKW = dataPostIO.wIO - dataPreviousIO.wIO;

    // const processFSII = process.resourceUsage();
    // console.log('process.resourceUsage postREAD: '+ processFSII.fsRead);
    // console.log('process.resourceUsage postWRITE: '+ processFSII.fsWrite);
    ///////// referent to analyzeTPDIO  /////////    

    ///////// referent to analyzeTPND  /////////
    const dataPostNet = await si.networkStats().then(data => {return data;})
    const postUPLOAD = dataPostNet[0].tx_bytes;
    const postDOWNLOAD = dataPostNet[0].rx_bytes;

    downloadData.push(postDOWNLOAD);
    uploadData.push(postUPLOAD);


    const UPLOAD = postUPLOAD - previousUPLOAD;
    const DOWNLOAD = postDOWNLOAD - previousDOWNLOAD;
    // console.log('UPLOAD: '+ UPLOAD);
    // console.log('DOWNLOAD: '+ DOWNLOAD);
    ///////// referent to analyzeTPND  /////////

    // console.log(receipt.conconsensusTimestamp.seconds);

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

    console.log('Transactions confirmed from t(i) to t(j): '+ txconfirmedcount);
    console.log('MilliTime before transaction: '+ milibefore);
    console.log('MilliTime after transaction: '+ miliafter);
    console.log('Sum of time in t (before transaction) and t (after success) in miliseconds: '+ sumTxInputTxComfirmed);
    console.log('Measured single core: '+ coreFrequency);
    console.log('Measured CPU user raw current load transaction: '+ cpuUsageByTheProcess.raw_currentload_user);
    console.log('Measured process real memory resident set size after transaction: '+ RMEM);
    console.log('Measured process virtual memory size after transaction: '+ VMEM);
    console.log('Measured data read IOs on all mounted drives before transaction: '+ dataPreviousIO.rIO);
    console.log('Measured data read read IOs on all mounted drives after transaction: '+ dataPostIO.rIO);
    console.log('Measured data written IOs on all mounted drives before transaction: '+ dataPreviousIO.wIO);
    console.log('Measured data written IOs on all mounted drives after transaction: '+ dataPostIO.wIO);
    console.log('Measured transferred bytes overall (upload) before transacion: '+ previousUPLOAD);
    console.log('Measured transferred bytes overall (upload) after transacion: '+ postUPLOAD);
    console.log('Measured received bytes overall (download) before transacion: '+ previousDOWNLOAD);
    console.log('Measured received bytes overall (download) after transacion: '+ postDOWNLOAD);
    
    ////////// LOGS /////////

    accountRecords(receiverAccountId, receipt)
}

async function accountRecords(receiverAccountId, senderClient, receiverClient) {
    const myNewAccountBalance = await new AccountBalanceQuery()
        .setAccountId(myaccount.operatorAccountId)
        .execute(myaccount.client);

    const receiverNewAccountBalance = await new AccountBalanceQuery()
        .setAccountId(receiverAccountId)
        .execute(myaccount.client);

    console.log("MY ACCOUNT BALANCE AFTER TRANSFER: ", myNewAccountBalance);
    console.log("CLIENT ACCOUNT BALANCE AFTER TRANSFER: ", receiverNewAccountBalance);
}

async function updateAccount(newAccountId, privateKey) {
    // Create new keys
    const newPrivateKey = await Ed25519PrivateKey.generate();
    const newPublicKey = newPrivateKey.publicKey;

    console.log(`:: update keys of account ${newAccountId}`)
    console.log(`setKey = ${newPublicKey}`)

    //Update the key on the account
    const updateTransaction = await new AccountUpdateTransaction()
        .setAccountId(newAccountId)
        .setKey(newPublicKey) // The new public key to update the account with
        .build(client)
        .sign(privateKey) // Sign with the original private key on account
        .sign(newPrivateKey) // Sign with new private key on the account
        .execute(client);

    console.log(`transactionId = ${updateTransaction}`)

    // (important!) wait for the transaction to complete by querying the receipt
    await updateTransaction.getReceipt(client);

    console.log(`:: get account info and check our current key`);

    // Now we fetch the account information to check if the key was changed
    const acctInfo = await new AccountInfoQuery()
        .setAccountId(newAccountId)
        .execute(client);

    console.log(`key = ${acctInfo.key}`)

    transfer(newAccountId);
}
