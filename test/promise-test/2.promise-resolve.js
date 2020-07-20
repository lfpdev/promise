//========================resolve(基本类型值)同步执行====================
/* 
 * 同步执行，立即改变promise状态，构造函数执行完毕，promise状态已经确定
*/

/* // const Promise = require('../../src/promise/promise-comment')

console.log("--script start--")
let p1 = new Promise((resolve, reject) => {
    // resolve(11) // p1 =  Promise { 11 }
    resolve('abc') // p1 =  Promise { 'abc' }
})
// 同步执行，new构造函数执行完之后p1就已经返回成功
console.log("p1 = ", p1) 

setTimeout(() => {
    console.log("p1 = ", p1) 
}, 1000)
console.log("--script end--") */

//========================resolve(函数、异常)同步执行=============================
/* 
 * executor 函数执行过程中会先执行匿名函数,然后再将返回值作为参数执行 resolve 方法
 * 而匿名函数在执行过程中报错了,所以被 executor 的try-catch 捕获,执行 reject 方法
*/

/* // const Promise = require('../../src/promise/promise-comment')

console.log("--script start--")
let p1 = new Promise(function (resolve, reject) {
    console.log("1-1")
    resolve((() => {
        console.log("1-2")
        throw new Error("Oops!")
    })())
    console.log("2-1")
});

setTimeout(() => {
    console.log("p1 = ", p1)
}, 1000); 
console.log("--script end--")
 */

//===========================resolve(thenable对象)异步执行=========================
/* 
 * ES6 的resolve可以解析thenable对象。且thenable.then属于微任务
 * thenable.then方法中的参数函数的执行情况会决定当前promise的状态
*/

/* const Promise = require('../../src/promise/promise-comment')

console.log("--script start--")
let obj = {
    then: function (onResolved, onRejected) {
        console.log("异步执行thenable then")
        onResolved('成功啦')
        // onRejected('失败啦')
        throw Error("Oops!")
    }
}
setTimeout(() => {
    console.log("setTimeout") 
}, 0);
let p1 = new Promise(function (resolve, reject) {
    console.log("1")
    resolve(obj);
    console.log("2")
});
p1.then(res=>{
    console.log("promise then")
}) 
console.log("p1 =", p1)
setTimeout(() => {
    console.log("p1 = ", p1) 
}, 0); 
console.log("--script end--") */


// 从输出顺序可以看出调用thenable的then方法属于微任务
// --script start--
// 1
// 2
// p1 =  Promise { <pending> }
// --script end--
// 异步执行thenable then 
// promise then
// setTimeout
// p1 =  Promise { '成功啦' }

// 如果是宏任务，则输出顺序应为（调用resolve之前，p1.then尚未注册到事件队列中）
// --script start--
// 1
// 2
// p1 =  Promise { <pending> }
// --script end--
// setTimeout
// 异步执行thenable then
// promise then
// p1 =  Promise { '成功啦' }

//=======================resolve(promise)异步执行=========================
/* 
 * resolve()的参数只能是个值类型,如果是表达式(函数调用或new构造函数)会先将表达式在executor函数体中执行
 *   然后再把返回值当做参数执行resolve
 * resolve(promise) 异步执行，作为内层promise成功后的 then的 成功回调执行（代码实现）
*/

/* const Promise = require('../../src/promise/promise-comment')

console.log("--script start--")
let p1 = new Promise((resolve, reject) => {
    resolve(new Promise(res => res('resolved')));
})

console.log("p1 = ", p1) // p1 =  Promise { <pending> }

setTimeout(() => {
    console.log("p1 = ", p1) // p1 =  Promise { 'resolved' }
}, 1000); 
console.log("--script end--") */

//=======================测试 resolve内部 是否有对参数的判断======================
/* 
 * 外层promise的值是内层promise成功的结果。所以resolve内部是有对参数的判断(如果是 promise 则接续解析)
*/

/* // const Promise = require('../../src/promise/promise-comment')

console.log("--script start--")
var p1 = new Promise(function (resolve, reject) {
    resolve(Promise.resolve('resolve'));
});

setTimeout(() => {
    console.log("p1 = ", p1) // p1 =  Promise { 'resolve' }
}, 1000); 
console.log("--script end--") */

//=======================测试 resolve(new Promise)递归解析========================
/* 
 * resolve(promise) 可以递归解析，由内层promise的状态决定外层promise的状态
 * reject(promise) 不会递归解析，外层promise直接返回失败，失败原因是promise
*/

/* const Promise = require('../../src/promise/promise-comment')

var p1 = new Promise(function (resolve, reject) {
    resolve(new Promise(res => res('resolve')));
});

var p2 = new Promise(function (resolve, reject) {
    // 将resolve实参promise的状态变为自己的状态，将实参promise的值变为自己的值
    resolve(new Promise((res, rej) => { rej('reject') }));
});

var p3 = new Promise(function (resolve, reject) {
    reject(new Promise(res => res('resolve')));
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

// 输出结果：
// p3 rejected: [object Object]
// p1 fulfilled: resolve
// p2 rejected: reject 


/*
解释：
// 同步代码执行
p1 的 resolve 注册到下一轮循环执行
p2 的 resolve 注册到下一轮循环执行
p3 的 reject 当前执行栈中同步执行，将 p3.then 注册到下一轮循环执行

// 下一轮循环
p1 的 resolve 执行，将 p1.then 注册到下一轮循环执行
p2 的 resolve 执行，将 p2.then 注册到下一轮循环执行
p3.then 执行，输出 => p3 rejected: [object Object]

// 下一轮循环
p1.then 执行，输出 => p1 fulfilled: resolve
p2.then 执行，输出 => p2 rejected: reject
 */


//===============================测试循环引用：resolve同步获取promise=========================
/* 
 * 报错=> Cannot access 'xx' before initialization
 * 在构造函数中被捕获异常，然后返回失败的promise
*/

// 如果是 var p1 = ... 不报错（变量提升）,输出=> p1 =  Promise { undefined }
// 如果是 let p1 = ... 报错=> UnhandledPromiseRejectionWarning: ReferenceError: Cannot access 'p1' before initialization

/* // const Promise = require('../../src/promise/promise-comment')

let p1 = new Promise(function (resolve, reject) {
    resolve(p1);
});

setTimeout(() => {
    console.log("p1 = ", p1)
}, 1000); */

//===============================测试循环引用：resolve异步获取promise=========================
/*
 * 表明 resolve 中也有对promise死循环的判断，返回失败的promise
 * 循环引用只能发生在异步引用的情况下(then 的回调函数中 或 定时器中)
*/

/* // const Promise = require('../../src/promise/promise-comment')

let p1 = new Promise(function (resolve, reject) {
    setTimeout(() => {
        resolve(p1);
    }, 0);
});

setTimeout(() => {
    console.log("p1 = ", p1)
}, 1000); */
