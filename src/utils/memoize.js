/**
 * memoize
 * Caches the results of a function when the arguments are the same.
 * Stores arguments in a tree of Maps/WeakMaps, with the cached result of the
 * function stored at the key of the last argument.
 * @example const adder = memoize((a, b, c) => a + b + c);
 * adder(1, 2, 3) memoizes to:
 *      Map {
 *          1 => Map {
 *              2 => Map {
 *                  3 => 6
 *              }
 *          }
 *      }
 * Calling adder(1, 2, 3) again will instead traverse this Map tree instead of
 * computing the function again
 */

// memoCache - top-level WeakMap storing all the memoized results
//  { function => MapTree }
const memoCache = new WeakMap();
export const memoize = (fn) => (...args) => {
    // Iterate through the function and its args to detect whether or not each
    // bit of data has been stored. If it hasn't been stored, compute it.
    // Otherwise, return the cached result.
    return [fn, ...args].reduce((result, arg, i, array) => {
        if (!result.has(arg)) {
            if (i === array.length - 1) {
                result.set(arg, fn(...args));
            } else if (typeof array[i + 1] === 'object') {
                result.set(arg, new WeakMap());
            } else {
                result.set(arg, new Map());
            }
        }
        return result.get(arg);
    }, memoCache);
};
