const Promise = require('../../src/promise/promise-comment');
/**
 * 下面两种方式打印日志的顺序不同，try-catch 打印异常似乎是异步执行的，而直接添加的catch回调是同步执行的
 * reject 不处理以异常方式表现，是因为 await promise表达式会，JS引擎会自动调用其 then 方法获取promise的结果（代码执行方式），而 rej 会触发执行
 * then 的 onRejected 回调，如果不处理（传递onRejected）就会执行默认的 err => throw err，从而抛出异常
 */
(async () => {
  try {
    await new Promise((res, rej) => {
      rej('my rej')
    })
  } catch (error) {
    console.log('catch error:', error)
  }
})();

new Promise((res, rej) => {
  rej('my unhandled rej')
}).catch(err => console.log('custom catch', err))

