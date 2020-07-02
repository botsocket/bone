/**
 * Sets a value nested inside an object, map or array given its path where:
 *
 * @param target - The target object to modify. Can be an object, map or array.
 * @param path - The path to the value. Can be a string of dot-separated keys or an array containing each individual key. If `undefined` is passed, the target object is returned unmodified.
 * @param value - The value to set to.
 *
 * @returns The modified target.
 */
declare function set(target: object, path: string | readonly string[] | undefined, value: unknown): unknown;

export = set;
