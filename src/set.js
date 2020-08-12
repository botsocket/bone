'use strict';

const Assert = require('./assert');
const IsObject = require('./isObject');
const SplitPath = require('./splitPath');
const Utils = require('./utils');

const internals = {};

module.exports = function (target, path, value) {

    Assert(IsObject(target), 'Target must be an object');

    if (path === undefined) {
        return target;
    }

    let newTarget = target;
    const keys = SplitPath(path);
    const lastIdx = keys.length - 1;
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const nextKey = keys[i + 1];
        const notLast = i !== lastIdx;
        let newValue = value;

        if (Array.isArray(newTarget) ||
            Utils.isTypedArray(newTarget) ||
            Utils.isArguments(newTarget)) {

            const idx = Utils.idx(key, newTarget.length);
            if (idx === false) {
                return target;
            }

            if (notLast) {
                const currValue = newTarget[idx];
                newValue = !IsObject(currValue) ? internals.next(nextKey) : currValue;
            }

            newTarget[idx] = newValue;
            newTarget = newValue;
            continue;
        }

        if (newTarget instanceof Map) {
            if (notLast) {
                const currValue = newTarget.get(key);
                newValue = !IsObject(currValue) ? internals.next(nextKey) : currValue;
            }

            newTarget.set(key, newValue);
            newTarget = newValue;
            continue;
        }

        if (!Object.prototype.hasOwnProperty.call(newTarget, key) &&
            key in newTarget) {

            return target;
        }

        if (notLast) {
            const currValue = newTarget[key];
            newValue = !IsObject(currValue) ? internals.next(nextKey) : currValue;
        }

        newTarget[key] = newValue;
        newTarget = newValue;
    }

    return target;
};

internals.next = function (key) {

    const idx = Utils.idx(key, 0);
    if (idx === false) {
        return {};
    }

    return [];
};
