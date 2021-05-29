'use strict';


(async () => {
    let counter = 0;
    const increment = new Promise(resolve => {
        counter++;
        resolve();
    });
    await increment;
    await increment;
    console.log(counter); // 结果是 1
    /**
     * 分析：
     * 1. Promise构造函数会立即执行传入的「执行器函数」，counter自增1，同步调用「状态转移函数」resolve()，使promise实例的状态变为 Fulfilled。
     * 2. increment 变量指向一个promise实例对象。await 只是调用promise的`.then`方法获取promise的值，不会执行「执行器函数」。
     *    多次await对promise状态和值无影响
     */
})();
