const { Ed25519PrivateKey, AccountCreateTransaction, AccountInfoQuery,
    AccountUpdateTransaction, CryptoTransferTransaction, AccountRecordsQuery,
    AccountBalanceQuery } = require("@hashgraph/sdk");
const { client, operatorAccountId, operatorPrivateKey, operatorPublicKey } = require('./myaccount');
const frameworkAnalyzer = require("./frameworkAnalyzer");
const systeminformation = require("./systeminformation");
const process = require('process'); 

var txconfirmedcount = 0;
var sumTxInputTxComfirmed = 0;

async function newAccount() {
    const myAccountBalance = await new AccountBalanceQuery()
        .setAccountId(operatorAccountId)
        .execute(client);

    //DELETE IN REAL TEST
    console.log(`MY ACCOUNT ID: ${operatorAccountId}`);
    console.log(`MY ACCOUNT BALANCE: ${myAccountBalance}`);
    console.log(`MY PRIVATE KEY: ${operatorPrivateKey}`);
    console.log(`MY PUBLIC KEY: ${operatorPublicKey}`);
    //DELETE IN REAL TEST

    const newPrivateKey = await Ed25519PrivateKey.generate();

    //DELETE IN REAL TEST
    console.log(`NEW PRIVATE KEY: ${newPrivateKey.toString()}`);
    console.log(`NEW PUBLIC KEY: ${newPrivateKey.publicKey.toString()}`);
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
    console.log("NEW ACCOUNT ID: " + newAccountId);
    console.log("NEW ACCOUNT BALANCE: " + newAccountBalance);
    //DELETE IN REAL TEST

    //transfer(newAccountId);
    //updateAccount(newAccountId, newPrivateKey);
}

async function transfer(receiverAccountId, numberOfTransactions) {
    ///////// referent to analyzeTPC  /////////
    var starCpuUsage = process.cpuUsage()
    ///////// referent to analyzeTPC  /////////

    const before = Date.now();//get the transaction beginning for analyzeTPS

    for (let index = 0; index < numberOfTransactions; index++) {
        var txInput = Date.now();//it's for analyzeARD
        const receipt = await (await new CryptoTransferTransaction()
            .addSender(operatorAccountId, 100)
            .addRecipient(receiverAccountId, 100)
            .setTransactionMemo("sdk example")
            .execute(client))
            .getReceipt(client)
        // .getRecord(client)

        //se a transação foi efetivada, tx confirmadas adiciona 1
        if (receipt.receipt.status == "SUCCESS") {
            var txConfirmed = Date.now();//it's for analyzeARD
            sumTxInputTxComfirmed += (txConfirmed - txInput)//it's for analyzeARD
            txconfirmedcount++;
            // console.log(txconfirmedcount);
        } else {
            console.log(`transaction ${index+1} failed.`)
        }
    }
    const after = Date.now();//get the transaction's end analyzeTPS

    ///////// referent to analyzeTPC  /////////
    const cpuUsageByTheProcess = process.cpuUsage(starCpuUsage)
    const coreFrequency = await systeminformation.cpuSingleCoreLog()
    ///////// referent to analyzeTPC  /////////
    
    console.log(receipt.conconsensusTimestamp.seconds);

    const TPS = frameworkAnalyzer.analyzeTPS(txconfirmedcount, before, after);
    console.log("Transacoes por segundo: ", TPS);
    
    const ARD = frameworkAnalyzer.analyzeARD(sumTxInputTxComfirmed, txconfirmedcount)
    console.log("Media do atraso de resposta: ", ARD);

    //buscar a frequencia do core (F) e com o netdata buscar o uso da CPU
    const TPC = frameworkAnalyzer.analyzeTPC(txconfirmedcount, coreFrequency, cpuUsageByTheProcess.user)
    console.log("Transacoes por CPU: ", TPC);

    //Não sei se é possível achar a memoria usada em blockchain e a memoria virtual real???
    //investigar o Kabuto
    const TPMS = frameworkAnalyzer.analyzeTPMS(txconfirmedcount, RMEM, VMEM)
    console.log("Transacoes de memoria por segundo: ", TPMS);

    //buscar DISKR e o DISKW com o netdata
    const TPDIO = frameworkAnalyzer.analyzeTPDIO(txconfirmedcount, DISKR, DISKW)
    console.log("Transacoes por disco: ", TPDIO);

    //buscar UPLOAD e o DOWNLOAD com o netdata
    const TPND = frameworkAnalyzer.analyzeTPND(txconfirmedcount, UPLOAD, DOWNLOAD)
    console.log("Transacoes de dados na rede: ", TPND);

    var startUsage = process.h

}

function secNSec2ms(secNSec) {
    if (Array.isArray(secNSec)) {
        return secNSec[0] * 1000 + secNSec[1] / 1000000;
    }
    return secNSec / 1000;
}

async function accountRecords(receiverAccountId, receipt) {
    const myNewAccountBalance = await new AccountBalanceQuery()
        .setAccountId(operatorAccountId)
        .execute(client);

    const receiverNewAccountBalance = await new AccountBalanceQuery()
        .setAccountId(receiverAccountId)
        .execute(client);

    console.log("SENDER'S BALANCE AFTER TRANSFER: ", myNewAccountBalance);
    console.log("RECEIVER'S BALANCE AFTER TRANSFER: ", receiverNewAccountBalance);
    console.log("TRANSACTION RECEIPT: ", receipt);

    const info = await new AccountInfoQuery()
        .setAccountId(operatorAccountId)
        .execute(client);

    console.log(`OPERATOR ACCOUNT (${operatorAccountId}) INFO QUERY = ${JSON.stringify(info, null, 4)}`);

    const infoII = await new AccountInfoQuery()
        .setAccountId(receiverAccountId)
        .execute(client);

    console.log(`NEW OPERATOR ACCOUNT (${receiverAccountId}) INFO QUERY = ${JSON.stringify(infoII, null, 4)}`);

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

newAccount();