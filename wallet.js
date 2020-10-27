const { Ed25519PrivateKey, AccountCreateTransaction, AccountInfoQuery,
    AccountUpdateTransaction, CryptoTransferTransaction, AccountRecordsQuery } = require("@hashgraph/sdk");
const { client, operatorAccountId } = require('./myaccount');
const framework = require("./framework");

var txconfirmedcount = 0;

async function newAccount() {

    const privateKey = await Ed25519PrivateKey.generate();

    console.log("Automatic signing example");
    console.log(`Private key = ${privateKey.toString()}`);
    console.log(`Public key = ${privateKey.publicKey.toString()}`);

    //Creating an account
    const transactionId = await new AccountCreateTransaction()
        .setKey(privateKey.publicKey)
        .setInitialBalance(0)
        //.setGenerateRecord(true)
        .execute(client);

    var antes = Date.now();//registra o início do processo de transação
    console.log(antes);
    const transactionRecord = await transactionId.getRecord(client);

    const transactionReceipt = await transactionId.getReceipt(client);

    //se a transação foi efetivada, tx confirmadas adiciona 1
    if (transactionRecord.receipt.status == "SUCCESS") {
        txconfirmedcount++;
        console.log(txconfirmedcount);
        //registra o momento fim da transação
        console.log(transactionRecord.consensusTimestamp.seconds);
    } else {
        console.log("fail")
    }
    var depois = Date.now();//registra o fim do processo de transação
    console.log(depois);
    //fórmula do framework implementada "transacoes por segundo"
    const TPS = framework.analyzeTPS(txconfirmedcount, antes, depois);
    console.log("Transações por segundo: ", TPS);


    const newAccountId = transactionReceipt.getAccountId();
    console.log(`New accountId = ${newAccountId}`);

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
        .addSender(operatorAccountId, 1)
        .addRecipient(newAccountId, 1)
        .setTransactionMemo("sdk example")
        .execute(client))
        .getReceipt(client);

    console.log("Transaction's Receipt: ", receipt);
    console.log("Sender's balance after transfer:", (await client.getAccountBalance(operatorAccountId)));
    console.log("Receiver's balance after transfer:", (await client.getAccountBalance(newAccountId)));

    const info = await new AccountInfoQuery()
        .setAccountId(operatorAccountId)
        .execute(client);

    console.log(`Operator account (${operatorAccountId}) info = ${JSON.stringify(info, null, 4)}`);

    const infoII = await new AccountInfoQuery()
        .setAccountId(newAccountId)
        .execute(client);

    console.log(`New operator account (${newAccountId}) info = ${JSON.stringify(infoII, null, 4)}`);

    const accountRecord = new AccountRecordsQuery()
        .setAccountId(operatorAccountId)
        .execute(client);
    console.log(`Operator account (${operatorAccountId}) info = ${JSON.stringify(accountRecord

    )}`);

    const accountRecordII = new AccountRecordsQuery()
        .setAccountId(newAccountId)
        .execute(client);
    console.log(`Operator account (${newAccountId}) info = ${JSON.stringify(accountRecordII, null, 4)}`);

}

newAccount();