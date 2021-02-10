//Submits a message to a public topic 
await new ConsensusMessageSubmitTransaction()
    .setTopicId(topicId)
    .setMessage("hello, HCS! " + i)
    .build(client)
    .execute(client)
    .getReceipt(client);

//v1.4.4


//Create the transaction
const transaction = await new TopicMessageSubmitTransaction()
    .setTopicId(newTopicId)
    .setMessage("hello, HCS! ");
        
//Get the transactio message
const getMessage = transaction.getMessage();

//v2.0.0