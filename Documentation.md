# Documentation

## Introduction

Bone is a collection of utility methods used by the BotSocket ecosystem.

## Installation

Bone is available on npm:

```bash
npm install @botsocket/bone
```

## Usage

```js
const Bone = require('@botsocket/bone');

const cloned = Bone.clone([1, 2, 3]);
```

Or:

```js
const Clone = require('@botsocket/bone/src/clone');

const cloned = Clone([1, 2, 3]);
```

## API

- [`assert(condition, [message])`](#assertcondition-message)
- [`clone(value, [options])`](#clonevalue-options)
- [`equal(value, ref, [options])`](#equalvalue-ref-options)
- [`get(target, path)`](#gettarget-path)
- [`isObject(value)`](#isObjectvalue)
- [`merge(target, source, [options])`](#mergetarget-source-options)
- [`set(target, path, value)`](#settarget-path-value)
- [`splitPath(path, [options])`](#splitPathpath-options)

### `assert(condition, [message])`

Throws an error if a condition is falsy where:

-   `condition`: The condition to evaluate.
-   `message`: The error message to throw.

```js
Bone.assert(false); // Throws 'Unknown error'
Bone.assert(false, ''); // Throws 'Unknown error'
Bone.assert(false, 'x'); // Throws 'x'
Bone.assert(false, {}); // Throws '[object Object]'
Bone.assert(false, new TypeError('x')); // Throws 'TypeError: x'
Bone.assert('', 'x'); // Throws 'x'
Bone.assert(true, 'x'); // Does not throw
Bone.assert(1, 'x'); // Does not throw
```

[Back to top](#api)

### `clone(value, [options])`

Clones a value with support for circular references where:

-   `value`: The value to clone.
-   `options`: Optional options where:
    -   `shallow`: Whether the value should be cloned recursively. Defaults to `false`.
    -   `symbol`: Whether symbol keys should be cloned. Defaults to `true`.

```js
const ref = {};
const sym = Symbol('test');

class X {}

X.prototype.immutable = true; // Immutable objects

const obj = {
    a: 1,
    b: [1, 2, 3],
    c: new Map([[ref, 1]]),
    d: new X(),
    [sym]: 2,
};

const cloned = Bone.clone(obj);
obj.b === cloned.b; // false
cloned.b[1]; // 2
obj.d === cloned.d; // true
cloned.c.get(ref); // 1


const shallow = Bone.clone(obj, { shallow: true });
obj.b === shallow.b;

const noSymbol = Bone.clone(obj, { symbol: false });
noSymbol[sym]; // undefined
```

[Back to top](#api)

### `equal(value, ref, [options])`

Compares two values recursively with support for circular references where:

-   `value`: The first value.
-   `ref`: The reference value to compare to `value`.
-   `options`: Optional options where:
    -   `strict`: Whether to use strict equality (`===`). If set to `false`, `Object.is` is used. Defaults to `true`.
    -   `compareDescriptors`: Whether object descriptors are compared. Defaults to `false`.
    -   `symbol`: Whether symbol keys should be compared. Defaults to `true`.
    -   `deepFunction`: Whether functions are deeply compared using their source code and properties. Defaults to `false`.

```js
class X {
    constructor(someValue) {
        this.someValue = someValue;
    }
}

const fn = () => 1;
const sym = Symbol('x');
const obj = {
    a: 1,
    b: [1, 2, 3],
    c: new Map([['x', 'y'], [1, 'z']]),
    d: new X(1),
    e: -0,
    f: fn,
    [sym]: 1,
};

const obj2 = {
    a: 1,
    b: [1, 2, 3],
    c: new Map([[1, 'z'], ['x', 'y']]),
    d: new X(1),
    e: 0,
    f: fn,
    [sym]: 1,
};

Bone.equal(obj, obj2); // true
Bone.equal(obj, obj2, { strict: false }); // false (due to Object.is(-0, +0) returns false)

const obj3 = Bone.clone(obj2);
obj3[sym] = 2;

Bone.equal(obj, obj3); // false
Bone.equal(obj, obj3, { symbol: false }); // true

const obj4 = Bone.clone(obj2);
obj4.d = new X(2);

Bone.equal(obj, obj4); // false (due to different 'someValue's)

const obj5 = Bone.clone(obj2);
obj5.f = () => 1;

Bone.equal(obj, obj5); // false (due to different function reference)
Bone.equal(obj, obj5, { deepFunction: true }); // true

const obj6 = Bone.clone(obj);
obj6.g = 1;

const obj7 = Object.defineProperties(Bone.clone(obj), {
    g: {
        value: 1,
    },
});

Bone.equal(obj6, obj7); // true
Bone.equal(obj6, obj7, { compareDescriptors: true }); // false

```

[Back to top](#api)

### `get(target, path)`

Retrieves a value nested inside an object, map or array given its path where:

-   `target`: The target object to retrieve. Can be an object, map or array.
-   `path`: The path to the value. Can be a string of dot-separated keys or an array containing each individual key. If `undefined` is passed, the target object is returned.

For array-like objects, `undefined` will be returned if the reference key is an invalid index. The wildcard character `*` can be used to retrieve all items. To escape the separator, use `\`.

```js
const obj = {
    a: 1,
    b: [1, 2, 3],
    c: new Map([['key', 'x']]),
    d: [{ a: 1 }, { a: 2 }, { a: 3 }],
    'x.y.z': 1,
};

Bone.get(obj, 'a'); // 1
Bone.get(obj, 'b.1'); // 2
Bone.get(obj, 'b.-1'); // 3
Bone.get(obj, 'c.key'); // x
Bone.get(obj, 'x\\.y\\.z'); // 1
Bone.get(obj, 'd.*.a'); // [ 1, 2, 3 ]
```

[Back to top](#api)

### `isObject(value)`

Checks if a value is an object where:

-   `value`: The value to check.

```js
Bone.isObject('x'); // false
Bone.isObject(null); // false
Bone.isObject({}); // true
Bone.isObject(new Date()); // true
```

[Back to top](#api)

### `merge(target, source, [options])`

Merges two values recursively with support for circular references where:

-   `target`: The target into which the `source` value is merged.
-   `source`: The source value.
-   `options`: Optional options where:
    -   `symbol`: Whether symbol keys are merged. Defaults to `true`.

Note that this method mutates the target value.

```js
const sym = Symbol('x');
const obj = {
    a: 1,
    c: [{ a: 'x' }, 2],
    d: { x: 5 },
    e: new Map([[1, 'x'], [2, 'y']]),
    f: new Date(),
    g: [],
};

const obj2 = {
    b: 2,
    c: [{ b: 'y' }, 4],
    d: { x: 7 },
    e: new Map([[1, 'z']]),
    f: /x/i,
    g: undefined,
    [sym]: 'x',
};

const result = Bone.merge(obj, obj2);

Bone.equal(result, {
    a: 1,
    b: 2,
    c: [{ a: 'x', b: 'y' }, 4],
    d: { x: 7 },
    e: new Map([[1, 'z'], [2, 'y']]),
    f: /x/i,
    g: [],
    [sym]: 'x',
}); // true
```

[Back to top](#api)

### `set(target, path, value)`

Sets a value nested inside an object, map or array given its path where:

-   `target`: The target object to modify. Can be an object, map or array.
-   `path`: The path to the value. Can be a string of dot-separated keys or an array containing each individual key. If `undefined` is passed, the target object is returned unmodified.
-   `value`: The value to set to.

Note that this method mutates the target value. For array-like objects, the target will be returned if the reference key is a invalid index. To escape the separator, use `\`.

```js
Bone.set({}, 'a', 1); // { a: 1 }
Bone.set({}, 'a.b', 1); // { a: { b: 1 } }
Bone.set({}, 'a.0', 1); // { a: [ 1 ] }
Bone.set([], '0', 1); // [ 1 ]
Bone.set([1, 2], '-1', 3); // [ 1, 3 ]
Bone.set(new Map([['key', 'x']]), 'key', 'y'); // Map { key => y }
Bone.set({}, 'x\\.y\\.z', 1); // { 'x.y.z': 1 }
```

[Back to top](#api)

### `splitPath(path, [options])`

Splits a path to an array of individual keys where:

-   `path`: The path to split. Can be a string of dot-separated keys or an array containing each individual key.
-   `options`: Optional options where:
    -   `clone`: Only applies to arrays of individual keys. Whether the provided array should be cloned. Defaults to `false`.

To escape the separator, use `\`.

```js
Bone.splitPath('x.y.z'); // [ x, y, z ]
Bone.splitPath('x\\.y.z'); // [ x.y, z ]
Bone.splitPath('x\\y.z'); // [ x\y, z ]
Bone.splitPath('x\\\\.z'); // [ x\, z ]
```

[Back to top](#api)
