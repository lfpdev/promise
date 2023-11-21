const Promise = require('../../src/promise/promise-es6');

const resolved = Promise.resolve(42);
const rejected = Promise.reject(-1);
const errFn = async () => { throw Error('yeah?') }
const allSettledPromise = Promise.allSettled([resolved, rejected, errFn()]);
allSettledPromise.then(function (results) {
  console.log(results);
});
// [
//   { status: 'fulfilled', value: 42 },
//   { status: 'rejected', reason: -1 },
//   {
//     status: 'rejected',
//     reason: Error: yeah?
//         at errFn (/home/lfp/dev/promise/test/promise/11.promise-allSettled.js:5:35)
//         at Object.<anonymous> (/home/lfp/dev/promise/test/promise/11.promise-allSettled.js:6:67)
//         at Module._compile (node:internal/modules/cjs/loader:1105:14)
//         at Object.Module._extensions..js (node:internal/modules/cjs/loader:1159:10)
//         at Module.load (node:internal/modules/cjs/loader:981:32)
//         at Function.Module._load (node:internal/modules/cjs/loader:822:12)
//         at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:77:12)
//         at node:internal/main/run_main_module:17:47
//   }
// ]