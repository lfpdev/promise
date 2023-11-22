async function test() {
  await Promise.all(
    [1, 2, 3].map(async (ele) => {
      // 异常 promise 不会中断 Promise.all 的执行
      console.log('exec', ele)

      // forEach
      // ['a', 'b', 'c'].forEach((e) => {
      //   if (e === 'c') {
      //     // forEach 同步执行，执行完后就退出调用栈，
      //     // 而返回给其callback的 Promise.reject()是异步的，没有被处理，导致 ERR_UNHANDLED_REJECTION 异常
      //     // return Promise.reject('正在进行，请勿重复提交');
      //     // 同步的 error 会冒泡到 async 上下文中处理，返回一个 rejected promise，被Promise.all 的 catch 捕获
      //     throw Error('yeah?')
      //   }
      // });

      // for...of
      // for...of 会等待每个异步操作完成
      for (const e of [2, 3, 6]) {
        if (e === ele) {
          return Promise.reject('正在进行，请勿重复提交');
          throw Error('yeah?')
        }
      }

    })
  ).catch((error) => {
    console.log('catch you', error);
  });
}

test().then(console.log)