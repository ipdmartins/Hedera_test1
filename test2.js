const consensus = require('./thread');

consensus('a', 100)
consensus('b', 100)
consensus('c', 100)
// const sharedUint8Array = new Uint8Array(new SharedArrayBuffer(5));

// const loop = 5;
// for (let i = 0; i < 4; i++) {
//     consensus({ iterations: loop, position: i, arr: sharedUint8Array }).then(result => console.log(result));
// }