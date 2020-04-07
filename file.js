const {
    Client,
    FileCreateTransaction,
    Ed25519PrivateKey,
    Hbar,
    FileId,
    FileContentsQuery,
    FileInfoQuery
} = require("@hashgraph/sdk");
require("dotenv").config();

async function main() {
    const operatorAccount = process.env.OPERATOR_ID;
    const operatorPrivateKey = Ed25519PrivateKey.fromString(process.env.OPERATOR_KEY);
    const operatorPublicKey = operatorPrivateKey.publicKey;

    if (operatorPrivateKey == null || operatorAccount == null) {
        throw new Error("environment variables OPERATOR_KEY and OPERATOR_ID must be present");
    }
    const client = Client.forTestnet();
    client.setOperator(operatorAccount, operatorPrivateKey);

    const transactionId = await new FileCreateTransaction()
        .setContents("Hello, Hedera's file service!")
        .addKey(operatorPublicKey) // Defines the "admin" of this file
        .setMaxTransactionFee(new Hbar(15))
        .execute(client);

    const receipt = await transactionId.getReceipt(client);
    const fileId = receipt.getFileId();
    console.log("new file id =", fileId);


    const fileContents = await new FileContentsQuery()
        .setFileId(fileId)
        .execute(client);
    console.log(`file contents: ${fileContents}`);

    const fileInfo = await new FileInfoQuery()
        .setFileId(fileId)
        .execute(client);
    console.log("Size: ", fileInfo.size, " Keys: ", fileInfo.keys);

    const transactionRecord = await transactionId.getRecord(client);
    console.log("Record =", transactionRecord);
}

main();