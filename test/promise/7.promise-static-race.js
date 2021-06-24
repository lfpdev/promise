//================不传参数或参数不可迭代================
/* 
 * 如果参数不存在或者不可迭代，返回一个失败的promise，值为类型错误
*/

/* // const Promise = require("../../src/promise/promise-comment")

let p = Promise.race() 
// let p = Promise.race(null) 
// let p = Promise.race(123) 
setTimeout(() => {
	console.log("p = ", p)
}, 0) */

// 各自的输出：
// p =  Promise {
// 	<rejected> TypeError: undefined is not iterable (cannot read property Symbol(Symbol.iterator))
//	...
// }

// p =  Promise {
// 	<rejected> TypeError: number 123 is not iterable (cannot read property Symbol(Symbol.iterator))
//	...
// }

// p =  Promise {
// 	<rejected> TypeError: object null is not iterable (cannot read property Symbol(Symbol.iterator))
//	...
// }

//================可迭代对象成员为空(空串、空数组)===============
/* 
 * 如果可迭代对象成员为空，【返回一个PENDING 状态的promise】
*/

/* const Promise = require("../../src/promise/promise-comment")

// let p = Promise.race([])
let p = Promise.race('')
setTimeout(() => {
    console.log("p = ", p) // p =  Promise { <pending> }
}, 0);
 */

//===================测试 race============================
/* 
 * 只要一个成员promise返回，则race返回相同状态的promise
*/
/* Promise.race([
    new Promise((resolve, reject) => { setTimeout(() => { resolve(100) }, 1000) }),
    // 这里的 undefined 是数组的一个元素，Promise.resolve(undefined)，立即返回成功的promise
    undefined,
    new Promise((resolve, reject) => { setTimeout(() => { reject(100) }, 100) })
]).then((data) => {
    console.log('success1 ', data); // success1  undefined
}, (err) => {
    console.log('err1 ', err);
}); */


/* Promise.race([
    new Promise((resolve, reject) => { setTimeout(() => { resolve(100) }, 1000) }),
    new Promise((resolve, reject) => { setTimeout(() => { resolve(200) }, 200) }),
    new Promise((resolve, reject) => { setTimeout(() => { reject(100) }, 100) })
]).then((data) => {
    console.log('success2 ', data);
}, (err) => {
    console.log('err2 ', err); // err2  100
}); */

//======================利用race实现“取消”promise===========================
/*
 * 珠峰姜老师的示例
*/

/* function wrap(p1) {
    let abort
    // 手动控制结束的promise，配合 Promise.race 丢弃其他promise的返回结果
    let p2 = new Promise((res, rej) => {
        abort = () => {
            rej("Fail 1")
        }
    })
    let p = Promise.race([p1, p2])
    p.abort = abort
    return p
}

let p = wrap(
    // 这个是需要超时中断的 promise
    new Promise((res, rej) => {
        setTimeout(() => {
            res("请求成功了")
        }, 3000);
    })
)

p.then((result) => { console.log("result = ", result) }, (reason) => { console.log("Fail 2", reason) })
// 这里是手动结束promise，丢弃被包装的promise的返回结果。但是promise中的操作依然继续，只是我们不要它的结果
p.abort() */


//==================================实际应用==============================
/*
 * 网上的示例
*/

/* // 定义上传文件接口函数
const uploadFile = (params) => {
    let uri = serverSrc + '/api/xxx/xxx' // 设置请求地址
    return Promise.race([
        uploadFilePromise(uri, params),
        uploadFileTimeout(10000) // 10秒超时
    ])
}
// 定义请求接口函数
function uploadFilePromise(uri, params) {
    return new Promise(function (resolve, reject) {
        axios.post(uri, params, {
            headers: { 'Content-Type': 'multipart/form-data' }, // 以formData形式上传文件
            withCredentials: true
        }).then(response => {
            if ((response.data.code !== '200' && response.data.code !== 200) && response.data.msg !== '') {
                // console.log('上传文件出错!')
                reject(response.data)
            }
            resolve(response.data.result)
        })
    })
}

// 定义超时函数
function uploadFileTimeout(ms) {
    let delayInfo = {
        timeoutMsg: '上传文件超时'
    }
    return new Promise((resolve, reject) => {
        setTimeout(function () {
            reject(delayInfo)
        }, ms)
    })
} */