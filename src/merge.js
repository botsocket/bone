'use strict';

const IsObject = require('./isObject');
const Utils = require('./utils');

const internals = {};

module.exports = internals.merge = function (target, source, options = {}, _seen = new WeakSet()) {
    if (target === source) {
        return target;
    }

    if (source === undefined) {
        return target;
    }

    if (typeof target !== typeof source) {
        return source;
    }

    if (!IsObject(target) ||
        !IsObject(source)) {

        return source;
    }

    if (Object.getPrototypeOf(target) !== Object.getPrototypeOf(source)) {
        return source;
    }

    if (Object.prototype.toString.call(target) !== '[object Object]' &&
        !Array.isArray(target) &&
        target instanceof Set === false &&
        target instanceof Map === false) {

        return source;
    }

    if (_seen.has(target) ||
        _seen.has(source)) {

        return source; // If only one is found, return the source. There's no point in continuing
    }

    _seen.add(target);
    _seen.add(source);

    if (Array.isArray(target)) {
        for (let i = 0; i < source.length; i++) {
            target[i] = internals.merge(target[i], source[i], options, _seen);
        }

        return target;
    }

    if (target instanceof Set) {
        for (const item of source) {
            target.add(item);
        }

        return target;
    }

    if (target instanceof Map) {
        for (const [key, item] of source) {
            target.set(key, internals.merge(target.get(key), item, options, _seen));
        }

        return target;
    }

    const keys = Utils.keys(source, options.symbol);
    for (const key of keys) {
        const targetDescriptor = Object.getOwnPropertyDescriptor(target, key) || {};
        const sourceDescriptor = Object.getOwnPropertyDescriptor(source, key);

        if (targetDescriptor.configurable === false) {
            continue;
        }

        if (sourceDescriptor.get ||
            sourceDescriptor.set) { // Source descriptor contains accessors, therefore no value

            Object.defineProperty(target, key, sourceDescriptor);
            continue;
        }

        sourceDescriptor.value = internals.merge(targetDescriptor.value, sourceDescriptor.value, options, _seen);
        Object.defineProperty(target, key, sourceDescriptor);
    }

    return target;
};
