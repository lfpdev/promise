//====================测试executor：不传递、非函数==================
/* 
 * 直接抛错（到全局），promise内部没有捕获
*/

// const Promise = require('../../src/promise/promise-comment')

// console.log("script start")
// new Promise() // TypeError: Promise resolver undefined is not a function
// new Promise(123) // TypeError: Promise resolver 123 is not a function
// console.log("script end")


//====================测试executor：执行同步代码=====================
/* 
 * 同步执行resolve或reject或抛异常，构造函数结束，promise状态就被改变
*/

/* const Promise = require('../../src/promise/promise-comment')

console.log("--script start--")
// 同步代码
let promise = new Promise((resolve, reject) => {
    // 以下都是同步代码
    // 由用户决定成功还是失败已经成功和失败的原因
    console.log("executor 同步执行")

    // let result = "收到offer"
    // resolve方法同步执行，但当result为promise实例时，异步执行
    // resolve(result)

    // let err = "没收到offer"
    // reject方法同步执行
    // reject(err)

    // 同步代码报错，捕获并返回一个失败的promise
    throw new Error('没收到offer')
})

// promise 里面如果是同步代码，则构造函数执行完毕，返回的 promise 已经不是 pending 状态了
console.log('初始状态：', promise)
promise.then((result) => {
    console.log(`成功的结果: ${result}`)
}, (err) => {
    console.log(`失败的原因：${err}`)
})
console.log("--script end--") */


//=====================测试executor：执行异步代码=======================
/* 
 * 异步代码，异步执行
 * 构造函数执行完毕，会先返回一个 PENDING 状态的promise，等异步代码执行才修改状态
 * 异步代码报错，promise无法捕获，只能异步代码自己捕获然后修改状态为 REJECTED，将错误信息传递出去
*/

/* // const Promise = require('../../src/promise/promise-comment')

console.log("--script start--")
// 异步代码
let promise = new Promise((resolve, reject) => {
    // 以下都是异步代码
    // 由用户决定成功还是失败已经成功和失败的原因

    setTimeout(() => {
        // let result = "收到offer"
        // resolve(result)

        // let err = "没收到offer"
        // reject(err)

        // 异步抛出异常，promise内部无法捕获，直接抛出全局(只能全局捕获)
        // throw new Error('没收到offer')

        // 自己做处理
        // try {
        //     throw Error('没收到offer')
        // } catch (error) {
        //     reject(error)
        // }

    }, 500);
})

// promise 里面如果是异步代码，则构造函数执行完毕，返回的 promise 还是 pending 状态
// 因此 then 方法的回调需异步执行
console.log('初始状态：', promise)
promise.then((result) => {
    console.log(`成功的结果: ${result}`)
}, (err) => {
    console.log(`失败的原因：${err}`)
})
setTimeout(() => {
    console.log('测试异步是否执行') // 全局捕获且不退出，则会执行。否则不会执行
}, 1000)
console.log("--script end--") */


// 全局捕获
// process.on('uncaughtException', (error) => {
//     console.log('[UncaughtException]:', error)
//     // process.exit(1)
// })

// process.on('unhandledRejection', (reason, promise) => {
//     console.log('[UnhandledRejection at]:', promise, '\n [Reason]:', reason)
//     // process.exit(1)
// })