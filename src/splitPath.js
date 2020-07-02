'use strict';

const Assert = require('./assert');

const internals = {};

module.exports = function (path, options = {}) {
    if (Array.isArray(path)) {
        return options.clone ? [...path] : path;
    }

    Assert(path && typeof path === 'string', 'Path must be a non-empty string');
    Assert(!path.includes('\u0000') && !path.includes('\u0001'), 'Path cannot contain reserved characters');

    const encoded = internals.encode(path);

    const keys = encoded.split('.');
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        Assert(key, 'Key must be a non-empty string');

        keys[i] = internals.decode(key);
    }

    return keys;
};

internals.encode = function (path) {
    return path.replace(/\\\\/g, '\u0000').replace(/\\\./g, '\u0001');
};

internals.decode = function (path) {
    return path.replace(/\u0000/g, '\\').replace(/\u0001/g, '.');
};
