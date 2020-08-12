/**
 * Clones a value with support for circular references where:
 *
 * @param value - The value to clone.
 * @param options - Optional options.
 *
 * @returns The cloned value.
 */
declare function clone<T>(value: T, options?: clone.Options): T;

declare namespace clone {
    interface Options {
        /**
         * Whether the value should be cloned recursively. Defaults to `false`.
         *
         * @default false
         */
        readonly shallow?: boolean;

        /**
         * Whether symbol keys should be cloned. Defaults to `true`.
         *
         * @default true
         */
        readonly symbol?: boolean;
    }
}

export = clone;
