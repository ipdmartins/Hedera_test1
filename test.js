const {
    Client,
    TopicCreateTransaction,
    TopicMessageSubmitTransaction,
    PrivateKey,
    AccountId,
} = require("@hashgraph/sdk")

const { myaccount, testerAccount } = require('./myaccount');

newTopic(myaccount.client);

async function newTopic(client) {
    // create topic
    const createResponse = await new TopicCreateTransaction().execute(client);
    const createReceipt = await createResponse.getReceipt(client);

    console.log(`topic id = ${createReceipt.topicId}`);

    // send one message
    const sendResponse = await new TopicMessageSubmitTransaction({
        topicId: createReceipt.topicId,
        message: "Hello World",
    }).execute(client);

    const sendReceipt = await sendResponse.getReceipt(client);

    console.log(`topic sequence number = ${sendReceipt.topicSequenceNumber}`);
}

