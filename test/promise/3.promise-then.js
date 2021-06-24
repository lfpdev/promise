//===========================then链式调用及值传递============================
/* 
 * 1. then链式调用 优化 嵌套回调 的写法
 * 2. then的参数函数默认返回undefined，如果要链式调用，一般需要用return指明返回值
 *  2.1 返回promise，需要根据返回的promise的状态决定then返回promise的状态
 *  2.2 抛异常，传入下一个then的失败回调中
 *  2.3 普通值，传入下一个then的成功回调中
*/

/* let fs = require('fs')
const Promise = require('../../src/promise/promise-comment')

// 需求是读取一个文件获取路径，然后再继续读取内容

// 【回调嵌套】写法
// 回调参数的顺序，error first ,错误第一，异步方法无法通过try-catch 捕获异常
fs.readFile('./name.txt', 'utf-8', (err, data) => {
    if (err) {
        // 错误处理...
    }
    console.log("data = ", data)
    fs.readFile(data, 'utf-8', (err, data) => {
        if (err) {
            // 错误处理...
        }
        console.log("data = ", data)
    })
})

// 利用promise优化，【链式调用】写法
function readFileSync(filePath) {
    return new Promise((res, rej) => {
        fs.readFile(filePath, 'utf-8', (err, data) => {
            if (err) return rej(err)
            // 一般加 return，因为 res 不会结束 promise 的执行（后面的代码还会执行），
            //  但是执行res/rej就意味着promise的作用已经完成了
            return res(data)
        })
    })
}

// 第一次then获取返回结果，再then第二次，解决嵌套问题
readFileSync('./name.txt').then((data) => {
    console.log('获取到数据', data)
    // 默认返回 undefined，传入下一个then的成功回调中（尤其是需要返回promise的情况）
    // return 100 //-> 下一个then的成功回调
    // throw Error('手动error') //-> 下一个then的失败回调
    return readFileSync(data)  //-> 根据返回的promise状态决定下一个then的回调
}).then((data) => {
    console.log('获取到数据', data)
}, (err) => {
    console.log('失败', err)
}) */


//===========================测试then是宏任务or微任务===========================
/* 
 * ES6 的 then 是微任务
*/

/* let fs = require('fs')
const Promise = require('../../src/promise/promise-comment')

// 需求是读取一个文件获取路径，然后再继续读取内容
fs.readFile('./name.txt', 'utf-8', (err, data) => {
    if (err) {
        // 错误处理...
    }
    console.log("data = ", data)
    fs.readFile(data, 'utf-8', (err, data) => {
        if (err) {
            // 错误处理...
        }
        console.log("data = ", data)
    })
})

function readFileSync(filePath) {
    return new Promise((res, rej) => {
        fs.readFile(filePath, 'utf-8', (err, data) => {
            if (err) return rej(err)
            return res(data)
        })
    })
}

readFileSync('./name.txt').then((data) => {
    console.log('获取到数据', data)
    return readFileSync(data)
}).then((data) => {
    console.log('获取到数据', data)
}, (err) => {
    console.log('失败', err)
})
 */

// fs.readFile 的回调函数是宏任务

/*
用 setTimeout 实现then的异步调用（宏任务），跟es6执行顺序不同

输出结果：
data =  age.txt
data =  27
获取到数据 age.txt
获取到数据 27

分析： 
// 第一轮 
fs.readFile 添加一个宏任务1（读取到数据之后触发）
readFileSync 添加一个宏任务2（读取到数据之后触发）
// 第二轮(读取到数据)
宏任务1执行，输出=>data =  age.txt，添加宏任务3
宏任务2执行，添加宏任务4（then）
// 第三轮
宏任务3执行，输出=>data =  27
// 第四轮
宏任务4执行，输出=>获取到数据 age.txt，添加宏任务5
// 第五轮
宏任务5执行，添加宏任务6（then）
// 第六轮
宏任务6执行，输出=>获取到数据 27
*/


/* 
换用 process.nextTick 来实现则执行顺序相同

输出结果：
data =  age.txt
获取到数据 age.txt
data =  27
获取到数据 27

分析：
// 第一轮 
fs.readFile 添加一个宏任务1（读取到数据之后触发）
readFileSync 添加一个宏任务2（读取到数据之后触发）
// 第二轮(读取到数据)
宏任务1执行，输出=>data =  age.txt，添加宏任务3
宏任务2执行，添加微任务1（then）
// 第三轮
微任务1执行，输出=>获取到数据 age.txt，添加宏任务4
// 第四轮
宏任务3执行，输出=>data =  27
// 第五轮
宏任务4执行，添加微任务2（then）
// 第六轮
微任务2执行，输出=>获取到数据 27
*/

//=============================测试 then 循环引用问题========================
/* 
 * 1. then中第一个参数函数异步执行的时候，then返回promise的构造函数已经执行完，可以拿到p2的值，构成循环引用
 * 2. then中需要判断循环引用，返回失败的promise，值为 ‘[TypeError: Chaining cycle detected for promise #<Promise>]’
*/

/* const Promise = require('../../src/promise/promise-comment')

let promise = new Promise((resolve, reject) => {
    resolve(1)
})
// 循环引用，自己等待自己
let p2 = promise.then(value => {
    return p2
})
// 也无法在外面调用 resolve 使自己返回
// p2.resolve() //=> TypeError: p2.resolve is not a function

// 需要通过 p2 监听自己的返回结果
p2.then(() => { }, (err) => {
    console.log(err) //=> [TypeError: Chaining cycle detected for promise #<Promise>]
})

setTimeout(() => {
    console.log("p2 = ", p2)
}, 0);
//=>
// p2 =  Promise {
//     <rejected> [TypeError: Chaining cycle detected for promise #<Promise>]
// } */


//=========================测试then的参数函数返回promise=========================
/*
当前 then 返回一个新的promise，执行当前then的参数函数，其返回结果
 1. 如果是普通值则当前then返回一个resolved的promise
 2. 如果是promise，则调用该promise的then方法（内部实现自带的）获取该promise的状态和值，调用该promise的then方法时需要传递两个参数
    这两个参数就是当前then返回promise的resolve reject（代码实现）
    1. 如果该promise返回成功，则调用当前then返回promise的resolve方法，当前then返回一个成功的promise
    2. 如果该promise返回失败，则调用当前then返回promise的reject方法，当前then返回一个失败的promise
*/

/* const Promise = require('../../src/promise/promise-comment')

let promise = new Promise((resolve, reject) => {
    resolve(1)
})
let promise2 = promise.then(result => {
    return new Promise((res, rej) => {
        setTimeout(() => {
            res("success")
            // rej("fail")
        }, 1000);
    })
})
// 外面想要获取当前then返回promise的结果，还是要调用当前then返回promise的then方法
promise2.then(res => {
    console.log("当前then返回promise的值", res)   // 当前then返回promise的结果 success
}, err => {
    console.log("当前then返回promise的值", err)   // 当前then返回promise的结果：fail
}) */


//=========测试 then的参数函数返回promise，该promise又返回一个promise========
/* 
 * then 会递归解析其回调函数返回的promise。最内层promise的状态决定外层then返回promise的状态
 * resolve(promise)会接续解析，reject(promise)不会继续解析
*/

// const Promise = require('../../src/promise/promise-comment')
// let p = new Promise((resolve, reject) => {
//     resolve(1)
// })

/* // [resolve(promise)]
// 3层promise：最外层p1，中间层p2(then的第一个回调返回的promise)，最内层p3（1秒后成功或失败）
let p1 = p.then(value => {
    // then的参数函数返回一个 new Promise
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // resolve 又返回一个promise，递归解析
            resolve(new Promise((resolve, reject) => {
                setTimeout(() => {
                    // 最内层promise调用resolve成功之后，会执行其then的第一个回调，即执行中间层p2的resolve
                    // resolve("success") 
                    // 最内层promise调用reject失败之后，会执行其then的第二个回调，即执行中间层p2的reject
                    reject("fail")
                }, 1000);
            }))
        }, 1000);
    })
})
// 外面想要获取当前then返回promise的结果，还是要调用当前then返回promise的then方法
p1.then(res => {
    console.log("当前then返回promise的结果1", res)   // 当前then返回promise的结果1 success
}, err => {
    console.log("当前then返回promise的原因1", err)   // 当前then返回promise的原因1 fail
}) */


/* // [reject(promise)]
let promise = new Promise((resolve, reject) => {
    resolve(1)
})
let promise2 = promise.then(value => {
    // then的参数函数返回一个 new Promise
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // reject 又返回的一个promise，不再递归解析（但是会执行new表达式，执行完后立即返回一个 PENDING 状态的promise）
            reject(new Promise((resolve, reject) => {
                console.log("执行")
                setTimeout(() => {
                    resolve("success")
                }, 1000);
            }))
        }, 1000);
    })
})
// 外面想要获取当前then返回promise的结果，还是要调用当前then返回promise的then方法
promise2.then(res => {
    console.log("当前then返回promise的结果2", res)
}, err => {
    console.log("当前then返回promise的原因2", err) // 当前then返回promise的原因2 Promise { <pending> }
})
 */

//=============================测试then的默认参数函数========================
/* 
 * then 的参数是可选的，如果没有传递会使用默认的参数函数
*/

/* const Promise = require('../../src/promise/promise-comment')

let promise = new Promise((resolve, reject) => {
    // resolve(1)
    reject(2)
})

// 值的穿透，从第一个then穿透到第三个then中，说明then中的参数是可选的
// 这样可以做到统一处理错误（让错误穿透到最后的catch中）
promise.then().then().then(result => {
    console.log(result) // 1
}, err => {
    console.log(err) // 2
}) */


//=====================测试then参数函数返回thenable对象==========================
/*  
 * then解析 thenable 调用其then 方法也是异步调用的
*/
// const Promise = require('../../src/promise/promise-comment')

/* console.log("--script start--")
let obj = {
    then: function (onResolved, onRejected) {
        console.log("异步执行thenable then")
        onResolved('成功啦')
        // onRejected('失败啦')
        // throw Error("Oops!")
    }
}
setTimeout(() => {
    console.log("setTimeout")
}, 0)

let p = Promise.resolve('ok')
let p1 = p.then(res => {
    console.log("p2 then")
    return obj
})

let p2 = Promise.resolve('ok2')
let p3 = p2.then(res => {
    console.log("p3 then")
    return 
})

console.log("p1 =", p1)

setTimeout(() => {
    console.log("p1 = ", p1)
}, 0)
console.log("--script end--") */

// 输出：
// --script start--
// p1 = Promise { <pending> }
// --script end--
// p2 then
// p3 then
// 异步执行thenable then
// setTimeout
// p1 =  Promise { '成功啦' }

// 如果不是异步调用，顺序是：
// --script start--
// p1 = Promise { <pending> }
// --script end--
// p2 then
// 异步执行thenable then
// p3 then
// setTimeout
// p1 =  Promise { '成功啦' }