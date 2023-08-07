/**
 * promise vs queueMicrotask
 */
console.log('Start');

queueMicrotask(() => {
  console.log('Microtask 1 executed');
});

Promise.resolve().then(() => {
  console.log('Promise callback 1 executed');
});

queueMicrotask(() => {
  console.log('Microtask 2 executed');
});

Promise.resolve().then(() => {
  console.log('Promise callback 2 executed');
});

console.log('End');



// ==================

let callback = () => console.log("Regular timeout callback has run");
let urgentCallback = () => console.log("*** Oh noes! An urgent callback has run!");

let doWork = () => {
    let result = 1;

    //   queueMicrotask(urgentCallback);
    process.nextTick(urgentCallback)

    for (let i = 2; i <= 10; i++) {
        result *= i;
    }
    return result;
};

console.log("Main program started");
setTimeout(callback, 0);
console.log(`10! equals ${doWork()}`);
console.log("Main program exiting");
