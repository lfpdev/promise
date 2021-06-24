# Promise
根据 Promise/A+ 规范和 ES6 规范，实现一个 Promise，帮助理解 ES6 Promise 原理和事件循环。附 async 和 await 原理和实现

## 文件介绍
### src/async-await
- async-await.js 模拟实现 async await
- async-await-comment.js 详细的解释和总结
### src/promise
- promise-a-plus.js 符合 Promise/A+ 规范的写法
- promise-comment.js 详细的解释和总结
- promise-es6.js 根据测试结果实现的符合 ES6 行为的 Promise
### test/async-await
- 测试 async 和 await 的功能以及对比模拟实现的 _async 和 _await
### test/promise
- 测试 ES6 Promise 的功能，以及自己实现 Promise 过程中每个模块的测试
