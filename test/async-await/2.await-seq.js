/**
 * 同时有多个执行入口消费馒头，无法保证自己蒸的馒头被自己消费
 * 如何保证?
 *  1. 馒头加标记：谁蒸的
 *  2. 馒头加锁
 */

let bread = 0;

// 最终任务同步执行，两个入口都添加微任务，同时访问 bread变量，导致数据不一致
// 实际引用中，如果bread保存在数据库中，则在数据库层面解决（事务、乐观锁）
// async function setBread(who) {
//     bread += 1;
//     console.log(who, '蒸馒头', bread);

//     console.log(`${who} 蒸馒头 调用返回`)
// }

// 最终任务异步执行
async function setBread() {
    return await new Promise(res => {
        setTimeout(() => { // 宏任务
            bread += 1;
            res();
        }, 0)
    });
}

function getBread(who) {
    console.log(who, '取馒头', bread);
    bread -= 1;
}

async function reserveBread(who) {
    console.log(who, '预订馒头', bread);
    if (bread === 0) await setBread(who);
    console.log(`${who} 预定馒头 调用返回`)
}

function eat() {
    getBread('吃 ')
    console.log('做饭 吃馒头 剩余', bread);
}

function sell() {
    getBread('卖 ')
    if (bread < 0) throw Error('sell but no bread');
    console.log('赶集 卖馒头 剩余', bread);
}

async function market() { //=======
    console.log('赶集');
    await reserveBread('赶集');
    console.log('赶集 调用返回')
    sell();
}

async function cook() { //=======
    console.log('做饭');
    await reserveBread('做饭');
    console.log('做饭 调用返回')
    eat();
}

(async () => {
    await market();
    console.log('entrance 1')
})();
(async () => {
    await cook();
    console.log('entrance 2')
})();

// setBread 同步执行 ==============================
// 队列情况
/**
 * 主流程
 *  1. 执行 market 到 reserveBread 再到中的 await setBread，让出执行权，将加入队列------------------------代码 console.log('赶集 预定馒头 调用返回')
 *  2. 执行 cook 到其中的 await reserveBread，让出执行权，将加入队列--------------------------------------代码 console.log('做饭 调用返回'); eat()
 * 事件循环
 *  1. 执行 console.log('赶集 预定馒头 调用返回')，并将加入队列-------------------------------------------代码 console.log('赶集 调用返回')；sell()
 *  2. 执行 console.log('做饭 调用返回'); eat()，并将加入队列--------------------------------------------代码 console.log('entrance 2')
 *  3. 执行 console.log('赶集 调用返回'); sell()，并将加入队列-------------------------------------------代码 console.log('entrance 1')
 */

//  赶集
//  赶集 预订馒头
//  赶集 蒸馒头 1
//  赶集 蒸馒头 调用返回 EL +1
//  做饭
//  做饭 预订馒头
//  做饭 预定馒头 调用返回 EL +1
// ----------事件循环--------
// 赶集 预定馒头 调用返回 EL +1
// 做饭 调用返回
// 吃   取馒头 1
// 做饭 吃馒头 剩余 0
// 赶集 调用返回
// 卖   取馒头 0
// entrance 2
// Error: sell but no bread

// setBread异步执行 =================================

// node 10 ==========
// 赶集
// 赶集 预订馒头 0
// 做饭
// 做饭 预订馒头 0
// 赶集 预定馒头 调用返回
// 做饭 预定馒头 调用返回 // 可以看出 node10，对于 timer阶段，是全部执行完之后才执行 microtask 队列
// 赶集 调用返回
// 卖  取馒头 2
// 赶集 卖馒头 剩余 1
// 做饭 调用返回
// 吃  取馒头 1
// 做饭 吃馒头 剩余 0
// entrance 1
// entrance 2

// node 18 ===========
// 赶集
// 赶集 预订馒头 0
// 做饭
// 做饭 预订馒头 0
// 赶集 预定馒头 调用返回
// 赶集 调用返回
// 卖  取馒头 1
// 赶集 卖馒头 剩余 0
// entrance 1
// 做饭 预定馒头 调用返回 // node >10，对于 timer阶段，每个 timer 执行完毕都会先执行 microtask 队列
// 做饭 调用返回
// 吃  取馒头 1
// 做饭 吃馒头 剩余 0
// entrance 2