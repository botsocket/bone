'use strict';

const Assert = require('./assert');
const IsObject = require('./isObject');
const SplitPath = require('./splitPath');
const Utils = require('./utils');

const internals = {};

module.exports = function (target, path) {

    Assert(IsObject(target), 'Target must be an object');

    if (path === undefined) {
        return target;
    }

    return internals.get(target, path);
};

internals.get = function (target, path) {

    const keys = SplitPath(path, { clone: true });
    while (keys.length) {
        if (!IsObject(target)) {
            return;
        }

        const key = keys.shift();

        if (Array.isArray(target) ||
            Utils.isTypedArray(target) ||
            Utils.isArguments(target)) {

            if (key === '*') {
                return internals.getAll(target, keys);
            }

            const idx = Utils.idx(key, target.length);
            if (idx === false) {
                return;
            }

            target = target[idx];
            continue;
        }

        if (target instanceof Map) {
            target = target.get(key);
            continue;
        }

        if (!Object.prototype.hasOwnProperty.call(target, key)) {
            return;
        }

        target = target[key];
    }

    return target;
};

internals.getAll = function (target, keys) {

    const results = [];
    for (let i = 0; i < target.length; i++) {
        results.push(internals.get(target[i], keys));
    }

    return results;
};
