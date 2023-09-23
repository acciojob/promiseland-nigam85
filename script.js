// complete the js code
class CustomPromise {
  constructor(executor) {
    this.state = 'pending';
    this.value = undefined;
    this.reason = undefined;
    this.onFulfilledCallbacks = [];
    this.onRejectedCallbacks = [];
    this.onFinallyCallbacks = [];

    const resolve = (value) => {
      if (this.state === 'pending') {
        this.state = 'resolved';
        this.value = value;
        this.onFulfilledCallbacks.forEach((callback) => callback(value));
        this.onFinallyCallbacks.forEach((callback) => callback());
      }
    };

    const reject = (reason) => {
      if (this.state === 'pending') {
        this.state = 'rejected';
        this.reason = reason;
        this.onRejectedCallbacks.forEach((callback) => callback(reason));
        this.onFinallyCallbacks.forEach((callback) => callback());
      }
    };

    try {
      executor(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }

  then(onFulfilled, onRejected) {
    const newPromise = new CustomPromise((resolve, reject) => {
      const fulfilledHandler = (value) => {
        try {
          if (typeof onFulfilled === 'function') {
            const result = onFulfilled(value);
            if (result instanceof CustomPromise) {
              result.then(resolve, reject);
            } else {
              resolve(result);
            }
          } else {
            resolve(value);
          }
        } catch (error) {
          reject(error);
        }
      };

      const rejectedHandler = (reason) => {
        try {
          if (typeof onRejected === 'function') {
            const result = onRejected(reason);
            if (result instanceof CustomPromise) {
              result.then(resolve, reject);
            } else {
              resolve(result);
            }
          } else {
            reject(reason);
          }
        } catch (error) {
          reject(error);
        }
      };

      if (this.state === 'resolved') {
        fulfilledHandler(this.value);
      } else if (this.state === 'rejected') {
        rejectedHandler(this.reason);
      } else {
        this.onFulfilledCallbacks.push(fulfilledHandler);
        this.onRejectedCallbacks.push(rejectedHandler);
      }
    });

    return newPromise;
  }

  catch(onRejected) {
    return this.then(null, onRejected);
  }

  finally(onFinally) {
    return this.then(
      (value) => CustomPromise.resolve(onFinally()).then(() => value),
      (reason) =>
        CustomPromise.resolve(onFinally()).then(() => {
          throw reason;
        })
    );
  }

  static resolve(value) {
    return new CustomPromise((resolve) => resolve(value));
  }

  static reject(reason) {
    return new CustomPromise((_, reject) => reject(reason));
  }
}

// Example usage:
const promise = new CustomPromise((resolve, reject) => {
  setTimeout(() => {
    resolve('Success');
    // reject('Error');
  }, 1000);
});

promise
  .then((result) => {
    console.log('Fulfilled:', result);
    return 'New Value';
  })
  .catch((error) => {
    console.error('Rejected:', error);
  })
  .finally(() => {
    console.log('Finally executed.');
  });


window.CustomPromise = CustomPromise;
