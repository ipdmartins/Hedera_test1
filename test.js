const { Client, TopicCreateTransaction } = require("@hashgraph/sdk");
const { myaccount, testerAccount } = require('./myaccount');

async function newTopic() {
    const myAct  = myaccount.operatorAccountId;
    const myKey  = myaccount.operatorPrivateKey;

    const client = Client.forTestnet();
    client.setOperator(myAct, myKey);

    const response = await new TopicCreateTransaction().execute(client);
    const receipt  = await response.getReceipt(client);
    const topicId  = receipt.topicId;

    console.log("Topic Id: "+topicId);
}

newTopic();