// let p0 = new MyPromise((resolve, reject) => {
//   // setTimeout(() => {
//   //   resolve("hello");
//   // }, 1000);

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


const p1 = new MyPromise(function (resolve, reject) {
  setTimeout(() => reject(new Error('p1 rejected')), 3000);
});

const p2 = new MyPromise(function (resolve, reject) {
  setTimeout(() => {
    console.log("resolve p2");
    resolve(p1);
  }, 1000);
});

p2.then(result => console.log(result))
  .catch(error => console.log(error));
