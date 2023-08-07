async function async1() {
    console.log('async1 start')//2
    await async2() // await 中同步调用then，但是执行then的onResolved回调是异步的
    console.log('async1 end')//6
}
async function async2() {
    console.log('async2')//3
}

console.log('script start')//1

setTimeout(() => {
    console.log('setTimeout')//8
}, 0)

async1(); //1

new Promise(resolve => {
    console.log('promise1')//4
    resolve();
}).then(() => {
    console.log('promise2')//7
})

console.log('script end')//5

// node 8 跟 node 12 18 如下
// script start
// async1 start
// async2
// promise1
// script end
// **async1 end**
// **promise2**
// setTimeout

// node 10 如下
// script start
// async1 start
// async2
// promise1
// script end
// **promise2**
// **async1 end**
// setTimeout

// 最关键那两个async1 end 和 promise2 先后跟版本，环境有关系