/**
 * Retrieves a value nested inside an object, map or array given its path where:
 *
 * @param target - The target object to retrieve. Can be an object, map or array.
 * @param path - The path to the value. Can be a string of dot-separated keys or an array containing each individual key. If `undefined` is passed, the target object is returned.
 *
 * @returns The retrieved value.
 */
declare function get(target: object, path?: string | readonly string[] | undefined): unknown;

export = get;
