'use strict';

const IsObject = require('./isObject');
const Utils = require('./utils');

const internals = {};

module.exports = internals.equal = function (value, ref, options = {}, _seen = new WeakSet()) {

    const isEqual = options.strict !== false ? value === ref : internals.is(value, ref);
    if (isEqual) {
        return true;
    }

    if (typeof value !== typeof ref) {
        return false;
    }

    if (Number.isNaN(value) &&
        Number.isNaN(ref)) {

        return true;
    }

    const deepFunction = typeof value === 'function' && options.deepFunction;
    if (deepFunction) {
        if (value.toString() !== ref.toString()) {
            return false;
        }

        // Continue as objects
    }
    else if (!IsObject(value) ||
        !IsObject(ref)) {

        return false;
    }

    if (Object.getPrototypeOf(value) !== Object.getPrototypeOf(ref)) {
        return false;
    }

    if (value instanceof String ||
        value instanceof Number ||
        value instanceof Boolean ||
        value instanceof Date) {

        return internals.equal(value.valueOf(), ref.valueOf(), options, _seen);
    }

    if (value instanceof Error) {
        return value.name === ref.name && value.message === ref.message;
    }

    if (value instanceof RegExp) {
        return value.toString() === ref.toString();
    }

    if (value instanceof WeakMap ||
        value instanceof WeakSet ||
        value instanceof Promise) {

        return false;
    }

    if (value instanceof ArrayBuffer) {
        if (value.byteLength !== ref.byteLength) {
            return false;
        }

        return internals.equal(new Uint8Array(value), new Uint8Array(ref), options, _seen);
    }

    if (value instanceof DataView) {
        if (value.byteLength !== ref.byteLength ||
            value.byteOffset !== ref.byteOffset) {

            return false;
        }

        return internals.equal(value.buffer, ref.buffer, options, _seen);
    }

    if (Utils.isBuffer(value)) {
        return Buffer.prototype.equals.call(value, ref);
    }

    if (Utils.isTypedArray(value)) {
        return internals.compareArrayLike(value, ref, options, _seen);
    }

    if (_seen.has(value) &&
        _seen.has(ref)) {

        return true;                                                            // If previous comparison between value and ref failed, the function would of returned.
    }

    _seen.add(value);
    _seen.add(ref);

    if (Array.isArray(value) ||
        Utils.isArguments(value)) {

        return internals.compareArrayLike(value, ref, options, _seen);
    }

    if (value instanceof Set) {
        if (value.size !== ref.size) {
            return false;
        }

        ref = new Set(ref);
        for (const item of value) {
            if (ref.delete(item)) {
                continue;
            }

            let found = false;
            for (const refItem of ref) {
                if (internals.equal(item, refItem, options, _seen)) {
                    found = true;
                    ref.delete(refItem);
                    break;
                }
            }

            if (!found) {
                return false;
            }
        }

        return true;
    }

    if (value instanceof Map) {
        if (value.size !== ref.size) {
            return false;
        }

        ref = new Map(ref);
        for (const [key, item] of value) {
            if (ref.has(key)) {
                const refItem = ref.get(key);
                if (internals.equal(item, refItem, options, _seen)) {
                    ref.delete(key);
                    continue;
                }
            }

            let found = false;
            for (const [refKey, refItem] of ref) {
                if (internals.equal(key, refKey, options, _seen) &&
                    internals.equal(item, refItem, options, _seen)) {

                    found = true;
                    ref.delete(refKey);
                    break;
                }
            }

            if (!found) {
                return false;
            }
        }

        return true;
    }

    const keys = Utils.keys(value, options.symbol);
    if (keys.length !== Utils.keys(ref, options.symbol).length) {
        return false;
    }

    for (const key of keys) {
        if (deepFunction &&
            (key === 'name' || key === 'length')) {                                 // Skip function names and arities

            continue;
        }

        if (!options.compareDescriptors) {
            if (!internals.equal(value[key], ref[key], options, _seen)) {
                return false;
            }

            continue;
        }

        const valueDescriptor = Object.getOwnPropertyDescriptor(value, key);
        const refDescriptor = Object.getOwnPropertyDescriptor(ref, key);

        if (!refDescriptor) {
            return false;
        }

        if (valueDescriptor.writable !== refDescriptor.writable ||
            valueDescriptor.configurable !== refDescriptor.configurable ||
            valueDescriptor.enumerable !== refDescriptor.enumerable ||
            valueDescriptor.get !== refDescriptor.get ||
            valueDescriptor.set !== refDescriptor.set ||
            !internals.equal(valueDescriptor.value, refDescriptor.value, options, _seen)) {

            return false;
        }
    }

    return true;
};

// Copied from https://github.com/chaijs/deep-eql
internals.is = function (value, ref) {

    if (value === ref) {
        return value !== 0 || 1 / value === 1 / ref;
    }

    return false;
};

internals.compareArrayLike = function (value, ref, options, seen) {

    const length = value.length;
    if (length !== ref.length) {
        return false;
    }

    for (let i = 0; i < length; i++) {
        if (!internals.equal(value[i], ref[i], options, seen, i)) {
            return false;
        }
    }

    return true;
};
