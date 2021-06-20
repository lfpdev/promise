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
