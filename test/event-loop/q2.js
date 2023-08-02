const Promise = require('../../src/promise/promise-es6')

/**
 * 没加之前，立即调用then将回调放入 nextTickQueue 中；加了之后，先将对then的调用放入 nextTickQueue 中，执行后，再将回调放入 nextTickQueue 中
 */

const p1 = new Promise(resolve => {
  let resolvedPromise = Promise.resolve() // Promise { undefined }
  resolve(resolvedPromise) // => EL1 调用then方法 => EL2 调用 resolve 方法

  // Promise.resolve().then(resolve) // 直接调用 resolve 方法
}).then(() => { // =>queue => EL3
  console.log('resolvePromise resolved')
})

Promise.resolve()
  .then(() => { // => EL1
    console.log('promise1')
  })
  .then(() => { // => queue1 => EL2
    console.log('promise2')
  })
  .then(() => { // => queue2 => EL3
    console.log('promise3')
  })

/**
 * 没有遇到 promise 实例之前，代码都是同步执行的，直到 resolve(resolvedPromise)，在解析 promise 时是异步调用其 then 方法，
 * 主线程继续向下执行，直到 Promise.resolve().then(()=>{console.log('promise1')})，执行then是同步的，但是执行其参数 ()=>{console.log('promise1')}是异步的
 * 主线程结束，进入事件循环
 * 关键：
 *  1. promise 返回后才会调用 then 方法
 *  2. 显式调用then方法是同步的
 *  3. 内部解析promise对象，调用其then方法是异步的
 *  4. then方法内部调用其参数函数是异步的
 */

// promise1
// promise2
// resolvePromise resolved
// promise3