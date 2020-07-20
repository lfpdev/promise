//=======================thenable 函数=================================

// function ThenableFunc() {
// }
// ThenableFunc.prototype.then = function (resolve, reject) {
//     resolve('成功啦')
//     console.log("i am a thenable obj")
// }
// let f1 = new ThenableFunc()
// f1.then()

//========================模拟x.then取值报错及二次取值报错===================

/* // thenable 对象
let thenableObj = {
    index: 1,
    then: function f(resolve, reject) {
        // resolve('成功啦')
        console.log("i am a thenable obj")
    }
}
Object.defineProperty(thenableObj, 'then', {
    get() {
        console.log(`第${thenableObj.index}次获取then`)
        // throw Error("取值报错")

        if (thenableObj.index++ == 2) {
            throw Error("二次取值报错")
        }
        return function f(resolve, reject) {
            // resolve('成功啦')
            console.log("i am a thenable obj")
        }
    }
})

let res = thenableObj.then
console.log(typeof res)
let res2 = thenableObj.then
console.log(typeof res2)
// 第1次获取then
// function
// 第2次获取then
// 报错 Error: 二次取值报错 */

//========================模拟x走成功后又抛异常走失败============================

/* // thenable 对象
let thenableObj = {
    index: 1,
    then: function f(resolve, reject) {
        // resolve('成功啦')
        console.log("resolve('成功啦')")
        // 走成功后，又抛个异常，在源码中会被try-catch捕获，因此catch中需要加 'called' 判断
        throw Error('走成功后又抛个异常')
    }
}

thenableObj.then()

// resolve('成功啦')
// 报错 Error: 走成功后又抛个异常  */

//======================测试 thenable 走成功抛异常====================

/* // const Promise = require('../../src/promise/promise-comment')
let thenableObj = {
    index: 1,
    then: function f(resolve, reject) {
        // 调用传入的 resolve 方法，传值 '成功啦'
        resolve('成功啦')
        console.log("resolve('成功啦')")
        // 走成功后，又抛个异常，在源码中会被try-catch捕获，因此catch中需要加 'called' 判断
        throw Error('走成功后又抛个异常')
    }
}

let p1 = new Promise(res => res(1))
let p2 = p1.then((value) => {
    return thenableObj
})

console.log('p2 = ', p2)
setTimeout(() => {
    console.log('p2 = ', p2)
}, 0); */