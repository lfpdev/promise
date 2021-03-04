const _async = (func) => {
  const p = new Promise((resolve, reject) => {
    try {
      const value = func()
      if (((typeof value === 'object' && value !== null) || typeof value === 'function')
        && typeof value.then === 'function') {
        Promise.resolve(value).then(resolve, reject)
      } else {
        resolve(value)
      }
    } catch (error) {
      reject(error)
    }
  })
  return p
}

const _await = (arg) => (onResolved, onRejected) => {
  const innerPromise = onRejected ? Promise.resolve(arg).catch(onRejected).then(onResolved)
    : Promise.resolve(arg).then(onResolved)
  return innerPromise
}

module.exports = {
  _async,
  _await
}
