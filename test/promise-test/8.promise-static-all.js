
//====================不传参数或参数不可迭代=================
/* 
 *  如果参数不存在或者不可迭代，返回一个失败的promise，值为类型错误
*/

/* // const Promise = require("../../src/promise/promise-comment")

let p = Promise.all() 
// let p = Promise.all(123) 
// let p = Promise.all(null) 

setTimeout(() => {
	console.log("p = ", p)
}, 0); */

// 各自的输出：
// p =  Promise {
// 	<rejected> TypeError: undefined is not iterable (cannot read property Symbol(Symbol.iterator))
//	...
// }

// p =  Promise {
// 	<rejected> TypeError: number 123 is not iterable (cannot read property Symbol(Symbol.iterator))
//	...
// }

// p =  Promise {
// 	<rejected> TypeError: object null is not iterable (cannot read property Symbol(Symbol.iterator))
//	...
// }


//================可迭代对象成员为空(空串、空数组)===============
/*  
 * 如果可迭代对象成员为空，返回一个成功的promise，值为空数组
*/

/* // const Promise = require("../../src/promise/promise-comment")

let p = Promise.all("")
setTimeout(() => {
	console.log("p = ", p)
}, 0); */


//=================测试all=======================
/* 
 * 所有成员promise都返回成功，则all返回一个成功的promise，值为所有成员promise返回值组成的数组（按成员顺序排序）
*/

/* const Promise = require("../../src/promise/promise-comment")

var promise1 = new Promise((resolve, reject) => {
    resolve(3);
})
var promise2 = 42;
var promise3 = new Promise(function(resolve, reject) {
  setTimeout(resolve, 100, 'foo');
});

Promise.all([promise1, promise2, promise3]).then(function(values) {
  console.log(values); 
},(err)=>{
    console.log(err)
});  */

//[3, 42, 'foo']