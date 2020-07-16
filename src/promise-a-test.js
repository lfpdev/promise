const PENDING = 'PENDING'
const REJECTED = 'REJECTED'
const RESOLVED = 'RESOLVED'

const resolvePromise = (promise2, x, resolve, reject) => {
    if (promise2 === x) {
        // ES6 规范写法 无法通过Promise/A+测试
        // return reject('[TypeError: Chaining cycle detected for promise #<Promise>]')
        // Promise/A+ 规范写法
        return reject(new TypeError('Chaining cycle detected for promise #<Promise>'))
    }

    let called

    if ((typeof x === 'object' && x !== null) || typeof x === 'function') {
        try {
            const then = x.then
            if (typeof then === 'function') {
                then.call(x, y => {
                    if (called) return
                    called = true
                    resolvePromise(promise2, y, resolve, reject)
                }, e => {
                    if (called) return
                    called = true
                    reject(e)
                })
            } else {
                resolve(x)
            }
        } catch (error) {
            if (called) return
            called = true
            reject(error)
        }
    } else {
        resolve(x)
    }
}

class Promise {

    constructor(executor) {
        if (typeof executor !== 'function') {
            throw new TypeError(`Promise resolver ${executor} is not a function`)
        }

        this.status = PENDING
        this.value = undefined

        this.onResolvedCallbackArr = []
        this.onRejectedCallbackArr = []

        const resolve = (value) => {
            // resolve中使用模板字符串，无法通过Promise/A+测试
            // console.log(`${value}`)
            if (value === this) {
                return reject(new TypeError('Chaining cycle detected for promise #<Promise>'))
            }

            if (value instanceof Promise) {
                return value.then(resolve, reject)
            }

            // resolve解析theable对象是ES6的功能，无法通过Promise/A+测试
            // if (((typeof value === 'object' && value !== null) || typeof value === 'function') &&
            //     typeof value.then === 'function') {
            //     return process.nextTick(() => {
            //         try {
            //             value.then(resolve, reject)
            //         } catch (error) {
            //             reject(error)
            //         }
            //     })
            // }

            if (this.status === PENDING) {
                this.value = value
                this.status = RESOLVED
                this.onResolvedCallbackArr.forEach(cb => cb())
            }
        }

        const reject = (reason) => {
            if (this.status === PENDING) {
                this.value = reason
                this.status = REJECTED
                this.onRejectedCallbackArr.forEach(cb => cb())
            }
        }

        try {
            executor(resolve, reject)
        } catch (error) {
            reject(error)
        }
    }

    then(onResolved, onRejected) {
        onResolved = typeof onResolved === 'function' ? onResolved : value => value
        onRejected = typeof onRejected === 'function' ? onRejected : error => { throw error }

        const promise2 = new Promise((resolve, reject) => {
            if (this.status === RESOLVED) {
                setTimeout(() => {
                    try {
                        const x = onResolved(this.value)
                        resolvePromise(promise2, x, resolve, reject)
                    } catch (error) {
                        reject(error)
                    }
                }, 0)
            }

            if (this.status === REJECTED) {
                setTimeout(() => {
                    try {
                        const x = onRejected(this.value)
                        resolvePromise(promise2, x, resolve, reject)
                    } catch (error) {
                        reject(error)
                    }
                }, 0)
            }

            if (this.status === PENDING) {
                this.onResolvedCallbackArr.push(() => {
                    setTimeout(() => {
                        try {
                            const x = onResolved(this.value)
                            resolvePromise(promise2, x, resolve, reject)
                        } catch (error) {
                            reject(error)
                        }
                    }, 0)
                })
                this.onRejectedCallbackArr.push(() => {
                    setTimeout(() => {
                        try {
                            const x = onRejected(this.value)
                            resolvePromise(promise2, x, resolve, reject)
                        } catch (error) {
                            reject(error)
                        }
                    }, 0)
                })
            }
        })
        return promise2
    }

    //==============以下非 Promise/A+ 规范中的内容==================
    catch(onRejected) {
        return this.then(null, onRejected)
    }

    finally(callback) {
        return this.then(value => {
            return Promise.resolve(callback()).then(() => value)
        }, error => {
            return Promise.resolve(callback()).then(() => { throw error })
        })
    }

    static resolve(value) {
        if (value instanceof Promise) return value

        return new Promise((resolve, reject) => {
            if (((typeof value === 'object' && value !== null) || typeof value === 'function') &&
                typeof value.then === 'function') {

                process.nextTick(() => {
                    try {
                        value.then(resolve, reject)
                    } catch (error) {
                        reject(error)
                    }
                })
            } else {
                resolve(value)
            }
        })
    }

    static reject(reason) {
        return new Promise((resolve, reject) => {
            reject(reason)
        })
    }

    static all(promises) {
        return new Promise((resolve, reject) => {

            if (promises == undefined || !promises[Symbol.iterator]) {
                const preReason = promises === undefined ? `${promises}` : `${typeof promises} ${promises}`
                return reject(new TypeError(`${preReason} is not iterable (cannot read property Symbol(Symbol.iterator))`))
            }

            if (promises.length === 0) return resolve([])

            let index = 0
            const resultArr = []

            const processValue = (i, value) => {
                resultArr[i] = value
                if (++index === promises.length) {
                    return resolve(resultArr)
                }
            }
            for (let i = 0; i < promises.length; i++) {
                Promise.resolve(promises[i]).then(value => {
                    processValue(i, value)
                }, error => {
                    return reject(error)
                })
            }
        })
    }

    static race(promises) {
        return new Promise((resolve, reject) => {

            if (promises == undefined || !promises[Symbol.iterator]) {
                const preReason = promises === undefined ? `${promises}` : `${typeof promises} ${promises}`
                return reject(new TypeError(`${preReason} is not iterable (cannot read property Symbol(Symbol.iterator))`))
            }

            if (promises.length === 0) return

            for (let i = 0; i < promises.length; i++) {
                Promise.resolve(promises[i]).then(value => {
                    return resolve(value)
                }, error => {
                    return reject(error)
                })
            }
        })
    }
}

Promise.defer = Promise.deferred = function () {
    const dfd = {}
    dfd.promise = new Promise((resolve, reject) => {
        dfd.resolve = resolve
        dfd.reject = reject
    })
    return dfd
}

module.exports = Promise