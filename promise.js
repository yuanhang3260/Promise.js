(function promiseModuleDefiniation(root, factory) {
  if (typeof module === 'object' && typeof exports === 'object') {
    // CommonJS.
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    // AMD.
    define('MyPromise', [], factory);
  } else {
    // Browser.
    root['MyPromise'] = factory();
  }
}) (typeof self != 'undefined' ? self : this, function() {

  // Promise callbacks are run async. Get async run function based on platform.
  var runAsync = (function() {
    if (typeof process === 'object' && process !== null && 
        typeof(process.nextTick) === 'function'
    ) {
      return process.nextTick;
    } else if (typeof(setImmediate) === 'function') {
      return setImmediate;
    }
    return setTimeout;
  })();

  function MyPromise(func) {
    // Check function call without new.
    if (!(this instanceof arguments.callee)) {
      console.error('MyPromise is not being called with "new"');
      return;
    }

    this.state = MyPromise.states.PENDING;
    this.callbackArg = null;
    this.deferreds = [];

    // Execute user function.
    try {
      // Bind resolve and reject as arguments passed to user function.
      func(this.resolve.bind(this), this.reject.bind(this));
    } catch (err) {
      this.reject(err);
    }
  }

  MyPromise.states = {
    PENDING : 0,
    FULLFILLED : 1,
    REJECTED : 2,
  };

  MyPromise.prototype.then = function(onFullfilled, onRejected) {
    var next_promise = new MyPromise(function(){});
    var task = new Task(onFullfilled, onRejected, next_promise);
    if (this.state === MyPromise.states.PENDING) {
      this.deferreds.push(task);
    } else {
      this.scheduleResolvedCallback(task);
    }

    return next_promise;
  }

  MyPromise.prototype.catch = function(onRejected) {
    return this.then(null, onRejected);
  }

  function Task(onFullfilled, onRejected, promise) {
    this.onFullfilled =
        (typeof onFullfilled === 'function' ? onFullfilled : null);

    this.onRejected = (typeof onRejected === 'function' ? onRejected : null);

    // Cascaded next promise. Callback return value of this task will be passed
    // to next promise to resolve.
    this.promise = promise;
  }

  MyPromise.prototype.handleResolved = function(task) {
    var callback = (this.state === MyPromise.states.FULLFILLED ? 
                        task.onFullfilled : task.onRejected);

    if (callback === null) {
      if (this.state === MyPromise.states.FULLFILLED) {
        task.promise.resolve(this.callbackArg);
      } else {
        task.promise.reject(this.callbackArg);
      }
      return;
    }

    // Run the resolve/reject callback.
    try {
      var result = callback(this.callbackArg);
    } catch (err) {
      this.reject(task.next_promise, err);
    }

    // Pass result to next cascaded promise.
    task.promise.resolve([result]);
  }

  MyPromise.prototype.scheduleResolvedCallback = function(task) {
    runAsync(this.handleResolved.bind(this, task));
  }

  MyPromise.prototype.resolve = function(arg) {
    if (this.state !== MyPromise.states.PENDING) {
      return;
    }

    // If resolve argument is a MyPromise object, delegate all following
    // tasks to this promise object.
    if (arg && arg instanceof MyPromise) {
      let delegate = arg;
      if (delegate.state === MyPromise.states.PENDING) {
        Array.prototype.push.apply(delegate.deferreds, this.deferreds);
        // Equivalant ES6 syntax:
        // arg.deferreds.push(...this.deferreds);
      } else {
        for (let task of this.deferreds) {
          delegate.scheduleResolvedCallback(task);
        }
        delegate.deferreds = [];
      }
      return;
    }

    this.state = MyPromise.states.FULLFILLED;
    this.callbackArg = arg;

    for (let task of this.deferreds) {
      this.scheduleResolvedCallback(task);
    }
    this.deferreds = [];
  }

  MyPromise.prototype.reject = function(arg) {
    if (this.state !== MyPromise.states.PENDING) {
      return;
    }

    this.state = MyPromise.states.REJECTED;
    this.callbackArg = arg;

    for (let task of this.deferreds) {
      this.scheduleResolvedCallback(task);
    }

    this.deferreds = [];
  }

  return MyPromise;
});
