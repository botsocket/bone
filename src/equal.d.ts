/**
 * Compares two values recursively with support for circular references where:
 *
 * @param value - The first value.
 * @param ref - The reference value to compare to `value`.
 * @param options - Optional options.
 *
 * @returns Whether the two values are equal.
 */
declare function equal(value: unknown, ref: unknown, options?: equal.Options): boolean;

declare namespace equal {
    interface Options {
        /**
         * Whether object descriptors are compared. Defaults to `false`.
         *
         * @default false
         */
        readonly compareDescriptors?: boolean;

        /**
         * Whether to use strict equality (`===`). If set to `false`, `Object.is` is used. Defaults to `true`.
         *
         * @default true
         */
        readonly strict?: boolean;

        /**
         * Whether symbol keys should be compared. Defaults to `true`.
         *
         * @default true
         */
        readonly symbol?: boolean;

        /**
         * Whether functions are deeply compared using their source code and properties. Defaults to `false`.
         *
         * @default false
         */
        readonly deepFunction?: boolean;
    }
}

export = equal;
