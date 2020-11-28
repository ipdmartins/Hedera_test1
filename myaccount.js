
// Example uses Hedera JavaScript SDK v1.1.8
const { Client, AccountBalanceQuery } = require("@hashgraph/sdk");
require("dotenv").config();

// Grab your account ID and private key from the .env file
const operatorAccountId = process.env.OPERATOR_ID;
const operatorPrivateKey = process.env.OPERATOR_PRIVATE_KEY;
const operatorPublicKey = process.env.OPERATOR_PUBLIC_KEY;

// If we weren't able to grab it, we should throw a new error
if (operatorPrivateKey == null || operatorAccountId == null) {
    throw new Error("environment variables OPERATOR_KEY and OPERATOR_ID must be present");
}

// Create our connection to the Hedera network
const client = Client.forTestnet();

// Set your client account ID and private key used to pay for transaction fees and sign transactions
client.setOperator(operatorAccountId, operatorPrivateKey);

const myaccount = {
    operatorAccountId,
    operatorPrivateKey,
    operatorPublicKey,
    client
}

module.exports = myaccount;