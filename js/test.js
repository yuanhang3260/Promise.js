// console.log("**************** Test 1 *****************");
// let p0 = new MyPromise((resolve, reject) => {
//   resolve("hello");
// });

// p0.then(result => {
//   console.log(result);
//   return "re1";
// }).then(result => {
//   console.log(result);
//   return "re2";
// }).then(result => {
//   console.log(result);
//   return "re3";
// });

// console.log("**************** Test 2 *****************");
// const p1 = new MyPromise(function (resolve, reject) {
//   setTimeout(() => reject(new Error('p1 rejected')), 3000);
// });

// const p2 = new MyPromise(function (resolve, reject) {
//   setTimeout(() => {
//     console.log("resolve p2");
//     resolve(p1);
//   }, 1000);
// });

// p2.then(result => console.log(result))
//   .catch(error => console.log(error));

console.log("**************** Test 3 *****************");
function multiply(input) {
  return new MyPromise(function(resolve, reject) {
    console.log('calculating ' + input + ' x ' + input + '...');
    setTimeout(resolve, 1000, input * input);
  });
}

function add(input) {
  return new MyPromise(function(resolve, reject) {
    console.log('calculating ' + input + ' + ' + input + '...');
    setTimeout(resolve, 1000, input + input);
  });
}

var p = new MyPromise(function(resolve, reject) {
  console.log('start new Promise...');
  resolve(12);
});

p.then(multiply)
 .then(add)
 .then(multiply)
 .then(add)
 .then(function (result) {
    console.log('Got value: ' + result);
 });
