const { Ed25519PrivateKey, AccountCreateTransaction, AccountInfoQuery,
    AccountUpdateTransaction, CryptoTransferTransaction, AccountRecordsQuery,
    AccountBalanceQuery } = require("@hashgraph/sdk");
const si = require('systeminformation');
const process = require('process');

const { myaccount, testerAccount } = require('./myaccount');
const frameworkAnalyzer = require("./frameworkAnalyzer");

var txconfirmedcount = 0;
var sumTxInputTxComfirmed = 0;

// newAccount();
// console.log('OPERATOR ACCOUNT ID: '+myaccount.operatorAccountId);
// console.log('TESTER ACCOUNT ID: '+testerAccount.testerAccountId);

// transfer(testerAccount.testerAccountId, 2);
newAccount(myaccount.operatorAccountId, myaccount.client);

async function newAccount(operatorAccountId, client) {
    const myAccountBalance = await new AccountBalanceQuery()
        .setAccountId(operatorAccountId)
        .execute(client);

    //DELETE IN REAL TEST
    // console.log(`MY ACCOUNT ID: ${operatorAccountId}`);
    // console.log(`MY ACCOUNT BALANCE: ${myAccountBalance}`);
    // console.log(`MY PRIVATE KEY: ${myaccount.operatorPrivateKey}`);
    // console.log(`MY PUBLIC KEY: ${myaccount.operatorPublicKey}`);
    //DELETE IN REAL TEST

    const newPrivateKey = await Ed25519PrivateKey.generate();

    //DELETE IN REAL TEST
    // console.log(`NEW PRIVATE KEY: ${newPrivateKey.toString()}`);
    // console.log(`NEW PUBLIC KEY: ${newPrivateKey.publicKey.toString()}`);
    //DELETE IN REAL TEST

    //Creating an account
    const newTransactionId = await new AccountCreateTransaction()
        .setKey(newPrivateKey.publicKey)
        .setInitialBalance(1000)
        .execute(client);

    // const transactionRecord = await newTransactionId.getRecord(client);

    const transactionReceipt = await newTransactionId.getReceipt(client);

    const newAccountId = transactionReceipt.getAccountId();

    const newAccountBalance = await new AccountBalanceQuery()
        .setAccountId(newAccountId)
        .execute(client);

    //DELETE IN REAL TEST
    // console.log("NEW ACCOUNT ID: " + newAccountId);
    // console.log("NEW ACCOUNT RECEIPT: " + transactionReceipt);
    //DELETE IN REAL TEST

    transfer(newAccountId, 2);
    //updateAccount(newAccountId, newPrivateKey);
}

async function transfer(receiverAccountId, numberOfTransactions) {
    ///////// referent to analyzeTPC  /////////
    var starCpuUsage = process.cpuUsage()
    console.log('starCpuUsage: '+ starCpuUsage.user);
    ///////// referent to analyzeTPC  /////////

    ///////// referent to analyzeTPDIO  /////////
    const dataPreviousIO = await si.disksIO().then(data => {
        return data;
      })
    console.log('previousREAD: '+ dataPreviousIO.rIO);
    console.log('previousWRITE: '+ dataPreviousIO.wIO)
    ///////// referent to analyzeTPDIO  /////////

    ///////// referent to analyzeTPND  /////////
    const dataPreviousNet = await si.networkStats().then(data => {return data;})
    const previousUPLOAD = dataPreviousNet[0].tx_bytes;
    const previousDOWNLOAD = dataPreviousNet[0].rx_bytes;
    console.log('previousUPLOAD: '+ previousUPLOAD);
    console.log('previousDOWNLOAD: '+ previousDOWNLOAD);
    ///////// referent to analyzeTPND  /////////
    
    const milibefore = Date.now();//get the transaction beginning in millisec for analyzeTPS
    const before = milibefore / 1000;//converting milisec to seconds
    console.log('Time before per sec: '+ before);

    var calc = 0;
    var receipt = null;
    for (let index = 0; index < numberOfTransactions; index++) {
        var txInput = Date.now() / 1000;//it's for analyzeARD
        const transation = (await new CryptoTransferTransaction()
            .addSender(myaccount.operatorAccountId, 111)
            .addRecipient(receiverAccountId, 111)
            // .setTransactionMemo("sdk example")
            .execute(myaccount.client))
            // .getReceipt(myaccount.client)
        // .getRecord(client)

        const transactionReceipt = await transation.getReceipt(myaccount.client);
        
        //se a transação foi efetivada, tx confirmadas adiciona 1
        if (transactionReceipt.status == "SUCCESS") {
            //getting consensus timestamp on blockchain in seconds for analyzeARD
            var time = Date.now() / 1000;
            var txConfirmed = (await transation.getRecord(myaccount.client)).consensusTimestamp.seconds;
            sumTxInputTxComfirmed += (txConfirmed - txInput)//it's for analyzeARD
            console.log('txConfirmed: '+txConfirmed+', txInput: '+txInput+', sumTxInputTxComfirmed: '+sumTxInputTxComfirmed);
            calc += (time - txInput)//it's monitore what's going on analyzeARD
            console.log('time: '+time+', txInput: '+txInput+', calc: '+calc);
            
            txconfirmedcount++;
        } else {
            console.log(`transaction ${index + 1} failed.`)
        }
    }
    const miliafter = Date.now();//get the transaction's end in millicsec for analyzeTPS
    const after = miliafter / 1000;//converting milisec to seconds
    console.log('Time after per sec: '+ after);
    
    ///////// referent to analyzeTPC  /////////
    const cpuUsageByTheProcess = process.cpuUsage(starCpuUsage)
    const coreFrequency = await si.cpuCurrentspeed().then(data => data.cores[0]);
    console.log('cpuUsageByTheProcess: '+ cpuUsageByTheProcess.user);
    console.log('coreFrequency: '+ coreFrequency);
    ///////// referent to analyzeTPC  /////////

    ///////// referent to analyzeTPMS  /////////
    const dataPostMem = await si.processes().then(data => {
        return data;
    })
    const RMEM = dataPostMem.list[0].mem_rss;
    const VMEM = dataPostMem.list[0].mem_vsz;

    console.log('postMem: '+ RMEM);
    console.log('postVirtualMem: '+ VMEM)
    ///////// referent to analyzeTPMS  /////////
    
    ///////// referent to analyzeTPDIO  /////////
    const dataPostIO = await si.disksIO().then(data => {
        return data;
      })
    console.log('postREAD: '+ dataPostIO.rIO);
    console.log('postWRITE: '+ dataPostIO.wIO)
    const DISKR = dataPostIO.rIO - dataPreviousIO.rIO;
    const DISKW = dataPostIO.wIO - dataPreviousIO.wIO;

    const processFSII = process.resourceUsage();
    console.log('process.resourceUsage postREAD: '+ processFSII.fsRead);
    console.log('process.resourceUsage postWRITE: '+ processFSII.fsWrite);
    ///////// referent to analyzeTPDIO  /////////    

    ///////// referent to analyzeTPND  /////////
    const dataPostNet = await si.networkStats().then(data => {return data;})
    const postUPLOAD = dataPostNet[0].tx_bytes;
    const postDOWNLOAD = dataPostNet[0].rx_bytes;

    console.log('postUPLOAD: '+ postUPLOAD);
    console.log('postDOWNLOAD: '+ postDOWNLOAD);

    const UPLOAD = postUPLOAD - previousUPLOAD;
    const DOWNLOAD = postDOWNLOAD - previousDOWNLOAD;
    console.log('UPLOAD: '+ UPLOAD);
    console.log('DOWNLOAD: '+ DOWNLOAD);
    ///////// referent to analyzeTPND  /////////

    // console.log(receipt.conconsensusTimestamp.seconds);

    const TPS = frameworkAnalyzer.analyzeTPS(txconfirmedcount, before, after);
    console.log("Transactions per second (TPS): ", TPS);

    const ARD = frameworkAnalyzer.analyzeARD(sumTxInputTxComfirmed, txconfirmedcount)
    console.log("Average Response Delay in seconds (ARD): ", ARD);

    const TPC = frameworkAnalyzer.analyzeTPC(txconfirmedcount, coreFrequency, cpuUsageByTheProcess.user)
    console.log("Transactions Per CPU txs/(GHZ) in seconds (TPC): ", TPC);

    const TPMS = frameworkAnalyzer.analyzeTPMS(txconfirmedcount, RMEM, VMEM)
    console.log("Transacoes de memoria por segundo (TPMS): ", TPMS);

    const TPDIO = frameworkAnalyzer.analyzeTPDIO(txconfirmedcount, DISKR, DISKW)
    console.log("Transacoes por disco (TPDIO): ", TPDIO);

    const TPND = frameworkAnalyzer.analyzeTPND(txconfirmedcount, UPLOAD, DOWNLOAD)
    console.log("Transacoes de dados na rede (TPND): ", TPND);

    accountRecords(receiverAccountId, receipt)
}

async function accountRecords(receiverAccountId, senderClient, receiverClient) {
    const myNewAccountBalance = await new AccountBalanceQuery()
        .setAccountId(myaccount.operatorAccountId)
        .execute(myaccount.client);

    const receiverNewAccountBalance = await new AccountBalanceQuery()
        .setAccountId(receiverAccountId)
        .execute(myaccount.client);

    console.log("SENDER'S BALANCE AFTER TRANSFER: ", myNewAccountBalance);
    console.log("RECEIVER'S BALANCE AFTER TRANSFER: ", receiverNewAccountBalance);
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
