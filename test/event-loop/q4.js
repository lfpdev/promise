/**
 * queueMicrotask vs nextTick
 */

console.log('main start')

process.nextTick(() => {
    console.log('register in main, execute nextTick')
})
queueMicrotask(() => {
    console.log('register in main, execute queueMicrotask')
})

setTimeout(() => {
    queueMicrotask(() => {
        console.log('register in timer, execute queueMicrotask 2')
    })
    process.nextTick(() => {
        console.log('register in timer, execute nextTick 2')
    })
}, 0)

queueMicrotask(() => {
    queueMicrotask(() => { // 先执行 process.nextTick 的回调，注册 queueMicrotask3
        console.log('register in microtask, execute queueMicrotask 2')
    })
    process.nextTick(() => {
        console.log('register in microtask, execute nextTick 2')
    })
})

process.nextTick(() => {
    queueMicrotask(() => {
        console.log('register in nextTick, execute queueMicrotask 3')
    })
    process.nextTick(() => {
        console.log('register in nextTick, execute nextTick 3')
    })
})

console.log('main end')

// commonjs 模块中
// main start
// main end
// register in main, execute nextTick
// register in nextTick, execute nextTick 3
// register in main, execute queueMicrotask
// register in nextTick, execute queueMicrotask 3
// register in microtask, execute queueMicrotask 2
// register in microtask, execute nextTick 2
// register in timer, execute nextTick 2
// register in timer, execute queueMicrotask 2

// esm 模块, package.json 中添加 "type": "module",
// main start
// main end
// register in main, execute queueMicrotask
// register in microtask, execute queueMicrotask 2
// register in main, execute nextTick
// register in microtask, execute nextTick 2
// register in nextTick, execute nextTick 3
// register in nextTick, execute queueMicrotask 3
// register in timer, execute nextTick 2
// register in timer, execute queueMicrotask 2