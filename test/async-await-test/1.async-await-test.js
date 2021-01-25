// eslint-disable-next-line no-unused-vars
const { _async, _await } = require("../../src/async-await/async-await")
// const { _async, _await } = require("../../src/async-await/async-await-comment")

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

// 变形
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


//=======================测试内部不加await,外部加await===================
async function inner() {
    return new Promise(res => {
        setTimeout(() => {
            res('inner success');
            console.log('inner success');
        }, 1000)
    })
}

async function outer() {
    console.log('start');
    /**
     * 如果函数逻辑对内部promise的返回结果不感兴趣，可以不用加await，但如果未将其作为promise返回，则外部即使加await也无法等待内部的promise结束
     * 因此如果
     *  1.当前函数对promise结果不感兴趣
     *  2.也不需要有意义的返回值
     *  3.但是【外部逻辑需要当前函数所有操作都结束】
     * 那么即使不感兴趣，也需要加await
     */
    const res = inner();
    console.log('outer res = ', res);
    console.log('end');
    /**
     * 如果没有显式指定返回值，则默认返回undefined，此时所在的promise立即onFullFilled，值为undefined
     * 如果显式返回promise，则此时所在的promise，返回pending状态
     */
    // return res; 
}

(async () => {
    console.log('aaa');
    const res = outer();
    /**
     * await outer()
     * 1. outer没有await自己内部的 inner promise，也没有将其作为值返回，则外面await也无法等待outer内部的inner promise结束
     * 
     * outer()
     * 1. outer未显式返回，默认返回undefined，则res=Promise { undefined }
     *    此时虽然promise已经 fullfilled，但是无法直接获取其值
     * 2. outer显式返回promise，则res=Promise { <pending> }
     *    promise尚未 fullfilled
     */
    console.log('res = ', res);
    console.log('bbb');
})()

// aaa
// start
// outer res =  Promise { <pending> }
// end
// res =  undefined
// bbb
// inner success // outer内部没有await自己的promise，外面也无法等待其结束