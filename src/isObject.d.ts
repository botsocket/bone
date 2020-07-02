/**
 * Checks if a value is an object where:
 *
 * @param value - The value to check.
 *
 * @returns Whether the value is an object.
 */
declare function isObject(value: unknown): value is object;

export = isObject;
