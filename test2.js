
var fs = require('fs');

var stream = fs.createWriteStream(`/home/ipdmartins/Hashgraph/file_${bytes}_bytes_ID_${topicId}.txt`);


stream.once('open', function (fd) {
    stream.write(`${one};`);
    stream.write(`${two};`);
    stream.write(`${three};`);
    stream.write(`${four};`);
    stream.write(`${five};`);
    stream.write(`${six}\n`);
    stream.end();
});



// for (let index = 0; index < 10; index++) {
//     fs.appendFile('/home/ipdmartins/Hashgraph/mynewfile1.txt', `Hello ${index}`, function (err) {
//       if (err) throw err;

//     });

// }
