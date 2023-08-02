var fs = require('fs');
var events = require('events');
var emitter = new events.EventEmitter();

emitter.on('someEvent', function (arg1, arg2) {
    console.log('listener');
});

function someAsyncOperation(callback) {
    // 花费2毫秒
    fs.readFile(__dirname + '/' + __filename, callback);
}

var timeoutScheduled = Date.now();
var fileReadTime = 0;

setTimeout(function () {
    var delay = Date.now() - timeoutScheduled;
    console.log('setTimeout: ' + (delay) + "ms have passed since I was scheduled");
    console.log('fileReaderTime', fileReadtime - timeoutScheduled);
}, 10);

someAsyncOperation(function () {
    fileReadtime = Date.now();
    while (Date.now() - fileReadtime < 20) {

    }

    setImmediate(function () {
        console.log('setImmediate');
    })
    emitter.emit('someEvent'); // 同步执行，先于事件循环
});