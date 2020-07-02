'use strict';

module.exports = function (value) {
    if (!value) {
        return false;
    }

    return typeof value === 'object';
};
