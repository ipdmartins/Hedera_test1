const { Ed25519PrivateKey, AccountCreateTransaction, AccountInfoQuery,
    AccountUpdateTransaction, CryptoTransferTransaction, AccountRecordsQuery,
    AccountBalanceQuery } = require("@hashgraph/sdk");
const { client, operatorAccountId, operatorPrivateKey, operatorPublicKey } = require('./myaccount');
const framework = require("./framework");

var txconfirmedcount = 0;

async function newAccount() {
    const myAccountBalance = await new AccountBalanceQuery()
        .setAccountId(operatorAccountId)
        .execute(client);

    console.log(`MY ACCOUNT ID: ${operatorAccountId}`);
    console.log(`MY ACCOUNT BALANCE: ${myAccountBalance}`);
    console.log(`MY PRIVATE KEY: ${operatorPrivateKey}`);
    console.log(`MY PUBLIC KEY: ${operatorPublicKey}`);

    const privateKey = await Ed25519PrivateKey.generate();

    console.log(`NEW PRIVATE KEY: ${privateKey.toString()}`);
    console.log(`NEW PUBLIC KEY: ${privateKey.publicKey.toString()}`);

    //Creating an account
    const transactionId = await new AccountCreateTransaction()
        .setKey(privateKey.publicKey)
        .setInitialBalance(1000)
        .execute(client);

    // var antes = Date.now();//registra o início do processo de transação
    // console.log(antes);
    const transactionRecord = await transactionId.getRecord(client);

    const transactionReceipt = await transactionId.getReceipt(client);

    const newAccountId = transactionReceipt.getAccountId();

    const accountBalance = await new AccountBalanceQuery()
        .setAccountId(newAccountId)
        .execute(client);

    console.log("NEW ACCOUNT ID: " + newAccountId);
    console.log("NEW ACCOUNT BALANCE: " + accountBalance);

    ///////// FRAMEWORK ////////////////////

    //se a transação foi efetivada, tx confirmadas adiciona 1
    // if (transactionRecord.receipt.status == "SUCCESS") {
    //     txconfirmedcount++;
    //     console.log(txconfirmedcount);
        //registra o momento fim da transação
    //     console.log(transactionRecord.consensusTimestamp.seconds);
    // } else {
    //     console.log("fail")
    // }
    // var depois = Date.now();//registra o fim do processo de transação
    // console.log(depois);
    //fórmula do framework implementada "transacoes por segundo"
    // const TPS = framework.analyzeTPS(txconfirmedcount, antes, depois);
    // console.log("Transações por segundo: ", TPS);

    ///////// FRAMEWORK ////////////////////

    transfer(newAccountId);
    //updateAccount(newAccountId, privateKey);
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

async function transfer(newAccountId) {
    const receipt = await (await new CryptoTransferTransaction()
        .addSender(operatorAccountId, 100)
        .addRecipient(newAccountId, 100)
        .setTransactionMemo("sdk example")
        .execute(client))
        .getReceipt(client);

    const myNewAccountBalance = await new AccountBalanceQuery()
        .setAccountId(operatorAccountId)
        .execute(client);

    const receiverNewAccountBalance = await new AccountBalanceQuery()
        .setAccountId(newAccountId)
        .execute(client);
    
    console.log("SENDER'S BALANCE AFTER TRANSFER: ", myNewAccountBalance);
    console.log("RECEIVER'S BALANCE AFTER TRANSFER: ", receiverNewAccountBalance);
    console.log("TRANSACTION RECEIPT: ", receipt);

    const info = await new AccountInfoQuery()
        .setAccountId(operatorAccountId)
        .execute(client);

    console.log(`OPERATOR ACCOUNT (${operatorAccountId}) INFO QUERY = ${JSON.stringify(info, null, 4)}`);

    const infoII = await new AccountInfoQuery()
        .setAccountId(newAccountId)
        .execute(client);

    console.log(`NEW OPERATOR ACCOUNT (${newAccountId}) INFO QUERY = ${JSON.stringify(infoII, null, 4)}`);

    // const accountRecord = await new AccountRecordsQuery()
    //     .setAccountId(operatorAccountId)
    //     .execute(client);
    // console.log(`OPERATOR ACCOUNT (${operatorAccountId}) INFO RECORD QUERY = ${JSON.stringify(accountRecord

    // )}`);

    // const accountRecordII = await new AccountRecordsQuery()
    //     .setAccountId(newAccountId)
    //     .execute(client);
    // console.log(`NEW OPERATOR ACCOUNT (${newAccountId}) INFO RECORD QUERY = ${JSON.stringify(accountRecordII, null, 4)}`);

}

newAccount();