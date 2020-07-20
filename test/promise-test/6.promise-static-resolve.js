//================测试 不传参数或null=================
/* 
 * 返回一个立即resolved的promise
*/

/* const Promise = require('../../src/promise/promise-comment')

let p = Promise.resolve() //  p =  Promise { undefined }

let p = Promise.resolve(null) // p =  Promise { null }
let p = Promise.resolve(123) // p =  Promise { 123 }

setTimeout(() => {
    console.log("p = ", p)
}, 0); */

//===================测试 Promise.resolve(promise) 原样返回=================
/* 
 * 原样返回，不产生新的promise对象
*/

/* const Promise = require('../../src/promise/promise-comment')

let p1 = Promise.resolve("ok")
let p2 = Promise.resolve(p1)
console.log("p1 === p2 ", p1 === p2) // p1 === p2  true */


//=================测试 thenable 对象执行顺序 及微任务==================================
/* 
 * Promise.resolve 解析thenable对象，异步调用其 then 方法
*/

/* const Promise = require('../../src/promise/promise-comment')

let p = Promise.resolve(20)
p.then((data) => {
    console.log(data);
})

setTimeout(() => {
    console.log("setTimeout")
}, 0)

let p2 = Promise.resolve({
    // thenable.then 是异步调用的(微任务)
    then: function (resolve, reject) {
        resolve(30)
    }
})
p2.then((data) => {
    console.log(data)
})

let p3 = Promise.resolve(new Promise((resolve, reject) => {
    resolve(400)
}))
p3.then((data) => {
    console.log(data)
}) */

// 20
// 400
// 30
// setTimeout

//=================测试 thenable 抛出异常==================================
/* 
 * 在调用 resolve 或 reject 之前抛异常，被捕获，返回失败的promise
 * 在调用之后抛异常，被捕获，不改变promise状态
*/

/* // const Promise = require('../../src/promise/promise-comment')
let obj = {
    then: function (resolve, reject) {

        throw Error("mmm")

        // resolve(30); // p =  Promise { 30 }

        // 后面的异常会被捕获但是不会改变外面promise的状态（因为已经被修改了）
        // throw Error("mmm")

        // reject("error") // p =  Promise { <rejected> 'error' }
    }
}

let p = Promise.resolve(obj)
setTimeout(() => {
    console.log("p = ", p)
}, 0); */

//抛异常输出
// p =  Promise {
//     <rejected> Error: mmm
//         at Object.then (/home/lfp/dev/javascript-notes/src/syntax/promise/7.promise-static-resolve.js:77:15)
// }


//================================Promise.resolve(promise)========================
/* 
 * Promise.resolve 解析promise
 * Promise.reject 不解析promise
*/

/* const Promise = require('../../src/promise/promise-comment')

var p1 = new Promise(function (resolve, reject) {
    resolve(Promise.resolve('resolve'));
});

var p2 = new Promise(function (resolve, reject) {
    resolve(Promise.reject('reject'));
});

var p3 = new Promise(function (resolve, reject) {
    reject(Promise.resolve('resolve'));
});

p1.then(
    function fulfilled(value) { console.log('p1 fulfilled: ' + value); },
    function rejected(err) { console.log('p1 rejected: ' + err); }
);

p2.then(
    function fulfilled(value) { console.log('p2 fulfilled: ' + value); },
    function rejected(err) { console.log('p2 rejected: ' + err); }
);

p3.then(
    function fulfilled(value) { console.log('p3 fulfilled: ' + value); },
    function rejected(err) { console.log('p3 rejected: ' + err); }
); */

// p3 rejected: [object Promise]
// p1 fulfilled: resolve
// p2 rejected: reject 



//================测试 Promise.reject 不传参数或null=================
/* const Promise = require('../../src/promise/promise-comment')

let p = Promise.reject() //  p =  Promise { <rejected> undefined }
let p = Promise.reject(null) // p =  Promise { <rejected> null }
let p = Promise.reject(123) //p =  Promise { <rejected> 123 }
 */

//================测试 Promise.reject 传thenable =================
/* 
 * 不解析thenable对象
*/

/* const Promise = require('../../src/promise/promise-comment')
let obj = {
    then: function (onResolved, onRejected) {
        console.log("异步执行thenable then")
        onResolved('成功啦')
    }
}
let p = Promise.reject(obj)

setTimeout(() => {
    console.log("p = ", p) // p =  Promise { <rejected> { then: [Function: then] } }
}, 0); 
 */