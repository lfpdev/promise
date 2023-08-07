/**
 * queueMicrotask 应用
 */
const EventEmitter = require('events')
const fs = require('fs')
const pathModule = require('path')

const myEmitter = new EventEmitter()

/**
 * 父级上下文有同步代码，异步调用异步函数，异步函数中同时包含同步和异步分支
 * 1. 同步分支，回调函数立即执行，会干扰父级上下文同步代码的执行
 * 2. 异步分支，回调函数异步执行，不会干扰
 * 3. 可通过 queueMicrotask 将同步分支的回调函数在父级上下文出栈后再执行
 */
async function load(key) {
    const path = pathModule.join(__dirname, 'target.txt')
    const hit = fs.existsSync(path)
    console.log('is hit', hit)
    if (hit === true) {
        // queueMicrotask(() => {
        //     myEmitter.emit('load', 'load')
        // })
        myEmitter.emit('load', 'load')
        return
    }

    await new Promise(res => {
        fs.writeFile(path, 'data', { flag: 'w' }, () => {
            res()
            myEmitter.emit('load', 'load')
        })
    })
}

myEmitter.on('load', () => console.log('loaded data'))

async function processData(key) {
    console.log('start...')
    load(key) // 异步调用
    console.log('finish...') // 父级上下文中的同步代码
}

(async () => {
    await processData('one')
})()

// 第一次执行
// start...
// is hit false
// finish...
// loaded data

// 异步触发load事件
// start...
// is hit true
// finish...
// loaded data

// 直接触发load事件
// start...
// is hit true
// loaded data // 直接触发回调执行，先于父级上下文执行
// finish...