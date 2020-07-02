'use strict';

module.exports = function (condition, message) {
    if (condition) {
        return;
    }

    if (message instanceof Error) {
        throw message;
    }

    throw new Error(message || 'Unknown error');
};
