// eslint-disable-next-line no-unused-vars
const { _async, _await } = require("../../src/async-await/async-await")

//=============async 没有return返回值（变形ok）==============
/* async function f(){
    console.log("hi")
}
console.log("aaa")
console.log(f()) // 同步执行,立即返回 Promise { undefined }
console.log("bbb") */

// 输出：
// aaa
// hi
// Promise { undefined }
// bbb

/* // 变形:
console.log("aaa")
console.log(_async(function f() {
    console.log("hi")
}))
console.log("bbb") */

//===========async 返回普通值（变形ok）================
/* async function f() {
    console.log("hi")
    // return 123 // 同步执行,立即返回 Promise { 123 }
    return { then: 123 } // 同步执行,立即返回 Promise { { then: 123 } }
}
console.log("aaa")
console.log(f()) // 同步执行,立即返回 Promise { 123 }
console.log("bbb") */

// 输出：
// aaa
// hi
// Promise { 123 }
// bbb

/* // 变形:
console.log("aaa")
console.log(_async(function f() {
    console.log("hi")
    // return 123
    return { then: 123 }
}))
console.log("bbb") */

//===========async 返回thenable对象（变形ok）================
/**
 * 解析thenable对象，根据其then方法的调用情况，返回不同状态的promise
 */

/* async function f() {
    console.log("hi")
    return {
        then: function (resolve, reject) {
            // resolve("thenable success")
            reject("thenable fail")
        }
    }
}
console.log("aaa")
let p = f()
console.log(p)
console.log("bbb")
setTimeout(() => {
    console.log(p)
}, 0); */

// 输出：
// aaa
// hi
// Promise { <pending> }
// bbb
// Promise { <rejected> 'thenable fail' }

/* // 变形:
console.log("aaa")
let p = _async(function f() {
    console.log("hi")
    return {
        then: function (resolve, reject) {
            // resolve("thenable success")
            reject("thenable fail")
        }
    }
})
console.log(p)
console.log("bbb")
setTimeout(() => {
    console.log(p)
}, 0); */

//================async 返回 promise（变形ok）==================

/* let p1

async function f() {
    console.log("1")
    // await 异步获取返回值
    await new Promise((res, rej) => {
        console.log("2")
        res("1 success")
        console.log("3")
    })
    console.log("4")
    p1 = new Promise(res => { res(100) })
    return p1
}

console.log("a")
let p = f()
console.log(p)
console.log("b")
setTimeout(() => {
    console.log(p)
}, 0);
setTimeout(() => {
    console.log("p === p1 ?", p === p1) // false 说明async内部不是用的 Promise.resolve 静态方法，而是new Promise
    let p2 = Promise.resolve(p1)
    console.log("p2 === p1 ?", p2 === p1)
}, 0); */

// 输出：
// a
// 1
// 2
// 3
// Promise { <pending> }
// b
// 4
// Promise { 100 }
// p === p1 ? false
// p2 === p1 ? true

/* // 变形
let p1

console.log("a")
let p = _async(function f() {
    console.log("1")
    return _await(new Promise((res, rej) => {
        console.log("2")
        res("1 success")
        console.log("3")
    }))(() => {
        console.log("4")
        p1 = new Promise(res => { res(100) })
        return p1
    })
})
console.log(p)
console.log("b")
setTimeout(() => {
    console.log(p)
}, 0);
setTimeout(() => {
    console.log("p === p1 ?", p === p1) // false 说明async内部不是用的 Promise.resolve 静态方法，而是new Promise
    let p2 = Promise.resolve(p1)
    console.log("p2 === p1 ?", p2 === p1)
}, 0); */


//==============await返回promise失败。async的失败原因（变形ok）==================
/**
 * await promise失败的原因就是async失败原因
 */

/* async function f() {
    console.log("1")
    // await 异步获取返回值
    await new Promise((res, rej) => {
        console.log("2")
        rej("1 error")
        console.log("3")
    })
    console.log("4")
    await new Promise((res, rej) => {
        rej("2 error")
    })
}

console.log("a")
let p = f()
console.log(p)
console.log("script end")
setTimeout(() => {
    console.log(p)
}, 0); */

// 输出：
// a
// 1
// 2
// 3
// Promise { <pending> }
// script end
// Promise { <rejected> '1 error' }

/* // 变形
console.log("a")
let p = _async(function f() {
    console.log("1")
    // await 异步获取返回值
    return _await(new Promise((res, rej) => {
        console.log("2")
        rej("1 error")
        console.log("3")
    }))(() => {
        console.log("4")
        _await(new Promise((res, rej) => {
            rej("2 error")
        }))() 
    })
})
console.log(p)
console.log("script end")
setTimeout(() => {
    console.log(p)
}, 0);
 */

//==============async函数体中await之前抛异常 （变形ok）==================

/**
 * 函数体中await之前抛出异常，立即返回失败的promise，值为失败原因，异常不会抛到函数体外面影响外面代码的执行
 */

/* async function f() {
    console.log("1")
    throw Error("async error")
    // await 异步获取返回值
    // await new Promise((res, rej) => {
    //     console.log("2")
    //     rej("1 error")
    //     console.log("3")
    // })
    // console.log("4")
}

console.log("a")
let p = f()
console.log(p)
console.log("script end")
setTimeout(() => {
    console.log(p)
}, 0);  */


// 输出：
// a
// 1
// Promise {
//   <rejected> Error: async error
//       ...
// }
// script end
// (node:22416) UnhandledPromiseRejectionWarning: Error: async error
// Promise {
//   <rejected> Error: async error
//       ...
// }

/* // 变形
console.log("a")
let p = _async(function f() {
    console.log("1")
    throw Error("async error")
    // return _await(new Promise((res, rej) => {
    //     console.log("2")
    //     rej("1 error")
    //     console.log("3")
    // }))(() => {
    //     console.log("4")
    // })
})
console.log(p)
console.log("script end")
setTimeout(() => {
    console.log(p)
}, 0); */


//==============async函数体中await之后抛异常 （变形ok）==================
/**
 * rej 之后异常，不影响async 返回promise已经失败的状态
 * res 之后异常，async 返回失败的promise
 */

/* async function f() {
    console.log("1")
    // await 异步获取返回值
    await new Promise((res, rej) => {
        console.log("2")
        // rej("1 error") // rej 之后异常，不影响async 返回promise已经失败的状态
        res("1 error")    // res 之后异常，async 返回失败的promise
        console.log("3")
    })
    console.log("4")
    throw Error("async error")
    // console.log("5")
}

console.log("a")
let p = f()
console.log(p)
console.log("script end")
setTimeout(() => {
    console.log(p)
}, 0);  */


// 输出：
// a
// 1
// 2
// 3
// Promise { <pending> }
// script end
// 4
// (node:7855) UnhandledPromiseRejectionWarning: Error: async error
// Promise {
//   <rejected> Error: async error
//       ...
// }


/* // 变形
console.log("a")
let p = _async(function f() {
    console.log("1")
    // await 异步获取返回值
    return _await(new Promise((res, rej) => {
        console.log("2")
        // rej("1 error")
        res("1 error")
        console.log("3")
    }))(() => {
        console.log("4")
        throw Error("async error")
        // console.log("5")
    })
})
console.log(p)
console.log("script end")
setTimeout(() => {
    console.log(p)
}, 0); */


//==============async函数体中 await抛异常（类似返回失败的promise）（变形ok）==================
/**
 * await返回一个失败的promise，值为异常原因。await后面的代码【不再继续执行】
 * async返回一个失败的promise，值为异常原因
 */

/* async function f() {
    console.log("1")
    // await 异步获取返回值
    await new Promise((res, rej) => {
        console.log("2")
        // throw Error("async error")
        rej("async error") // 跟 throw Error 效果相同
        console.log("3")
    })
    await new Promise((res, rej) => {
        console.log("4")
        rej("2 error")
    })
    console.log("5")
}

console.log("a")
let p = f()
console.log(p)
console.log("script end")
setTimeout(() => {
    console.log(p)
}, 0); */


// 输出：
// a
// 1
// 2
// Promise { <pending> }
// script end
// Promise {
//   <rejected> Error: async error
//     ...
// }


/* // 变形
console.log("a")
let p = _async(function f() {
    console.log("1")
    // await 异步获取返回值
    return _await(new Promise((res, rej) => {
        console.log("2")
        // throw Error("async error")
        rej("1 error")
        console.log("3")
    }))(() => {
        return _await(new Promise((res, rej) => {
            console.log("4")
            rej("2 error")
        }))(() => {
            console.log("5")

        })
    })
})
console.log(p)
console.log("script end")
setTimeout(() => {
    console.log(p)
}, 0); */


//======================await 表达式.catch()（变形ok）====================
/**
 * await 后面promise自带catch方法，则失败或抛异常会被自己的catch捕获，不影响async函数体中后面代码的执行
 */

/* async function f() {
    console.log("1")
    // await 异步获取返回值
    const r = await new Promise((res, rej) => {
        console.log("2")
        rej("1 error")
        console.log("3")
    }).catch(err => {
        console.log('i catch you', err)
        return 123  // catch 捕获异常，await不抛出，await表达式的值由catch的返回值决定
    })
    await new Promise((res, rej) => {
        console.log("4",r)
        rej("2 error")
    })
    console.log("res = ", r)
}

console.log("a")
let p = f()
console.log(p)
console.log("b")
setTimeout(() => {
    console.log(p)
}, 0); */

// 输出
// a
// 1
// 2
// 3
// Promise { <pending> }
// b
// i catch you 1 error
// 4 123
// Promise { <rejected> '2 error' }

/* // 变形
console.log("a")
let p = _async(function f() {
    console.log("1")
    return _await(new Promise((res, rej) => {
        console.log("2")
        rej("1 error")
        console.log("3")
    }))((r) => {
        return _await(new Promise((res, rej) => {
            console.log("4", r)
            rej("2 error")
        }))(() => {
            console.log("res = ", r)
        })
        // catch 回调作为 onRejected 传入
    }, (err) => {
        console.log('i catch you', err)
        return 123  
    })
})
console.log(p)
console.log("b")
setTimeout(() => {
    console.log(p)
}, 0); */


//=======================测试await 基本类型值（变形ok）===================

/* async function f() {
    console.log('111')
    const res = await 222
    console.log(res)
}
console.log("aaa")
console.log(f())
console.log("bbb") */

// 输出：
// aaa
// 111
// Promise { <pending> }
// bbb
// 222

/* // 变形
console.log("aaa")
console.log(_async(function f() {
    console.log('111')
    return _await(222)((res) => {
        console.log(res)
    })
}))
console.log("bbb") */


//=======================测试await 普通函数调用（变形ok）===================

// function a() {
//     console.log("AAA")
//     return "ok"
// }

/* 
async function f() {
    console.log('111')
    const res = await a()
    console.log(res)
}

console.log("aaa")
console.log(f())
console.log("bbb") */

// 输出：
// aaa
// 111
// AAA
// Promise { <pending> }
// bbb
// ok

/* // 变形
console.log("aaa")
console.log(_async(function f() {
    console.log('111')
    return _await(a())((res) => {
        console.log(res)
    })
}))
console.log("bbb") */