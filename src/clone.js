'use strict';

const IsObject = require('./isObject');
const Utils = require('./utils');

const internals = {};

module.exports = internals.clone = function (value, options = {}, _seen = new WeakSet()) {

    if (!IsObject(value)) {
        return value;
    }

    if (value instanceof String ||
        value instanceof Number) {

        return new value.constructor(value);
    }

    if (value instanceof Boolean) {
        return new Boolean(Number(value));
    }

    if (Utils.isBuffer(value)) {
        if (!options.shallow) {
            return value.slice();
        }

        const length = value.length;
        const cloned = Buffer.allocUnsafe
            ? Buffer.allocUnsafe(length)
            : /* istanbul ignore next: Environment specific */ new Buffer(length);

        value.copy(cloned);
        return cloned;
    }

    if (Utils.isTypedArray(value)) {
        const buffer = options.shallow ? value.buffer : internals.cloneArrayBuffer(value.buffer);
        return new value.constructor(buffer, value.byteOffset, value.length);
    }

    if (value instanceof RegExp) {
        const cloned = new RegExp(value.source, /\w*$/.exec(value));
        cloned.lastIndex = value.lastIndex;
        return cloned;
    }

    if (value instanceof Date) {
        return new Date(value.valueOf());
    }

    if (value instanceof ArrayBuffer) {
        return internals.cloneArrayBuffer(value);
    }

    if (value instanceof DataView) {
        const buffer = options.shallow ? value.buffer : internals.cloneArrayBuffer(value.buffer);
        return new DataView(buffer, value.byteOffset, value.byteLength);
    }

    if (value instanceof WeakMap ||
        value instanceof WeakSet) {

        return new value.constructor();
    }

    if (_seen.has(value)) {
        return value;
    }

    _seen.add(value);

    const clone = options.shallow ? (item) => item : internals.clone;

    if (Array.isArray(value) ||
        Utils.isArguments(value)) {

        const cloned = [];
        for (let i = 0; i < value.length; i++) {
            cloned.push(clone(value[i], options, _seen));
        }

        return cloned;
    }

    if (value instanceof Map) {
        const cloned = new Map();
        for (const [key, item] of value) {
            cloned.set(key, clone(item, options, _seen));
        }

        return cloned;
    }

    if (value instanceof Set) {
        const cloned = new Set();
        for (const item of value) {
            cloned.add(clone(item, options, _seen));
        }

        return cloned;
    }

    const proto = Object.getPrototypeOf(value);
    if (proto &&
        proto.immutable) {

        return value;
    }

    const cloned = Object.create(proto);
    const keys = Utils.keys(value, options.symbol);
    for (const key of keys) {
        const descriptor = Object.getOwnPropertyDescriptor(value, key);

        if (descriptor.value !== undefined) {
            descriptor.value = clone(descriptor.value, options, _seen);
        }

        Object.defineProperty(cloned, key, descriptor);
    }

    return cloned;
};

internals.cloneArrayBuffer = function (value) {

    const cloned = new ArrayBuffer(value.byteLength);
    new Uint8Array(cloned).set(new Uint8Array(value));
    return cloned;
};
