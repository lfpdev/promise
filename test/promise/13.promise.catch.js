new Promise((res, rej) => {
    // rej('fail')
    // rej({ isSuccess: false, message: 'fail' })
    // throw Error('my error')
}).catch(err => { // err 不一定是 Error 实例
    console.log('err = ', err);
})