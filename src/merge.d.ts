/**
 * Merges two values recursively with support for circular references where:
 *
 * @param target - The target into which the `source` value is merged.
 * @param source - The source value.
 * @param options - Optional options.
 *
 * @returns The result value.
 */
declare function merge<Target, Source>(
    target: Target,
    source: Source,
    options?: merge.Options,
): Target extends object ? (Source extends object ? Target & Source : Source) : Source;

declare namespace merge {
    interface Options {
        /**
         * Whether symbol keys are merged. Defaults to `true`.
         *
         * @default true
         */
        readonly symbol?: boolean;
    }
}

export = merge;
