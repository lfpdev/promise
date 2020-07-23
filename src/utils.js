const debug = require('debug')
const path = require('path')

/*
打印所有级别  export DEBUG=DEV:*
仅打印error  export DEBUG=DEV:error:*
取消打印     unset DEBUG
*/
function debugGenerator(fileName) {
  return {
    debug: debug(`DEV:debug:${path.basename(fileName)}`),
    info: debug(`DEV:info:${path.basename(fileName)}`),
    error: debug(`DEV:error:${path.basename(fileName)}`)
  }
}

module.exports = {
  debugGenerator
}
