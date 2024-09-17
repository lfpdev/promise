/**
 * nextTick vs Promise
 */

console.log('main module start')
Promise.resolve().then(function () {
    console.log('promise1')
})
process.nextTick(() => {
    console.log('NextTick callback1 executed');
});
setTimeout(() => {
    console.log('timer1')
    Promise.resolve().then(function () {
        console.log('promise2')
    })
    process.nextTick(() => {
        console.log('NextTick callback2 executed');
    });
}, 0)
setTimeout(() => {
    console.log('timer2')
    Promise.resolve().then(function () {
        console.log('promise3')
    })
    process.nextTick(() => {
        console.log('NextTick callback3 executed');
    });
}, 0)
console.log('main module end')