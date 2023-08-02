// setTimeout(() => {
//     console.log('timer1')
//     Promise.resolve().then(function () {
//         console.log('promise1')
//     })
// }, 0)
// setTimeout(() => {
//     console.log('timer2')
//     Promise.resolve().then(function () {
//         console.log('promise2')
//     })
// }, 0)
// node 10 与 之后的版本不同，参考 https://github.com/nodejs/node/pull/22842
// node 10 timer1 timer2 promise1 promise2
// node >10 timer1 promise1 timer2 promise2


// setTimeout(() => {
//     setTimeout(() => {
//       console.log('timeout')
//     }, 0)
//     setImmediate(() => {
//       console.log('immediate')
//     })
//   }, 0)
// 在回调用注册，永远先 immediate 后 timeout