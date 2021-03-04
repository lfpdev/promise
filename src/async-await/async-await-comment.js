/*
async await 是promise的语法糖，优化promise的then链写法，用同步的方式编写异步代码

async 异步函数（包含函数声明、函数表达式、Lambda表达式[箭头函数]等使用形式）
1. 返回一个 Promise 对象
  1. 直接返回成功或失败状态的promise
    1.1 函数体没有await，return 一个普通值（非promise和thenable对象，默认undefined），async立刻返回一个成功状态的promise，值为该普通值
    1.2 函数体中没有await或在await之前，抛出异常，async立即返回失败的promise，值为失败原因，异常不会抛到函数体外面影响外面代码的执行
  2. 先返回PENDING状态的promise，然后再异步修改状态
    2.1 函数体中有await，在await获取到值之前，async先返回 PENDING 状态的promise，然后再根据await后面表达式返回promise的状态而改变
    2.2 如果await后面表达式返回的promise失败且未捕获异常，则async返回的promise失败，失败原因是表达式返回promise的失败原因
2. 最外层async无法用 await 获取其返回值，应该用原始方式：then链来处理async返回的 promise 对象

await 表达式（包含promise对象，普通函数调用、基本值类型）
1. 【等待】表达式的【返回值】
    1.1 如果表达式的值是promise对象，则等待promise返回（调用其then方法，异步获取），并将其返回值作为await表达式的值
    1.2 如果表达式的值不是promise对象，则通过 Promise.resolve 转换为 promise对象,等待其返回，并将其返回值作为await表达式的值
2. await相当于调用后面表达式返回promise的then方法，异步（等待）获取其返回值。即 await<==>promise.then
    2.1 不管代码中是否用到await表达式返回值，await都会去获取（调用其then方法），在获取到之前，async会返回一个 PENDING 状态的promise。
    2.2 函数体中await表达式后面的代码相当于promise.then方法的第一个回调(onResolved),可以拿到表达式返回promise的返回值（即await表达式返回值）
        因此await会阻塞函数体中后面代码的执行（异步执行then的回调），但是表达式是同步执行的【因此await操作符只能出现在async异步函数中】
        如果await表达式后面没有代码，则相当于then的第一个回调不传，使用默认回调函数（v=>v）
    2.3 调用promise.then方法的第二个回调默认不传，使用默认回调函数（err=>{throw err}）
        因此当表达式报错或返回失败的promise，await会将该异常抛出到函数体中，可以（需要）通过try-catch捕获异常
        如果await promise调用了其catch方法，则不会抛出，因为catch也返回一个promise，相当于await调用catch返回promise的then方法
        第二个回调传递方式：
          1. 当表达式返回值是promise且调用其catch方法时，相当于传递了第二个回调（即catch方法中的回调）
          2. 当await表达式放在try-catch中时，相当于传递了第二个回调（即catch方法中的回调）
*/

//= ==================自己实现async、await=====================
const u = require('../utils')

const log = u.debugGenerator(__filename)

/**
 *@param func: 异步函数
 */
const _async = (func) => {
  const p = new Promise((resolve, reject) => {
    try {
      const value = func()
      if (((typeof value === 'object' && value !== null) || typeof value === 'function')
        && typeof value.then === 'function') {
        log.debug('===value is a thenable obj===')
        // promise 或 thenable

        // 1. 如果返回一个thenable对象，这里需要用Promise.resolve转为promise，以达到异步调用thenable.then的效果
        // 2. 如果返回一个promise，Promise.resolve原样返回，无影响。因此统一用Promise.resolve转为promise
        //    2.1 如果函数体有await，则这里相当于_await返回的 innerPromise.then(resolve,reject)
        Promise.resolve(value).then(resolve, reject)
        setTimeout(() => {
          log.info('异步 async  的 p =', p)
        }, 0)
      } else {
        // 普通值（undefined、123、"123"、{then:123}） 立即返回成功的promise
        resolve(value)
      }
      log.debug('========async return==========')
    } catch (error) {
      log.debug('===value is not a thenable obj===')
      //  3. 如果函数体中同步代码报错，则返回失败的promise，值为失败原因
      log.error('========async catch===========\n', error)
      reject(error)
    }
  })
  log.info('同步 async  的 p =', p)
  return p
}

/**
 * @param arg: await后面的表达式
 * @param onResolved: 函数体中await表达式下面的代码
 * @param onRejected: 函数体中的catch回调函数
 */
// 注意变形之后需要加 return _await ...
// 多个await，变形后会嵌套调用_await，这里用计数器n区分
// await promise自带catch或被try-catch包裹，相当于将catch的回调函数作为 onRejected 传入
const _await = (() => {
  let n = 0
  return (arg) => {
    n += 1
    return (onResolved, onRejected) => {
      // Promise.resolve(arg) 返回失败，执行 onRejected （如果没有传递则执行then的默认失败回调，innerPromise失败）
      // Promise.resolve(arg) 返回成功，执行 onResolved
      // onResolved 的执行结果决定then返回innerPromise的状态，从而决定async返回promise的状态
      // onResolved 抛异常，then内部会捕获，返回innerPromise失败，async返回promise失败
      const innerPromise = onRejected ? Promise.resolve(arg).catch(onRejected).then(onResolved)
        : Promise.resolve(arg).then(onResolved)
      setTimeout((() => {
        log.info(`异步 then-${n} 的 p =`, innerPromise)
      }), 0)
      log.info(`同步 then-${n} 的 p =`, innerPromise)
      return innerPromise
    }
  }
})()

module.exports = {
  _async,
  _await
}

/*
// 传统promise和async-await编辑器自动转换

//catch方法转换为try-catch
function f() {
    return new Promise((res, rej) => {
        setTimeout(() => {
            rej('err')
        }, 1000);
    }).then(data => {
        console.log(data)
    }).catch(err => {
        console.log(err)
    })
}

async function f() {
    try {
        const data = await new Promise((res, rej) => {
            setTimeout(() => {
                rej('err');
            }, 1000);
        });
        console.log(data);
    }
    catch (err) {
        console.log(err);
    }
}

//then的第二个回调和catch方法都转换为try-catch

function f() {
    return new Promise((res, rej) => {
        setTimeout(() => {
            rej('err')
        }, 1000);
    }).then(data => {
        console.log(data)
    }, e => {
        console.log(e)
    }).catch(err => {
        console.log(err)
    })
}

async function f() {
    try {
        try {
            const data = await new Promise((res, rej) => {
                setTimeout(() => {
                    rej('err')
                }, 1000)
            })
            console.log(data)
        }
        catch (e) {
            console.log(e)
        }
    }
    catch (err) {
        console.log(err)
    }
}

//多个await

function f() {
    return new Promise((res, rej) => {
        setTimeout(() => {
            rej('err')
        }, 1000);
    }).then(data => {
        return new Promise((res, rej) => {
            res("suc")
        }).then(data => {
            console.log(data)
        })
    }).catch(err => {
        console.log(err)
    })
}

async function f() {
    try {
        const data = await new Promise((res, rej) => {
            setTimeout(() => {
                rej('err')
            }, 1000)
        })
        const data_1 = await new Promise((res, rej) => {
            res("suc")
        })
        console.log(data_1)
    }
    catch (err) {
        console.log(err)
    }
}

*/
