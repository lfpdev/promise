/**
 * nextTick 阻止进入事件循环
 */


function apiCall(arg, callback) {
    if (typeof arg !== 'string') {
        return process.nextTick(
            callback,
            new TypeError('argument should be string')
        );
    }
}

Promise.resolve().then(() => {
    console.log('Promise callback execute in even-loop');
});

(async () => {
    console.log('main start')
    apiCall(1, (e) => {
        throw e
    })
    console.log('main end')
})()

// main start
// main end
// TypeError: argument should be string