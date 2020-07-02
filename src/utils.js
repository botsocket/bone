'use strict';

exports.isArguments = function (value) {
    return Object.prototype.toString.call(value) === '[object Arguments]';
};

exports.isBuffer = function (value) {
    return typeof Buffer !== 'undefined' && Buffer.isBuffer(value);
};

exports.isTypedArray = function (value) {
    return (
        value instanceof Uint8Array ||
        value instanceof Uint8ClampedArray ||
        value instanceof Uint16Array ||
        value instanceof Uint32Array ||
        value instanceof Int8Array ||
        value instanceof Int16Array ||
        value instanceof Int32Array ||
        value instanceof Float32Array ||
        value instanceof Float64Array
    );
};

exports.keys = function (value, symbol = true) {
    return symbol ? Reflect.ownKeys(value) : Object.getOwnPropertyNames(value);
};

exports.idx = function (key, length) {
    let idx = Number(key);
    if (!Number.isInteger(idx)) {
        return false;
    }

    idx = idx < 0 ? (idx += length) : idx;
    if (idx < 0) {
        return false;
    }

    return idx;
};
