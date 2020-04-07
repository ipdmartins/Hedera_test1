const {
    Client,
    ConsensusTopicCreateTransaction,
    Ed25519PrivateKey,
    Ed25519PublicKey,
    ConsensusMessageSubmitTransaction,
    ConsensusTopicInfoQuery
} = require("@hashgraph/sdk");
require("dotenv").config();

async function main() {
    const operatorPrivateKey = process.env.OPERATOR_KEY;
    const operatorAccount = process.env.OPERATOR_ID;

    if (operatorPrivateKey == null || operatorAccount == null) {
        throw new Error("environment variables OPERATOR_KEY and OPERATOR_ID must be present");
    }

    const client = Client.forTestnet();

    client.setOperator(operatorAccount, operatorPrivateKey);

    const submitKey = await Ed25519PrivateKey.generate();
    const submitPublicKey = submitKey.publicKey;

    const transactionId = await new ConsensusTopicCreateTransaction()
        .setTopicMemo("HCS topic with submit key")
        .setSubmitKey(submitPublicKey)
        .execute(client);

    const receipt = await transactionId.getReceipt(client);
    const topicId = receipt.getConsensusTopicId();
    console.log(`Created new topic ${topicId} with ED25519 submitKey of ${submitKey}`)

    await new ConsensusMessageSubmitTransaction()
        .setTopicId(topicId)
        .setMessage("Message to an existent topic on the chain")
        .build(client)
        // The transaction is automatically signed by the payer.
        // Due to the topic having a submitKey requirement, additionally sign the transaction with that key.
        .sign(submitKey)
        .execute(client);

    const topicInfo = await new ConsensusTopicInfoQuery()
        .setTopicId(topicId)
        .execute(client);

    console.log(
        `Sequence Number: ${topicInfo.sequenceNumber}
         Running Hash: ${topicInfo.runningHash}
         Expiration Time: ${topicInfo.expirationTime}
         Topic Memo: ${topicInfo.topicMemo}`);

}

main();