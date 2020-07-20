/* 
 * finally参数函数没有参数，无法拿到前面promise的值 
*/

// const Promise = require("../../src/promise/promise-comment")

/* Promise.reject('error').finally((v) => {
    console.log("finally", v)   // finally undefined
    // return new Promise((res, rej) => {
    //     setTimeout(() => {
    //         // res("ok")
    //         rej("fail")
    //     }, 1000);
    // })
    return 123
}).then(result => {
    console.log("result = ", result)
}).catch(err => {
    console.log("err = ", err)
})
 */


/* 
 * callback报错，finally返回失败的promise，取代前面promise的值
*/

// const Promise = require("../../src/promise/promise-comment")

/* Promise.resolve('success').finally(() => {
    console.log("finally")   
    throw Error("finally error!")
    return new Promise((res, rej) => {
        setTimeout(() => {
            // res("ok")
            // rej("fail")
        }, 1000);
    })
    // return 123
}).then(result => {
    console.log("result = ", result)
}).catch(err => {
    console.log("err = ", err)
}) */