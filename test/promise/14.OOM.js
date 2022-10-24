/**
 * promise.all 大量并发promise一瞬间会占用较多内存，导致OOM
 * 参考：
 *  https://juejin.cn/post/6979880283667431454
 */

(async function () {
  const a = new Array(10).fill(0)
  for (let i = 0; i < 1e8; i++) {
    await Promise.all(a.map(() => Promise.resolve()))
    if (i % 1e5 === 0) {
      console.log(Math.round(process.memoryUsage().heapUsed / 1024 / 1024), 'MB')
    }
  }
});



let used = process.memoryUsage().heapUsed / 1024 / 1024;
console.log(`程序启动时占用内存: ${Math.round(used * 100) / 100} MB`);

global.gc();
used = process.memoryUsage().heapUsed / 1024 / 1024;
console.log(`启动GC后占用内存: ${Math.round(used * 100) / 100} MB`);

let rand = Math.random();
let N = 0;
for (let i = 0; i < 1000000; ++i) {
  new Promise(rs => {
    setTimeout(() => {
      ++N;
      let o = {
        "timezone": "Asia/Shanghai",
        "balance": 0,
        "plan": "basic",
        "numberOfStaff": 4,
        "paymentDuration": null,
        "lastPaymentDate": null,
        "nextPlan": null,
        "nextStaff": null,
        "nextPaymentDuration": null,
        "trying": null,
        "trystatus": 0,
      }
      if (rand === 999) {  // 构造一个不可能的条件
        rs(o);   // 永远执行不到此处，仅为了引用一下rs()
      }
    }, 10)   // 10毫秒后即执行，确保这里的回调肯定执行完成
  }).then(() => {
    console.log('never resolved')
  })
};

setTimeout(() => {
  console.log(N);
  used = process.memoryUsage().heapUsed / 1024 / 1024;
  console.log(`Promise创建后占用内存: ${Math.round(used * 100) / 100} MB`);

  global.gc();
  used = process.memoryUsage().heapUsed / 1024 / 1024;
  console.log(`GC后占用内存 ${Math.round(used * 100) / 100} MB`);
}, 10000);  // 上面的回调等待10毫秒，这里等待10秒，确保到这里回调肯定执行完成

// node --expose-gc "/home/lfp/dev/promise/test/promise/14.OOM.js"