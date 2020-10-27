
const { client, operatorAccountId } = require('./myaccount');

// Hedera is an asynchronous environment. The following simulates a transfer
(async function () {
    console.log("Current account balance: ", (await client.getAccountBalance(operatorAccountId)));

    // const receipt = await (await new CryptoTransferTransaction()
    //     .addSender(operatorAccountId, 1)
    //     .addRecipient("0.0.3", 1)
    //     .setTransactionMemo("sdk example")
    //     .execute(client))
    //     .getReceipt(client);

    // console.log(receipt);
    // console.log("balance after transfer:", (await client.getAccountBalance(operatorAccountId)));

}());