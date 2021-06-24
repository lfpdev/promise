/**
 * 同时有多个执行入口消费馒头，无法保证自己蒸的馒头被自己消费
 * 如何保证?
 *  1. 馒头加标记：谁蒸的
 *  2. 馒头加锁
 */

let bread = 0;

async function setBread(who) {
    bread += 1;
    console.log(who, '蒸馒头', bread);

    // await new Promise(res => {
    //     setTimeout(() => {
    //         bread += 1;
    //         res();
    //     }, 0)
    // });
}

async function reserveBread(who) {
    console.log(who, '预订馒头',);
    if (bread === 0) await setBread(who);
}

function getBread(who) {
    console.log(who, '取馒头', bread);
    bread -= 1;
}

async function cook() {
    console.log('做饭');
    await reserveBread('做饭');
    eat();
}

async function market() {
    console.log('赶集');
    await reserveBread('赶集');
    sell(); // 事件队列中处于eat()之前
}

function eat() {
    getBread('做饭')
    console.log('做饭 吃馒头，剩余', bread);
}

function sell() {
    getBread('赶集')
    if (bread <= 0) throw Error('sell but no bread');
    console.log('赶集 卖馒头，剩余', bread);
}

(async () => { // 入口1
    await market();
})();
(async () => { // 入口2
    await cook();
})();

