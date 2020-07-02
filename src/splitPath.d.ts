/**
 * Splits a path to an array of individual keys where:
 *
 * @param path - The path to split. Can be a string of dot-separated keys or an array containing each individual key.
 * @param options - Optional options.
 *
 * @returns An array of individual keys.
 */
declare function splitPath(path: string | readonly string[], options?: splitPath.Options): string[];

declare namespace splitPath {
    interface Options {
        /**
         * Only applies to arrays of individual keys. Whether the provided array should be cloned. Defaults to `false`.
         *
         * @default false
         */
        clone?: boolean;
    }
}

export = splitPath;
