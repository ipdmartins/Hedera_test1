
// Example uses Hedera JavaScript SDK v1.1.8
const { Client, CryptoTransferTransaction, AccountId } = require("@hashgraph/sdk");
// Allow access to our .env file variables
require("dotenv").config();

// Grab your account ID and private key from the .env file
const operatorAccountId = process.env.OPERATOR_ID;
const operatorPrivateKey = process.env.OPERATOR_KEY;

// If we weren't able to grab it, we should throw a new error
if (operatorPrivateKey == null ||
    operatorAccountId == null) {
    throw new Error("environment variables OPERATOR_KEY and OPERATOR_ID must be present");
}

// Create our connection to the Hedera network
const client = Client.forTestnet();

// Set your client account ID and private key used to pay for transaction fees and sign transactions
client.setOperator(operatorAccountId, operatorPrivateKey);

// Hedera is an asynchronous environment :)
(async function () {
    console.log("balance before transfer:", (await client.getAccountBalance(operatorAccountId)));

    const receipt = await (await new CryptoTransferTransaction()
        .addSender(operatorAccountId, 1)
        .addRecipient("0.0.3", 1)
        .setTransactionMemo("sdk example")
        .execute(client))
        .getReceipt(client);

    console.log(receipt);
    console.log("balance after transfer:", (await client.getAccountBalance(operatorAccountId)));

}());