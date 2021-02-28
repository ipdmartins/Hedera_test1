const sideExecution = require('./test');
const test = require('./test');

sideExecution({iterations: 10}).then(result => console.log(result));