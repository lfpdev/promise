/*
Promise 实现规范 Promise/A+ 地址: https://promisesaplus.com/

优点：解决异步问题
1. 多个并发异步请求，同时获取结果 -> promise.all
2. 链式异步请求（恶魔金字塔、回调地狱）-> promise.then 链式调用

缺点：
1. 本身还是基于回调函数的形式
2. 无法中断异步处理结果

promise循环引用问题：
    循环引用只能发生在异步情况下(then 的参数函数中 或 定时器中)。此时构造函数才能执行完毕获取到当前promise，然后再引用，发生循环引用
    返回一个新的promise都会执行构造函数（调用then的时候）

promise递归解析问题：
    解析promise即 调用 该promise的 then方法，将外层promise的resolve reject 作为内层promise返回后 触发执行的 then方法的 回调
      then的参数函数返回promise会递归解析，直到返回非promise或被reject。
        底层原理是将then返回的 promise的 resolve和reject 作为参数函数返回的 promise的 then的 回调，
        当参数函数返回的 promise返回后 才触发执行
      构造函数中提供的resolve方法会递归解析，直到返回非promise或被reject（reject不会解析promise）
        底层原理是将自己和reject作为参数promise的then的回调，当参数promise返回后，才触发执行
    因此递归解析的时候
      某内层失败后，外层依次调用其reject方法，也都返回失败
      最内层成功后，外层依次调用其resolve方法，也都返回成功
    注册then回调
      递推的时候不会将then的回调注册到微任务队列尾部
      回归的时候，promise状态改变才会注册到微任务队列尾部，在下次循环执行

promise 异常问题：
    1. 如果没有传递executor函数，直接抛出异常，外面可以同步捕获
    2. 如果在executor函数体中异步代码抛出异常，外面无法同步捕获，只能全局捕获（或者异步代码自己捕获，调用reject通知外面）
    3. 其他情况下promise不会将异常抛到全局，都是返回一个失败的promise
    4. 如果在executor函数体中同步代码抛出异常
      4.1 在resolve或reject之前抛出的异常，被try-catch捕获，返回失败的promise
      4.2 在resolve或reject接收的参数函数中抛出异常，被try-catch捕获，返回失败的promise
      4.3 在resolve或reject之后抛出的异常，被try-catch捕获，不影响promise的状态
    5. 如果在then回调函数中抛出异常
      5.1 被then中的try-catch捕获，返回失败的promise
    6. thenable对象
      6.1 如果在其then参数函数resolve和reject之前抛异常，都会被try-catch捕获，返回失败的promise
          e.g. Promise.resolve、构造函数中的resolve、then的resolvePromise
      6.2 如果在其then参数函数resolve和reject之后抛异常，会被try-catch捕获，但是不改变promise的状态

promise then事件循环问题：
    调用then就会将then的参数函数注册到微任务队列末尾，在下一轮事件循环才会执行（延迟一轮执行）

Promise/A+ 测试问题
    1. 注掉规范方法中的日志
    2. 注掉非规范中的功能（3个地方）
*/

const u = require('../utils')

const log = u.debugGenerator(__filename)

// 状态（用常量表示）
// 1. Promise有三个状态，resolved(fulfilled) rejected pending(默认初始状态)
// 2. 一旦改变无法修改，只有pending状态下才可以修改
const RESOLVED = 'RESOLVED'
const REJECTED = 'REJECTED'
const PENDING = 'PENDING'

// 这个方法要兼容 所有 其他库实现的promise，例如 bluebird、q、es6-promise。这些库可以相互调用主要靠 resolvePromise 方法兼容
const resolvePromise = (promise2, x, resolve, reject) => {
  // 循环引用-自己等待自己（promise2 和 x 引用同一个对象）
  if (promise2 === x) {
    log.debug('promise.then circular reference')
    // ES6 规范写法 无法通过Promise/A+测试
    return reject('[TypeError: Chaining cycle detected for promise #<Promise>]')
    // Promise/A+ 规范
    // return reject(new TypeError('Chaining cycle detected for promise #<Promise>'))
  }

  let called // 标记，防止别的库实现的promise走成功后又走失败

  // 严格根据规范判断，确保可以兼容其他库实现的promise
  // if (x instanceof Promise) { } // 不能用这种方式判断x是不是Promise，因为x可能是别的库实现的Promise的实例
  if ((typeof x === 'object' && x !== null) || typeof x === 'function') {
    // 如果x是对象或函数
    try {
      // promise(即x)都有一个then方法，取x的属性then，看是不是函数来判断x是不是promise
      // 通过 x.then 取值可能会报错，需要try-catch (参考示例 promise-resolvePromise.js)
      const { then } = x
      if (typeof then === 'function') {
        // 至此，认为x是promise

        // 不能写成 x.then，因为这样会再次取值，有可能报错 (参考示例 promise-resolvePromise.js)
        // 用 call 方法，保证then方法中的THIS是需要获取结果的promise实例(即x)。如果不call则是window或global
        // 如果是thenable对象，then 方法体中可能会报错，会被catch捕获到
        // 根据内层promise(即x)的状态和值 决定外层promise2的状态和值

        // then.call(x,
        //     y => {
        //         //【这里调用别人实现的promise中的then方法，执行自己传入的回调】
        //         // 无法控制别人的代码执行几个回调，只能控制自己传入的回调（添加判断）防止走成功后又走失败
        //         if (called) return
        //         called = true

        //         // 等 x(promise) 返回成功（值为y）。则执行x的then方法的第一个参数函数（这里传入的回调）
        //         // 即执行当前then方法返回promise2的resolve方法，使当前then返回一个成功的promise2，值为x(promise)的成功结果y

        //         // resolve(y) 但是为了解决返回promise(x)成功又返回promise的现象(y还是一个promise)，这里需要递归解析

        //         log.debug(`before resolvePromise recursion, y is '${y}'`)
        //         // 第一个参数仍然是最外层then返回的promise2（用来保证不发生循环引用）,resolve、reject 也是promise2的
        //         //   当y(promise)返回后，调用promise2的resolve或reject
        //         // 当最终y不是promise,在【出口1或2】结束，或y返回失败，回归到这里，嵌套的resolvePromise依次结束
        //         resolvePromise(promise2, y, resolve, reject)
        //         log.debug(`end resolvePromise recursion, y is '${y}'`)
        //     },
        //     e => {
        //         // 防止走成功后又走失败
        //         if (called) return
        //         called = true

        //         // 同理，如果 x(promise) 返回失败，则当前then返回的promise2返回失败，值为x(promise)的失败原因
        //         // promise(x)失败又返回promise（即e是一个promise），不再递归解析，直接将最后的promise作为失败原因返回
        //         reject(e)
        //     })

        // 根据测试结果（4.promise-then.js 最后一个测试用例），需要异步执行thenable的then方法。使用 process.nextTick（个人理解）
        // 1. process.nextTick 事件将在当前阶段的尾部执行（下次事件循环之前）
        // 2. process.nextTick 将事件维护在 nextTickQueue 中
        //    对于promise来说，没加之前，立即调用then将回调放入 nextTickQueue 中；加了之后，先将对then的调用放入 nextTickQueue 中
        //    执行会后，再将回调放入 nextTickQueue 中。即对于nextTickQueue来说，回调会延迟执行，但最终都在当前阶段执行，
        //    对事件循环整体来说没有太大的影响
        // 3. 无法通过Promise/A+ 测试！！！

        process.nextTick(() => {
          then.call(x,
            (y) => {
              // 【这里调用别人实现的promise中的then方法，执行自己传入的回调】
              // 无法控制别人的代码执行几个回调，只能控制自己传入的回调（添加判断）防止走成功后又走失败
              if (called) return
              called = true

              // 等 x(promise) 返回成功（值为y）。则执行x的then方法的第一个参数函数（这里传入的回调）
              // 即执行当前then方法返回promise2的resolve方法，使当前then返回一个成功的promise2，值为x(promise)的成功结果y

              // resolve(y) 但是为了解决返回promise(x)成功又返回promise的现象(y还是一个promise)，这里需要递归解析

              log.debug(`before resolvePromise recursion, y is '${y}'`)
              // 第一个参数仍然是最外层then返回的promise2（用来保证不发生循环引用）,resolve、reject 也是promise2的
              //   当y(promise)返回后，调用promise2的resolve或reject
              // 当最终y不是promise,在【出口1或2】结束，或y返回失败，回归到这里，嵌套的resolvePromise依次结束
              resolvePromise(promise2, y, resolve, reject)
              log.debug(`end resolvePromise recursion, y is '${y}'`)
            },
            (e) => {
              // 防止走成功后又走失败
              if (called) return
              called = true

              // 同理，如果 x(promise) 返回失败，则当前then返回的promise2返回失败，值为x(promise)的失败原因
              // promise(x)失败又返回promise（即e是一个promise），不再递归解析，直接将最后的promise作为失败原因返回
              reject(e)
            })
        })
      } else {
        // x 不是 promise（是个普通对象或普通函数），例如：{then:123}
        // 递归出口1【终结者1】
        log.debug(`the property 'then' of 'x' is not a function, x is '${x}'`)
        resolve(x)
      }
    } catch (error) {
      // x.then 取值出错
      // thenable 方法体中，执行了传入的 resolve 参数函数后，再抛异常，也会进入这里
      log.error(`thenable error '${error}'`)

      // 防止走成功后又走失败
      if (called) return
      called = true

      reject(error)
    }
  } else {
    // 如果x不是对象或函数，直接返回成功状态的promise2
    // 递归出口2【终结者2】
    log.debug(`x is not a promise, x is ${x}`)
    resolve(x)
  }
}

log.debug('====== my promise ======')

class Promise {
  // 1. 创建类的实例，需要等构造函数中的代码全部执行完毕，才能拿到值
  //  1.1 如果resolve或reject是异步调用，则构造函数执行完毕返回 PENDING 状态的promise
  // 2. THIS
  //  2.1 构造函数中的THIS指代当前实例对象
  constructor(executor) {
    // executor 执行器
    // 1. 构造函数必须传入一个参数，类型是函数
    // 2. 如果不是函数，则直接抛类型错误
    if (typeof executor !== 'function') {
      throw new TypeError(`Promise resolver ${executor} is not a function`)
    }

    this.status = PENDING // 状态：初始状态为 pending
    this.value = undefined // 值: 保存成功的结果或失败的原因

    this.onResolvedCallbacks = [] // 存放状态变为成功时的回调
    this.onRejectedCallbacks = [] // 存放状态变为失败时的回调

    // 1. 调用 resolve 方法
    //   1.1 如果value是promise，则异步（调用）执行，作为 promise 成功后then的成功回调执行
    //   1.2 如果value非promise，则同步（调用）执行，将value赋值给THIS（如果放到定时器中，属于异步调用，但是调用后是立即同步执行的）
    // 2. THIS
    //   2.1 调用 resolve 方法的时候没有指明谁调用的，因此这里的THIS需要明确指向当前实例（使用箭头函数,THIS是构造函数中的THIS）
    const resolve = (value) => {
      // resolve中使用模板字符串，无法通过Promise/A+测试
      log.debug(`call resolve, status is '${this.status}', value is '${value}'`)

      // 异步resolve('this')，会导致循环引用-自己等待自己
      if (value === this) {
        // 返回一个失败的promise
        return reject(new TypeError('Chaining cycle detected for promise #<Promise>'))
      }

      // 这里不用兼容其他版本的promise，只是自己的功能（非规范中的）
      if (value instanceof Promise) {
        // 递归解析promise，直到value非promise
        // 是异步执行（涉及到then）
        // 调用内部then方法，不会抛出异常
        return value.then(resolve, reject)
      }

      // resolve解析thenable对象是ES6的功能，无法通过Promise/A+测试
      if (((typeof value === 'object' && value !== null) || typeof value === 'function')
        && typeof value.then === 'function') {
        // thenable 对象
        // 调用内部then方法，其回调是异步执行的，而调用thenable对象中then方法，其回调是同步的(调用thenable.then就会执行)
        // 因此这里需要在调用的时候异步（微任务）
        // 调用内部的then方法，无法做手脚。而thenable对象中可以对then方法做手脚，因此这里要放到try-catch中
        return process.nextTick(() => {
          try {
            value.then(resolve, reject)
          } catch (error) {
            reject(error)
          }
        })
      }

      // 只有 pending 状态可以修改状态和值（确保resolve和reject只会执行一次）
      if (this.status === PENDING) {
        this.value = value
        this.status = RESOLVED
        this.onResolvedCallbacks.forEach((cb) => cb())
      }

      // JSON.stringify() 丢失注册的函数
      log.debug('------promise is------', this) // 打印resolve所属的promise
    }

    // 1. 调用 reject方法，同步执行（如果放到定时器中，属于异步调用，但是调用后是立即同步执行的）
    //   1.1 不管reason属于什么类型值，都原样赋值给THIS
    //   1.2 如果reason是promise，reject不会进行解析，直接赋值给THIS
    const reject = (reason) => {
      log.debug(`call reject, status is '${this.status}', reason is '${reason}'`)
      // 只有 pending 状态可以修改状态和值（确保resolve和reject只会执行一次）
      if (this.status === PENDING) {
        this.value = reason
        this.status = REJECTED
        this.onRejectedCallbacks.forEach((cb) => cb())
      }
    }

    // 1. executor函数，立即同步执行
    //   1.1 同步代码报错，可以捕获到异常
    //   1.2 异步代码报错，无法捕获（当异步代码执行的时候，捕获异常的函数已经出栈了）
    // 2. executor 中默认提供 resolve reject 方法
    //   2.1 调用 resolve 将状态变为 resolved，值为成功结果。触发then的成功回调执行
    //   2.2 调用 reject 将状态变为 rejected，值为失败原因。触发then的失败回调执行
    //   2.3 不是静态方法，不是实例方法，也不是私有方法，就是一个在构造函数中定义的方法
    //   2.4 是一个闭包函数，在构造函数中定义，在创建promise的地方执行
    //   2.5 调用 resolve或reject 不会结束executor函数的执行，即后面的代码依然会执行。
    //       一般认为，调用 resolve或reject后，promise的作用就完成了，后续操作应该放到then方法中，
    //       因此一般在调用 resolve或reject前加上return
    //   2.6 resolve 和 reject 的参数只能是值类型，如果是个表达式（new构造函数 或 普通函数[调用]），
    //         会先将其在executor函数体中执行，得到表达式的返回值再传给 resolve 或 reject 执行
    //         如果在执行过程中报错，可以被executor的try-catch捕获
    // 3. 自定义
    //   3.1 成功还是失败（什么情况下调用 resolve/reject）由用户决定
    //   3.2 成功的结果和失败的原因，由用户决定
    try {
      executor(resolve, reject)
    } catch (error) {
      log.error(`catch executor error: '${error}'`)
      reject(error)
    }
  }

  // then
  // 1. Promise 必须具有then方法
  //   1.1 then方法需要用户传入两个参数函数（回调函数），第一个是状态变为成功时触发执行(接收成功的结果)【成功回调】，
  //       第二个是状态变为失败时触发执行（接收失败的原因）【失败回调】。【两个参数函数只能触发执行一个】
  //   1.2 如果某个参数函数没有传递，则会使用默认参数函数
  //   1.3 then方法同步执行，但是传入的两个参数函数（回调）是异步执行
  //         ES6的Promise中then属于微任务，其他Promise库可能是宏任务（bluebird）
  //         无法自己实现一个微任务，只能调用宿主环境提供的API
  //   1.4 then方法在调用参数函数时会传入'THIS'(调用then的promise实例)的值，即参数函数可以拿到当前promise的值
  // 2. then方法 返回一个【新】的promise
  //   2.1 then 方法的执行过程类似执行构造函数，处理完回调函数（注册到微任务队列或添加到待执行队列）之后，立即返回 PENDING 状态的promise
  //       继续执行后续同步代码（因此链式调用会同步执行then方法，完后再执行then方法的回调）
  // 3. then方法 返回promise的状态 及 链式调用 promise返回值的传递规则：
  //   3.1 需要在参数函数中用return明确指定返回值，否则then方法默认返回一个成功的promise，值是undefined，传入下一个then的成功回调中
  //   3.2 如果参数函数返回的是【普通值】（非promise实例、thenable对象、异常，即普通对象、数字、字符串、undefined（默认））
  //       则then方法返回一个成功的promise，值是该普通值，传入下一个then的成功回调中
  //   3.3 如果参数函数【抛出异常】，会被then内部的try-catch捕获
  //       则then方法返回一个失败的promise，值是异常原因，传入下一个then的失败回调中
  //   3.4 如果参数函数返回一个【promise实例】，则该promise实例的状态会决定当前then方法返回promise的状态，从而决定下一个then参数函数的执行情况
  //     3.4.1 如果参数函数返回一个成功的promise，则当前then也返回一个成功的promise，值是参数函数返回promise的成功结果，传入下一个then的成功回调中
  //     3.4.2 如果参数函数返回一个失败的promise，则当前then也返回一个失败的promise，值是参数函数返回promise的失败原因，传入下一个then的失败回调中
  // 4. 错误处理
  //   4.1 如果距离自己最近的then没有传递第二个参数函数，则找下一个then或catch
  // 5. THIS
  //   5.1 then方法中的THIS是调用then的promise实例

  then(onResolved, onRejected) {
    // 方法中的THIS是调用then的promise实例
    log.info(`call then, promise status is ${this.status}`)

    // 判断是否传递参数以及传递的是不是函数
    // onResolved = typeof onResolved === 'function' ? onResolved : value => { return value }
    onResolved = typeof onResolved === 'function' ? onResolved : (v) => v
    // onRejected = typeof onRejected === 'function' ? onRejected : err => { throw err }
    onRejected = typeof onRejected === 'function' ? onRejected : (e) => { throw e }

    // 懒递归，每次调用就new一个新的promise
    const promise2 = new Promise((resolve, reject) => {
      // then方法同步执行（判断是同步的），回调函数异步执行
      if (this.status === RESOLVED) {
        // then中回调函数异步执行，可以用 setTimeout 或 process.nextTick 模拟实现【只能用一种，不能混用】
        // ES6 规范中 then 是微任务，这里无法自己实现一个微任务，只能调用宿主环境提供的API（process.nextTick）

        // then方法同步执行到这里，创建匿名函数的时候，promise2 还没有定义（等构造函数中的代码全部执行完毕，才能拿到promise2）
        // 构造函数还没有执行完，但是在构造函数中就使用了实例，因此匿名函数的执行一定是异步的，才能在执行时拿到实例

        // setTimeout(() => {
        //     try {
        //         const x = onResolved(this.value)
        //         log.debug("RESOLVED:then return x =", x)
        //         resolvePromise(promise2, x, resolve, reject)
        //     } catch (error) {
        //         reject(error)
        //     }
        // }, 0)

        process.nextTick(() => {
          try {
            // 回调函数异步执行，外面executor的try-catch无法捕获到异常，因此需要在源头捕获
            const x = onResolved(this.value)
            // 如果x是普通值，可以直接 resolve(x)
            log.debug('RESOLVED:then return x =', x)

            // 递归解析回调函数的返回值x，决定then返回的promise2的状态
            // 如果x是promise，调用该promise的then方法时，传递的两个参数函数就是当前then返回promise2的executor中提供的resolve reject
            //   1. 如果该promise返回成功，则调用当前then返回promise2的resolve方法，使当前then返回一个成功的promise2
            //   2. 如果该promise返回失败，则调用当前then返回promise2的reject方法，使当前then返回一个失败的promise2
            resolvePromise(promise2, x, resolve, reject)
          } catch (error) {
            // 参数函数异常，then返回一个失败的promise2
            log.error('RESOLVED: catch error:', error)
            reject(error)
          }
        })
      }

      if (this.status === REJECTED) {
        // setTimeout(() => {
        //     try {
        //         const x = onRejected(this.value)
        //         log.debug("REJECTED:then return x =", x)
        //         resolvePromise(promise2, x, resolve, reject)
        //     } catch (error) {
        //         reject(error)
        //     }
        // }, 0)

        process.nextTick(() => {
          try {
            const x = onRejected(this.value)
            // 如果x是普通值，可以直接 resolve(x)
            log.debug('REJECTED:then return x =', x)
            resolvePromise(promise2, x, resolve, reject)
          } catch (error) {
            log.error('REJECTED: catch error:', error)
            reject(error)
          }
        })
      }

      // 如果 executor 里面异步调用resolve或reject，则调用then方法时，当前promise是pending状态
      // 如果当前状态是 pending，需要用发布订阅模式，则将传入的回调函数保存起来，稍后执行resolve或reject改变状态时再触发执行
      // 同一个promise可以多次调用 then 方法，因此会有多个回调函数，需要用数组保存
      if (this.status === PENDING) {
        // AOP
        this.onResolvedCallbacks.push(() => {
          // 不是立即执行，当执行外面的匿名函数的时候，才会执行
          // do other things...

          // setTimeout(() => {
          //     try {
          //         const x = onResolved(this.value)
          //         log.debug("PENDING->RESOLVED:then return x =", x)
          //         resolvePromise(promise2, x, resolve, reject)
          //     } catch (error) {
          //         reject(error)
          //     }
          // }, 0)

          process.nextTick(() => {
            try {
              const x = onResolved(this.value)
              // 如果x是普通值，可以直接 resolve(x)
              log.debug('PENDING->RESOLVED:then return x =', x)
              resolvePromise(promise2, x, resolve, reject)
            } catch (error) {
              log.error('PENDING->RESOLVED: catch error:', error)
              reject(error)
            }
          })
        })

        this.onRejectedCallbacks.push(() => {
          // setTimeout(() => {
          //     try {
          //         const x = onRejected(this.value)
          //         log.debug("PENDING->REJECTED:then return x =", x)
          //         resolvePromise(promise2, x, resolve, reject)
          //     } catch (error) {
          //         reject(error)
          //     }
          // }, 0)

          process.nextTick(() => {
            try {
              const x = onRejected(this.value)
              // 如果x是普通值，可以直接 resolve(x)
              log.debug('PENDING->REJECTED:then return x =', x)
              resolvePromise(promise2, x, resolve, reject)
            } catch (error) {
              log.error('PENDING->REJECTED: catch error:', error)
              reject(error)
            }
          })
        })
      }

    })
    return promise2
  }

  //= ============================================以下非Promise/A+ 规范===============================================
  // 返回一个新的promise，根据 onRejected 的返回结果决定返回promise的状态
  catch(onRejected) {
    // THIS指代调用catch的promise实例
    return this.then(null, onRejected)
  }

  // node>10
  // 表示前面的promise无论成功还是失败都会执行finally方法
  //   当无论如何必须要处理一个逻辑的时候使用，如果返回成功的promise不影响整个then链的结果
  // callback
  //  1. 调用callback不会传递参数（无法拿到前面promise的返回值）
  //  2. callback最终在then的参数函数中被调用
  //  3. callback返回一个promise（如果不是则用Promise.resolve转换为promise），且会等待这个promise返回
  // finally值传递规则
  //  调用then方法返回一个promise，根据callback的执行结果决定自己的状态和值
  //   1. 如果callback返回的promise成功，则finally返回成功的promise，值为前面promise的成功结果，传递下去（遵循 then 的链式调用原理）
  //   2. 如果callback返回的promise失败，则finally返回失败的promise，值为callback返回promise的失败原因，取代并传递下去（遵循 then 的链式调用原理）
  //   3. 如果callback执行报错，则被当前then回调的try-catch捕获，finally返回失败的promise，值为报错原因，取代并传递下去
  finally(callback) {
    log.info(`call finally, promise is ${JSON.stringify(this)}`)
    return this.then((value) => {
      log.debug('finally: previous promise is resolved')
      // 如果前面promise成功，则进入这里

      // 执行顺序：在回调函数中：
      //  1.执行 callback()，返回一个值
      //  2.执行 Promise.resolve()，返回一个promise
      //  3.执行 then方法，处理回调 '()=>value'
      //  4.返回一个 PENDING 状态的promise。（此时对外面的then方法来说就是第一个参数回调返回值x是一个promise，继续解析）
      return Promise.resolve(callback()).then(() => value)
    }, (err) => {
      log.debug('finally: previous promise is rejected')
      // 如果前面的promise失败，则进入这里
      return Promise.resolve(callback()).then(() => { throw err })
    })
  }

  // 将当前值转换为promise对象：Promise.resolve([value])
  // 参数:
  //  1. 是一个promise实例，则直接原样返回
  //  2. 是一个thenable对象，则异步调用其then方法,决定resolve返回promise的状态
  //    2.1 Promise.resolve([thenable]) 可能会返回一个失败的promise
  //  3. 不是thenable对象或promise实例，则返回一个新的成功的promise，值为该参数
  //  4. 不传参数，返回一个新的成功的promise，值为undefined
  static resolve(value) {
    // 不处理兼容
    if (value instanceof Promise) {
      // 原样返回
      return value
    }
    return new Promise((resolve, reject) => {
      if (((typeof value === 'object' && value !== null) || typeof value === 'function')
        && typeof value.then === 'function') {
        // thenable 对象
        // 调用内部then方法，其回调是异步执行的，而调用thenable对象中then方法，其回调是同步的(调用thenable.then就会执行)
        // 因此这里需要在调用的时候异步（微任务）
        // 调用内部的then方法，无法做手脚。而thenable对象中可以对then方法做手脚，因此这里要放到try-catch中
        process.nextTick(() => {
          try {
            value.then(resolve, reject)
          } catch (error) {
            reject(error)
          }
        })
      } else {
        return resolve(value)
      }
    })
  }

  // 将当前值转换为一个失败的promise对象：Promise.reject([value])
  static reject(reason) {
    return new Promise((resolve, reject) => {
      reject(reason)
    })
  }

  // 参数：实现iterator接口的可迭代对象（数组、字符串）
  //  1. 如果参数不存在或者不可迭代，返回一个失败的promise，值为类型错误
  //  2. 如果可迭代对象成员为空，返回一个成功的promise，值为空数组
  //  3. 如果可迭代对象成员不是promise，则调用 Promise.resolve 将其变为一个promise
  // 返回promise的状态：由所有可迭代对象的成员（promise）的返回状态决定
  //  1. 所有成员promise都返回成功，则all返回一个成功的promise，值为所有成员promise返回值组成的数组（按成员顺序排序）
  //  2. 只要一个成员promise返回失败，则all返回一个失败的promise，值为第一个失败的成员promise的失败原因
  //  3. 如果成员promise自身定义了catch方法，那么它被rejected时会被自身定义的catch捕获，
  //     并返回一个新的promise（用这个新promise状态代替该成员promise状态）
  static all(promises) {
    return new Promise((resolve, reject) => {
      if (promises === undefined || promises === null || !promises[Symbol.iterator]) {
        const preReason = promises === undefined ? `${promises}` : `${typeof promises} ${promises}`
        return reject(new TypeError(`${preReason} is not iterable (cannot read property Symbol(Symbol.iterator))`))
      }

      if (promises.length === 0) return resolve([])

      let index = 0
      const resultArr = []

      function processValue(i, value) {
        resultArr[i] = value
        index += 1
        if (index === promises.length) {
          resolve(resultArr)
        }
      }
      for (let i = 0; i < promises.length; i += 1) {
        // promises[i] 可能是普通值，用 Promise.resolve 包一层，确保都是promise
        Promise.resolve(promises[i]).then((value) => {
          processValue(i, value)
        }, (err) => {
          // 有一个失败则结束循环
          reject(err)
        })
      }
    })
  }

  // 参数：实现iterator接口的可迭代对象（数组、字符串）
  //  1. 如果参数不存在或者不可迭代，返回一个失败的promise，值为类型错误
  //  2. 如果可迭代对象成员为空，【返回一个PENDING 状态的promise】
  //  3. 如果可迭代对象成员不是promise，则调用 Promise.resolve 将其变为一个promise
  // 返回promise的状态：
  //  1. 只要一个成员promise返回，则race返回相同状态的promise
  static race(promises) {
    return new Promise((resolve, reject) => {
      if (promises === undefined || promises === null || !promises[Symbol.iterator]) {
        const preReason = promises === undefined ? `${promises}` : `${typeof promises} ${promises}`
        return reject(new TypeError(`${preReason} is not iterable (cannot read property Symbol(Symbol.iterator))`))
      }

      if (promises.length === 0) return

      for (let i = 0; i < promises.length; i += 1) {
        Promise.resolve(promises[i]).then((value) => resolve(value), (err) => reject(err))
      }
    })
  }
}

// 测试入口
// Promise的延迟对象，测试的时候会调用这个函数
Promise.deferred = () => {
  const dfd = {}
  dfd.promise = new Promise((resolve, reject) => {
    dfd.resolve = resolve
    dfd.reject = reject
  })
  return dfd
}

Promise.defer = Promise.deferred

module.exports = Promise
