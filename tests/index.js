'use strict';

const Dust = require('../src');

const internals = {
    typedArrays: [Uint8Array, Uint8ClampedArray, Uint16Array, Uint32Array, Int8Array, Int16Array, Int32Array, Float32Array, Float64Array],
};

describe('assert()', () => {
    it('should throw unknown error', () => {
        expect(() => Dust.assert(false)).toThrow('Unknown error');
        expect(() => Dust.assert(false, '')).toThrow('Unknown error');
    });

    it('should throw messages', () => {
        expect(() => Dust.assert(false, 'x')).toThrow('x');
        expect(() => Dust.assert(false, {})).toThrow('[object Object]');
    });

    it('should throw messages as errors', () => {
        const error = new TypeError('x');
        expect(() => Dust.assert(false, error)).toThrow(error);
    });

    it('should throw on any falsy values', () => {
        expect(() => Dust.assert(0, 'x')).toThrow('x');
        expect(() => Dust.assert(undefined, 'x')).toThrow('x');
        expect(() => Dust.assert(null, 'x')).toThrow('x');
        expect(() => Dust.assert(NaN, 'x')).toThrow('x');
        expect(() => Dust.assert('', 'x')).toThrow('x');
    });

    it('should do nothing on truthy values', () => {
        expect(Dust.assert(true, 'x')).toBe(undefined);
        expect(Dust.assert(1, 'x')).toBe(undefined);
        expect(Dust.assert('x', 'x')).toBe(undefined);
    });
});

describe('clone()', () => {
    it('should clone simple types', () => {
        expect(Dust.clone('x')).toBe('x');
        expect(Dust.clone(1)).toBe(1);
        expect(Dust.clone(true)).toBe(true);
        expect(Dust.clone(undefined)).toBe(undefined);
        expect(Dust.clone(null)).toBe(null);
    });

    it('should clone functions', () => {
        const fn = () => { };
        expect(Dust.clone(fn)).toBe(fn);
    });

    it('should clone symbols', () => {
        const sym = Symbol('x');
        expect(Dust.clone(sym)).toBe(sym);
    });

    it('should clone string, number and boolean objects', () => {
        const objs = [new String('x'), new Number(1), new Boolean(false)];
        for (const obj of objs) {
            const cloned = Dust.clone(obj);

            expect(obj).not.toBe(cloned);
            expect(Dust.equal(obj, cloned)).toBe(true);
        }
    });

    it('should clone regexes', () => {
        const rx = /x/i;
        const cloned = Dust.clone(rx);

        expect(rx).not.toBe(cloned);
        expect(Dust.equal(rx, cloned)).toBe(true);
    });

    it('should clone dates', () => {
        const date = new Date(0);
        const cloned = Dust.clone(date);

        expect(date).not.toBe(cloned);
        expect(Dust.equal(date, cloned)).toBe(true);
    });

    it('should clone arraybuffers', () => {
        const buff = new ArrayBuffer(3);
        const cloned = Dust.clone(buff);

        expect(buff).not.toBe(cloned);
        expect(Dust.equal(buff, cloned)).toBe(true);
    });

    it('should clone arrays', () => {
        const arr = [{ a: 'x' }];
        for (const shallow of [true, false]) {
            const cloned = Dust.clone(arr, { shallow });

            expect(arr).not.toBe(cloned);
            expect(Dust.equal(arr, cloned)).toBe(true);
            expect(cloned[0] === arr[0]).toBe(shallow);
        }
    });

    it('should clone holey arrays', () => {
        const arr = new Array(3);
        arr[1] = 'x';

        const cloned = Dust.clone(arr);
        expect(Dust.equal(arr, cloned)).toBe(true);
    });

    it('should clone buffers', () => {
        for (const shallow of [true, false]) {
            const buff = Buffer.from([1, 2, 3]);
            const cloned = Dust.clone(buff, { shallow });

            expect(buff).not.toBe(cloned);
            expect(Dust.equal(buff, cloned)).toBe(true);

            buff[0] = 2;
            expect(cloned[0]).toBe(shallow ? 1 : 2);
        }
    });

    it('should clone dataviews', () => {
        const view = new DataView(new ArrayBuffer(8), 2, 1);
        for (const shallow of [true, false]) {
            const cloned = Dust.clone(view, { shallow });

            expect(view).not.toBe(cloned);
            expect(Dust.equal(view, cloned)).toBe(true);
            expect(view.buffer === cloned.buffer).toBe(shallow);
        }
    });

    it('should clone typed arrays', () => {
        const buff = new ArrayBuffer(8);
        for (const ctor of internals.typedArrays) {
            for (const shallow of [true, false]) {
                const view = new ctor(buff);
                const cloned = Dust.clone(view, { shallow });

                expect(view).not.toBe(cloned);
                expect(Dust.equal(view, cloned)).toBe(true);
                expect(view.buffer === cloned.buffer).toBe(shallow);
            }
        }
    });

    it('should clone sets', () => {
        const set = new Set([{}]);
        for (const shallow of [true, false]) {
            const cloned = Dust.clone(set, { shallow });

            expect(set).not.toBe(cloned);
            expect(Dust.equal(set, cloned)).toBe(true);
            expect([...set][0] === [...cloned][0]).toBe(shallow);
        }
    });

    it('should clone maps', () => {
        const map = new Map([['x', {}]]);
        for (const shallow of [true, false]) {
            const cloned = Dust.clone(map, { shallow });

            expect(map).not.toBe(cloned);
            expect(Dust.equal(map, cloned)).toBe(true);
            expect(map.get('x') === cloned.get('x')).toBe(shallow);
        }
    });

    it('should clone weakmaps and weaksets', () => {
        for (const ctor of [WeakMap, WeakSet]) {
            const input = new ctor();
            const cloned = Dust.clone(input);

            expect(input).not.toBe(cloned);
            expect(cloned.constructor).toBe(ctor);
        }
    });

    it('should clone arguments objects', () => {
        const fn = function () {
            for (const shallow of [true, false]) {
                const cloned = Dust.clone(arguments, { shallow });

                expect(cloned).not.toBe(arguments);
                expect(Dust.equal(cloned, [1, 2, {}])).toBe(true);
                expect(cloned[2] === arguments[2]).toBe(shallow);
            }
        };

        fn(1, 2, {});
    });

    it('should clone objects', () => {
        const sym = Symbol('x');
        const obj = {
            a: 'x',
            b: [1, 2],
            [sym]: 1,
        };

        for (const shallow of [true, false]) {
            const cloned = Dust.clone(obj, { shallow });

            expect(obj).not.toBe(cloned);
            expect(Dust.equal(obj, cloned)).toBe(true);
            expect(obj.b === cloned.b).toBe(shallow);
            expect(cloned[sym]).toBe(1);
        }
    });

    it('should not clone objects with immutable flag', () => {
        class X { }

        X.prototype.immutable = true;

        const x = new X();
        expect(Dust.clone(x)).toBe(x);
    });

    it('should ignore symbol keys', () => {
        const sym = Symbol('x');
        const obj = { [sym]: 1 };
        const clone = Dust.clone(obj, { symbol: false });

        expect(clone[sym]).toBe(undefined);
    });

    it('should clone objects with null prototypes', () => {
        const obj = Object.create(null);
        obj.a = 1;

        const cloned = Dust.clone(obj);
        expect(Dust.equal(obj, cloned)).toBe(true);
    });

    it('should clone class instances', () => {
        class X {
            constructor() {
                this.a = 1;
            }
        }

        const obj = new X();
        const cloned = Dust.clone(obj);
        expect(Dust.equal(obj, cloned)).toBe(true);
    });

    it('should clone object descriptors', () => {
        const obj = Object.defineProperties({ a: 1 }, {
            b: {
                enumerable: false,
                value: 5,
            },

            c: {
                enumerable: false,

                get() {
                    return this.a;
                },
            },
        });

        const cloned = Dust.clone(obj);

        expect(Dust.equal(obj, cloned, { compareDescriptors: true })).toBe(true);

        cloned.a = 2;
        expect(cloned.c).toBe(2);
        expect(obj.c).toBe(1);
    });

    it('should handle circular references', () => {
        const obj = { a: 1, b: {} };
        obj.b = obj;

        const cloned = Dust.clone(obj);
        expect(cloned.a).toBe(1);
        expect(cloned.b).toBe(obj);
    });

    it('should clone example object', () => {
        const ref = {};
        const sym = Symbol('test');

        class X { }

        X.prototype.immutable = true;

        const obj = {
            a: 1,
            b: [1, 2, 3],
            c: new Map([[ref, 1]]),
            d: new X(),
            [sym]: 2,
        };

        const cloned = Dust.clone(obj);
        expect(obj.b === cloned.b).toBe(false);
        expect(obj.b[1]).toBe(2);
        expect(obj.d === cloned.d).toBe(true);
        expect(cloned.c.get(ref)).toBe(1);
        expect(Dust.equal(obj, cloned)).toBe(true);

        const shallow = Dust.clone(obj, { shallow: true });
        expect(obj.b === shallow.b).toBe(true);

        const noSymbol = Dust.clone(obj, { symbol: false });
        expect(noSymbol[sym]).toBe(undefined);
    });
});

describe('equal()', () => {
    it('should compare strings, numbers, booleans, undefineds, nulls and symbols', () => {
        expect(Dust.equal('x', 'x')).toBe(true);
        expect(Dust.equal('x', 'y')).toBe(false);
        expect(Dust.equal(-0, +0)).toBe(true);
        expect(Dust.equal(-0, +0, { strict: false })).toBe(false);
        expect(Dust.equal(1, 1)).toBe(true);
        expect(Dust.equal(NaN, NaN)).toBe(true);
        expect(Dust.equal(Number.NaN, NaN)).toBe(true);
        expect(Dust.equal(Number.NaN, Number.NaN)).toBe(true);
        expect(Dust.equal(1, 2)).toBe(false);
        expect(Dust.equal(false, false)).toBe(true);
        expect(Dust.equal(true, false)).toBe(false);
        expect(Dust.equal(null, null)).toBe(true);
        expect(Dust.equal(undefined, undefined)).toBe(true);
        expect(Dust.equal(Symbol('x'), Symbol('x'))).toBe(false);

        const sym = Symbol('x');
        expect(Dust.equal(sym, sym)).toBe(true);
    });

    it('should compare functions', () => {
        const a = () => 1;
        const b = () => 2;
        const c = () => 2;
        const d = (_, _1, _2) => 2; // eslint-disable-line no-unused-vars

        expect(Dust.equal(a, a)).toBe(true);
        expect(Dust.equal(a, b)).toBe(false);
        expect(Dust.equal(b, d, { deepFunction: true })).toBe(false);
        expect(Dust.equal(a, b, { deepFunction: true })).toBe(false);
        expect(Dust.equal(b, c, { deepFunction: true })).toBe(true);

        b.x = 1;
        c.x = 2;
        expect(Dust.equal(b, c, { deepFunction: true })).toBe(false);

        b.x = 1;
        b.y = 1;
        c.x = 1;
        expect(Dust.equal(b, c, { deepFunction: true })).toBe(false);

        delete b.y;
        expect(Dust.equal(b, c, { deepFunction: true })).toBe(true);
    });

    it('should compare string, number and boolean objects', () => {
        expect(Dust.equal(new String('x'), new String('x'))).toBe(true);
        expect(Dust.equal(new String('x'), new String('y'))).toBe(false);
        expect(Dust.equal('x', new String('x'))).toBe(false);

        expect(Dust.equal(new Number(-0), new Number(+0))).toBe(true);
        expect(Dust.equal(new Number(-0), new Number(+0), { strict: false })).toBe(false);
        expect(Dust.equal(new Number(1), new Number(1))).toBe(true);
        expect(Dust.equal(new Number(NaN), new Number(NaN))).toBe(true);
        expect(Dust.equal(new Number(Number.NaN), new Number(NaN))).toBe(true);
        expect(Dust.equal(new Number(Number.NaN), new Number(Number.NaN))).toBe(true);
        expect(Dust.equal(new Number(1), new Number(2))).toBe(false);
        expect(Dust.equal(1, new Number(1))).toBe(false);

        expect(Dust.equal(new Boolean(false), new Boolean(false))).toBe(true);
        expect(Dust.equal(new Boolean(true), new Boolean(false))).toBe(false);
        expect(Dust.equal(true, new Boolean(true))).toBe(false);
    });

    it('should compare with null', () => {
        expect(Dust.equal(null, {})).toBe(false);
        expect(Dust.equal({}, null)).toBe(false);
        expect(Dust.equal(null, null)).toBe(true);
        expect(Dust.equal(null, 1)).toBe(false);
        expect(Dust.equal(1, null)).toBe(false);
    });

    it('should return false if prototypes are not the same ', () => {
        expect(Dust.equal([], {})).toBe(false);
        expect(Dust.equal(Object.create(null), {})).toBe(false);

        class X { }

        class Y { }

        expect(Dust.equal(new X(), new X())).toBe(true);
        expect(Dust.equal(new X(), new Y())).toBe(false);

        expect(Dust.equal(new Map(), new WeakMap())).toBe(false);
        expect(Dust.equal(new Set(), new WeakSet())).toBe(false);
    });

    it('should compare dates', () => {
        expect(Dust.equal(new Date(0), new Date(0))).toBe(true);
        expect(Dust.equal(new Date(0), new Date(1))).toBe(false);
        expect(Dust.equal(new Date(NaN), new Date(NaN))).toBe(true);
    });

    it('should compare errors', () => {
        const error = new Error('x');

        expect(Dust.equal(error, new Error('x'))).toBe(true);
        expect(Dust.equal(error, new Error())).toBe(false);
        expect(Dust.equal(error, new TypeError('x'))).toBe(false);
    });

    it('should compare regexps', () => {
        const regex = /x/i;

        expect(Dust.equal(regex, /x/i)).toBe(true);
        expect(Dust.equal(regex, /x/)).toBe(false);
    });

    it('should compare arraybuffers', () => {
        expect(Dust.equal(new ArrayBuffer(1), new ArrayBuffer(1))).toBe(true);
        expect(Dust.equal(new ArrayBuffer(1), new ArrayBuffer(2))).toBe(false);
    });

    it('should compare typed arrays', () => {
        const buff = new ArrayBuffer(16);
        for (const ctor of internals.typedArrays) {
            expect(Dust.equal(new ctor(buff), new ctor(buff))).toBe(true);
            expect(Dust.equal(new ctor(buff), new ctor(new ArrayBuffer(24)))).toBe(false);
        }
    });

    it('should compare dataviews', () => {
        const buff = new ArrayBuffer(16);

        expect(Dust.equal(new DataView(buff, 8, 1), new DataView(buff, 8, 1))).toBe(true);
        expect(Dust.equal(new DataView(buff, 8, 1), new DataView(buff, 8, 2))).toBe(false);
        expect(Dust.equal(new DataView(buff, 8, 1), new DataView(buff, 10, 1))).toBe(false);
        expect(Dust.equal(new DataView(buff, 8, 1), new DataView(new ArrayBuffer(18), 8, 2))).toBe(false);
    });

    it('should return false for weaksets, weakmaps and promises', () => {
        expect(Dust.equal(new WeakMap(), new WeakMap())).toBe(false);
        expect(Dust.equal(new WeakSet(), new WeakSet())).toBe(false);
        expect(Dust.equal(new Promise((res) => res(1), new Promise((res) => res(1))))).toBe(false);
    });

    it('should compare buffers', () => {
        expect(Dust.equal(Buffer.from([1]), Buffer.from([1]))).toBe(true);
        expect(Dust.equal(Buffer.from([1]), Buffer.from([2]))).toBe(false);
    });

    it('should compare arrays', () => {
        expect(Dust.equal([], [])).toBe(true);
        expect(Dust.equal([1, { a: 'x' }, 3], [1, { a: 'x' }, 3])).toBe(true);
        expect(Dust.equal([], [1])).toBe(false);
        expect(Dust.equal([1, { a: 'x' }], [1, { a: 'y' }])).toBe(false);
    });

    it('should compare holey arrays', () => {
        const arr = new Array(3);
        const arr2 = new Array(3);

        arr2[1] = 1;
        arr[1] = 1;
        expect(Dust.equal(arr, arr2)).toBe(true);

        arr2[1] = 2;
        expect(Dust.equal(arr, arr2)).toBe(false);
    });

    it('should compare arguments with arrays', () => {
        let arg1;
        const fn = function () {
            arg1 = arguments;
        };

        fn(1, 2, 3);

        expect(Dust.equal(arg1, [1, 2, 3])).toBe(false);
    });

    it('should compare arguments objects', () => {
        let arg1;
        let arg2;

        const fn = function () {
            arg1 = arguments;
        };

        const fn2 = function () {
            arg2 = arguments;
        };

        fn(1);
        fn2(1);

        expect(Dust.equal(arg1, arg2)).toBe(true);
    });

    it('should compare sets', () => {
        expect(Dust.equal(new Set(), new Set())).toBe(true);
        expect(Dust.equal(new Set(), new Set([1]))).toBe(false);
        expect(Dust.equal(new Set([1, { a: 'x' }, 3]), new Set([1, { a: 'x' }, 3]))).toBe(true);
        expect(Dust.equal(new Set([1, { a: 'x' }]), new Set([1, { a: 'y' }]))).toBe(false);
    });

    it('should return true for sets with same items but different orderings', () => {
        expect(Dust.equal(new Set([1, { a: 'x' }]), new Set([{ a: 'x' }, 1]))).toBe(true);

        const obj = {};
        expect(Dust.equal(new Set([obj, 2]), new Set([2, obj]))).toBe(true);
        expect(Dust.equal(new Set([{}, obj]), new Set([obj, {}]))).toBe(true);
    });

    it('should compare maps', () => {
        expect(Dust.equal(new Map(), new Map())).toBe(true);
        expect(Dust.equal(new Map(), new Map([['x', 1]]))).toBe(false);
        expect(Dust.equal(new Map([[[1], { a: 'x' }]]), new Map([[[1], { a: 'x' }]]))).toBe(true);
        expect(Dust.equal(new Map([[[1], { a: 'x' }]]), new Map([[[1], { a: 'y' }]]))).toBe(false);
        expect(Dust.equal(new Map([[[1], { a: 'x' }]]), new Map([[[2], { a: 'x' }]]))).toBe(false);
    });

    it('should return true for maps with same items but different orderings', () => {
        expect(Dust.equal(new Map([[[1], 1], [[2], 2]]), new Map([[[2], 2], [[1], 1]]))).toBe(true);

        const obj = { a: 1 };
        expect(Dust.equal(new Map([[obj, 1], [{ a: 1 }, 2]]), new Map([[obj, 2], [{ a: 1 }, 1]]))).toBe(true);
        expect(Dust.equal(new Map([[obj, 1], [{ a: 1 }, 2]]), new Map([[{ a: 1 }, 2], [obj, 1]]))).toBe(true);
    });

    it('should compare objects', () => {
        expect(Dust.equal({ a: undefined }, {})).toBe(false);
        expect(Dust.equal({}, {})).toBe(true);
        expect(Dust.equal({ a: undefined }, { a: undefined })).toBe(true);

        const sym = Symbol('x');
        expect(Dust.equal({ a: 'x', b: [1, 2], [sym]: 1 }, { a: 'x', b: [1, 2], [sym]: 1 })).toBe(true);
    });

    it('should ignore symbol keys', () => {
        const sym = Symbol('x');
        expect(Dust.equal({ a: 'x', [sym]: 1 }, { a: 'x', [sym]: 2 }, { symbol: false })).toBe(true);
    });

    it('should compare class instances', () => {
        class X {
            constructor() {
                this.a = 1;
            }
        }

        expect(Dust.equal(new X(), new X())).toBe(true);
    });

    it('should compare objects without comparing descriptors', () => {
        const obj = { a: 'x', b: 'x' };
        const obj2 = Object.defineProperties({},
            {
                a: {
                    get() {
                        return this.b;
                    },
                },

                b: { value: 'x' },
            },
        );

        expect(Dust.equal(obj, obj2)).toBe(true);
        expect(Dust.equal(obj2, obj)).toBe(true);

        obj.a = 'y';
        expect(Dust.equal(obj, obj2)).toBe(false);
        expect(Dust.equal(obj2, obj)).toBe(false);
    });

    it('should compare objects and their descriptors', () => {
        const descriptors = {
            a: { enumerable: true, value: 1 },
            b: {
                get() {
                    return this.a;
                },
            },
        };

        // Same descriptors

        const obj = Object.defineProperties({}, descriptors);
        const obj2 = Object.defineProperties({}, descriptors);
        expect(Dust.equal(obj, obj2, { compareDescriptors: true })).toBe(true);

        // Different keys

        const obj3 = Object.defineProperties({}, {
            ...descriptors,

            c: { value: 'x' },
        });

        const obj4 = Object.defineProperties({}, {
            ...descriptors,

            d: { value: 'x' },
        });

        expect(Dust.equal(obj3, obj4, { compareDescriptors: true })).toBe(false);

        // Same getter content but different reference

        const obj5 = Object.defineProperties({}, {
            ...descriptors,

            b: {
                get() {
                    return this.a;
                },
            },
        });

        expect(Dust.equal(obj, obj5, { compareDescriptors: true })).toBe(false);
    });

    it('should handle basic circular references', () => {
        const obj = {};
        const obj2 = {};
        obj.a = obj;
        obj2.a = obj2;

        expect(Dust.equal(obj, obj2)).toBe(true);
    });

    it('should handle deep circular references', () => {
        const obj = {};
        const obj2 = { a: {} };
        const obj3 = { a: { a: {} } };
        obj.a = obj;
        obj2.a.a = obj2;
        obj3.a.a.a = obj3;

        expect(Dust.equal(obj, obj2)).toBe(true);
        expect(Dust.equal(obj2, obj3)).toBe(true);
        expect(Dust.equal(obj3, obj)).toBe(true);
        expect(Dust.equal(obj, obj3)).toBe(true);
        expect(Dust.equal(obj3, obj2)).toBe(true);
        expect(Dust.equal(obj2, obj)).toBe(true);
    });

    it('should handle single circular references', () => {
        const obj = {};
        const obj2 = { x: {} };
        obj.x = obj;

        expect(Dust.equal(obj, obj2)).toBe(false);
        expect(Dust.equal(obj2, obj)).toBe(false);
    });

    it('should handle complex circular references', () => {
        const obj = {};
        const obj2 = { x: {}, y: obj };
        obj2.x.x = obj2;
        obj2.x.y = obj2.x;
        obj.x = obj2;
        obj.y = obj;

        // Dry run:
        // 1st: a vs b (WeakSet: [a, b])
        // 2nd: b vs b.x (WeakSet: [a, b, b.x])
        // 3rd b.x vs b --> True (WeakSet contains both b.x and b)

        expect(Dust.equal(obj2, obj)).toBe(true);
        expect(Dust.equal(obj, obj2)).toBe(true);

        obj2.x.y = 1;
        expect(Dust.equal(obj2, obj)).toBe(false);
        expect(Dust.equal(obj, obj2)).toBe(false);
    });

    it('should compare example objects', () => {
        class X {
            constructor(someValue) {
                this.someValue = someValue;
            }
        }

        const fn = () => 1;
        const sym = Symbol('x');
        const obj = {
            a: 1,
            b: [1, 2, 3],
            c: new Map([['x', 'y'], [1, 'z']]),
            d: new X(1),
            e: -0,
            f: fn,
            [sym]: 1,
        };

        const obj2 = {
            a: 1,
            b: [1, 2, 3],
            c: new Map([[1, 'z'], ['x', 'y']]),
            d: new X(1),
            e: 0,
            f: fn,
            [sym]: 1,
        };

        expect(Dust.equal(obj, obj2)).toBe(true);
        expect(Dust.equal(obj, obj2, { strict: false })).toBe(false);

        const obj3 = Dust.clone(obj2);
        obj3[sym] = 2;

        expect(Dust.equal(obj, obj3)).toBe(false);
        expect(Dust.equal(obj, obj3, { symbol: false })).toBe(true);

        const obj4 = Dust.clone(obj2);
        obj4.d = new X(2);

        expect(Dust.equal(obj, obj4)).toBe(false);

        const obj5 = Dust.clone(obj2);
        obj5.f = () => 1;

        expect(Dust.equal(obj, obj5)).toBe(false);
        expect(Dust.equal(obj, obj5, { deepFunction: true })).toBe(true);

        const obj6 = Dust.clone(obj);
        obj6.g = 1;

        const obj7 = Object.defineProperties(Dust.clone(obj), {
            g: {
                value: 1,
            },
        });

        expect(Dust.equal(obj6, obj7)).toBe(true);
        expect(Dust.equal(obj6, obj7, { compareDescriptors: true })).toBe(false);
    });
});

describe('get()', () => {
    it('should throw on incorrect parameters', () => {
        expect(() => Dust.get('x')).toThrow('Target must be an object');
        expect(() => Dust.get({}, 1)).toThrow('Path must be a non-empty string');
        expect(() => Dust.get({}, null)).toThrow('Path must be a non-empty string');
        expect(() => Dust.get({}, '')).toThrow('Path must be a non-empty string');
        expect(() => Dust.splitPath('\u0000')).toThrow('Path cannot contain reserved characters');
        expect(() => Dust.splitPath('\u0001')).toThrow('Path cannot contain reserved characters');
    });

    it('should throw on invalid paths', () => {
        expect(() => Dust.get({}, '.')).toThrow('Key must be a non-empty string');
        expect(() => Dust.get({}, '..')).toThrow('Key must be a non-empty string');
        expect(() => Dust.get({}, 'x.')).toThrow('Key must be a non-empty string');
    });

    it('should return the object if path is not provided', () => {
        const obj = {};
        expect(Dust.get(obj)).toBe(obj);
    });

    it('should get values inside arrays', () => {
        const arr = [1, { a: 'x' }, 2];

        expect(Dust.get(arr, '0')).toBe(1);
        expect(Dust.get(arr, '-1')).toBe(2);
        expect(Dust.get(arr, '1.a')).toBe('x');
        expect(Dust.get(arr, '3')).toBe(undefined);
        expect(Dust.get(arr, '-4')).toBe(undefined);
        expect(Dust.get(arr, '5')).toBe(undefined);
        expect(Dust.get(arr, 'x')).toBe(undefined);
        expect(Dust.get(arr, '1\\.2')).toBe(undefined);
    });

    it('should get values inside arrays using wildcard', () => {
        const arr = [{ a: 1 }, { a: 2 }, { a: 3 }];

        expect(Dust.equal(Dust.get(arr, '*'), arr)).toBe(true);
        expect(Dust.equal(Dust.get(arr, '*.a'), [1, 2, 3])).toBe(true);
        expect(Dust.equal(Dust.get(arr, '*.a.b'), [undefined, undefined, undefined])).toBe(true);

        arr[2] = 'x';
        expect(Dust.equal(Dust.get(arr, '*.a'), [1, 2, undefined])).toBe(true);

        arr[2] = { a: { b: 1 } };
        expect(Dust.equal(Dust.get(arr, '*.a'), [1, 2, { b: 1 }])).toBe(true);
    });

    it('should get values inside arrays using nested wildcards', () => {
        const arr = [[{ a: 1 }, { a: 2 }], [{ a: 3 }], [{ a: 4 }]];
        expect(Dust.equal(Dust.get(arr, '*.*.a'), [[1, 2], [3], [4]])).toBe(true);
    });

    it('should get values inside arguments', () => {
        const fn = function () {
            expect(Dust.get(arguments, '0')).toBe(1);
            expect(Dust.get(arguments, '-1')).toBe(1);
            expect(Dust.get(arguments, '1')).toBe(undefined);
            expect(Dust.get(arguments, '-2')).toBe(undefined);
            expect(Dust.get(arguments, '5')).toBe(undefined);
            expect(Dust.get(arguments, 'x')).toBe(undefined);
            expect(Dust.get(arguments, '1\\.2')).toBe(undefined);
        };

        fn(1);
    });

    it('should get all values inside arguments', () => {
        const fn = function () {
            expect(Dust.equal(Dust.get(arguments, '*'), [{ a: 1 }, { a: 2 }, { b: 3 }])).toBe(true);
            expect(Dust.equal(Dust.get(arguments, '*.a.b'), [undefined, undefined, undefined])).toBe(true);
            expect(Dust.equal(Dust.get(arguments, '*.a'), [1, 2, undefined])).toBe(true);
            expect(Dust.equal(Dust.get(arguments, '*.b'), [undefined, undefined, 3])).toBe(true);
        };

        fn({ a: 1 }, { a: 2 }, { b: 3 });
    });

    it('should get values inside typed arrays', () => {
        for (const ctor of internals.typedArrays) {
            const view = new ctor([1, 2]);

            expect(Dust.get(view, '0')).toBe(1);
            expect(Dust.get(view, '-1')).toBe(2);
            expect(Dust.get(view, '2')).toBe(undefined);
            expect(Dust.get(view, '-3')).toBe(undefined);
            expect(Dust.get(view, '5')).toBe(undefined);
            expect(Dust.get(view, 'x')).toBe(undefined);
            expect(Dust.get(view, '1\\.2')).toBe(undefined);
            expect(Dust.equal(Dust.get(view, '*'), [1, 2])).toBe(true);
            expect(Dust.equal(Dust.get(view, '*.a'), [undefined, undefined])).toBe(true);
        }
    });

    it('should get values inside maps', () => {
        const map = new Map([['x', 1], ['y', { a: 'x' }], ['x.y', 1]]);

        expect(Dust.get(map, 'x')).toBe(1);
        expect(Dust.get(map, 'y.a')).toBe('x');
        expect(Dust.get(map, 'x\\.y')).toBe(1);
        expect(Dust.get(map, 'a.b.c')).toBe(undefined);
        expect(Dust.get(map, 'x.y.z')).toBe(undefined);
    });

    it('should get values inside objects', () => {
        const obj = {
            a: 'x',
            0: 'y',
            b: [1],
            c: [{ a: 1 }, { a: 2 }, { b: 3 }],
            'x.y.z': 1,
        };

        expect(Dust.get(obj, 'a')).toBe('x');
        expect(Dust.get(obj, '0')).toBe('y');
        expect(Dust.get(obj, 'b.0')).toBe(1);
        expect(Dust.equal(Dust.get(obj, 'c.*.a'), [1, 2, undefined])).toBe(true);
        expect(Dust.get(obj, 'x\\.y\\.z')).toBe(1);
        expect(Dust.get(obj, 'x.y.z')).toBe(undefined);
        expect(Dust.get(obj, 'a.b.c.d.e')).toBe(undefined);
    });

    it('should not get non-own values', () => {
        expect(Dust.get(Object.create({ a: 1 }), 'a')).toBe(undefined);
    });

    it('should allow split keys', () => {
        const keys = Dust.splitPath('x.y');
        expect(Dust.get({ x: { y: 1 } }, keys)).toBe(1);
    });

    it('should get values inside example object', () => {
        const obj = {
            a: 1,
            b: [1, 2, 3],
            c: new Map([['key', 'x']]),
            d: [{ a: 1 }, { a: 2 }, { a: 3 }],
            'x.y.z': 1,
        };

        expect(Dust.get(obj, 'a')).toBe(1);
        expect(Dust.get(obj, 'b.1')).toBe(2);
        expect(Dust.get(obj, 'b.-1')).toBe(3);
        expect(Dust.get(obj, 'c.key')).toBe('x');
        expect(Dust.get(obj, 'x\\.y\\.z')).toBe(1);
        expect(Dust.equal(Dust.get(obj, 'd.*.a'), [1, 2, 3])).toBe(true);
    });
});

describe('isObject()', () => {
    it('should return false for non objects', () => {
        expect(Dust.isObject('x')).toBe(false);
        expect(Dust.isObject(1)).toBe(false);
        expect(Dust.isObject(false)).toBe(false);
        expect(Dust.isObject(() => { })).toBe(false);
        expect(Dust.isObject(Symbol('x'))).toBe(false);
        expect(Dust.isObject(undefined)).toBe(false);
        expect(Dust.isObject(null)).toBe(false);
    });

    it('should return true for objects', () => {
        expect(Dust.isObject([])).toBe(true);
        expect(Dust.isObject(new Date())).toBe(true);
        expect(Dust.isObject(Object.create(null))).toBe(true);
        expect(Dust.isObject(Object.create({}))).toBe(true);
        expect(Dust.isObject({})).toBe(true);
    });
});

describe('merge()', () => {
    it('should return the target if the target and source are equal', () => {
        const obj = {};

        expect(Dust.merge(1, 1)).toBe(1);
        expect(Dust.merge(obj, obj)).toBe(obj);
        expect(Dust.merge(null, null)).toBe(null);
    });

    it('should return the target if the source is undefined', () => {
        expect(Dust.merge('x', undefined)).toBe('x');
        expect(Dust.merge(null, undefined)).toBe(null);
    });

    it('should return the source if types are different or types are the same but not objects', () => {
        expect(Dust.merge(1, 2)).toBe(2);
        expect(Dust.merge(1, 'x')).toBe('x');
        expect(Dust.merge(1, null)).toBe(null);
        expect(Dust.merge(null, 1)).toBe(1);
    });

    it('should return the source if the objects are different', () => {
        const source = [];

        expect(Dust.merge({}, source)).toBe(source);
        expect(Dust.merge(source, null)).toBe(null);
        expect(Dust.merge(null, source)).toBe(source);

        class X { }

        expect(Dust.equal(Dust.merge(new X(), { x: 1 }), { x: 1 })).toBe(true);
    });

    it('should return the source if the objects are the same and are not object/map/set/array', () => {
        const rx = /y/;
        expect(Dust.merge(/x/, rx)).toBe(rx);
    });

    it('should merge 2 arrays', () => {
        expect(Dust.equal(Dust.merge([1, 2, 3], [4, 5]), [4, 5, 3])).toBe(true);
    });

    it('should merge 2 holey arrays', () => {
        const arr = new Array(2);
        const arr2 = new Array(2);
        arr[0] = 1;
        arr2[1] = 2;

        expect(Dust.equal(Dust.merge(arr, arr2), [1, 2])).toBe(true);
    });

    it('should merge 2 sets', () => {
        const set = new Set([1, 2, 3]);
        const set2 = new Set([3, 4, 5]);
        expect(Dust.equal(Dust.merge(set, set2), new Set([1, 2, 3, 4, 5]))).toBe(true);
    });

    it('should merge 2 maps', () => {
        const map = new Map([[1, 'x'], [2, 'y']]);
        const map2 = new Map([[1, 'z']]);
        expect(Dust.equal(Dust.merge(map, map2), new Map([[1, 'z'], [2, 'y']]))).toBe(true);
    });

    it('should merge 2 objects', () => {
        const sym = Symbol('x');
        const obj = {
            a: 1,
            c: [{ a: 'x' }, 2],
            d: { x: 5 },
            e: new Map([[1, 'x'], [2, 'y']]),
            f: new Date(),
            g: [],
        };

        const obj2 = {
            b: 2,
            c: [{ b: 'y' }, 4],
            d: { x: 7 },
            e: new Map([[1, 'z']]),
            f: /x/i,
            g: undefined,
            [sym]: 'x',
        };

        const result = {
            a: 1,
            b: 2,
            c: [{ a: 'x', b: 'y' }, 4],
            d: { x: 7 },
            e: new Map([[1, 'z'], [2, 'y']]),
            f: /x/i,
            g: [],
            [sym]: 'x',
        };

        expect(Dust.equal(Dust.merge(Dust.clone(obj), obj2), result)).toBe(true);
    });

    it('should ignore symbol keys', () => {
        const sym = Symbol('x');
        expect(Dust.equal(Dust.merge({ [sym]: 'x' }, { [sym]: 'y' }), { [sym]: 'y' })).toBe(true);
    });

    it('should merge class instances', () => {
        class X {
            constructor() {
                this.a = 1;
            }
        }

        const x = new X();
        x.a = 2;

        expect(Dust.equal(Dust.merge(new X(), x), x)).toBe(true);
        expect(Dust.equal(Dust.merge(x, new X()), new X())).toBe(true);
    });

    it('should merge object descriptors', () => {
        const getter = function () {
            return 1;
        };

        const obj = Object.defineProperties({}, {
            // 1. Non-configurable properties are kept as is

            a: {
                enumerable: true,
                value: {
                    x: 'x',
                    y: 'y',
                },
            },

            // 2. Configurable properties without accessors on source are merged by their values whilst keeping the other descriptors

            b: {
                configurable: true,
                enumerable: true,
                value: {
                    x: 'x',
                    y: 'y',
                },
            },

            // 3. Properties with accessors on source are replaced completely

            c: {
                configurable: true,
                value: {
                    x: 'x',
                    y: 'y',
                },
            },
        });

        const obj2 = Object.defineProperties({}, {
            a: {
                value: {
                    z: 'z',
                },
            },

            b: {
                enumerable: false,
                value: {
                    z: 'z',
                },
            },

            c: {
                get: getter,
            },

            // 4. Properties on source not on target will be added

            d: {
                value: 1,
            },
        });

        const result = Object.defineProperties({}, {
            a: {
                enumerable: true,
                value: {
                    x: 'x',
                    y: 'y',
                },
            },

            b: {
                enumerable: false,
                value: {
                    x: 'x',
                    y: 'y',
                    z: 'z',
                },
            },

            c: {
                get: getter,
            },

            d: {
                value: 1,
            },
        });

        expect(Dust.equal(Dust.merge(obj, obj2), result, { compareDescriptors: true })).toBe(true);
    });

    it('should handle basic circular references', () => {
        const obj = {};
        const obj2 = {};
        obj.a = obj;
        obj2.a = obj2;

        expect(Dust.equal(Dust.merge(obj, obj2), { a: obj2 })).toBe(true);
        expect(Dust.equal(Dust.merge(obj2, obj), { a: obj })).toBe(true);
    });

    it('should handle deep circular references', () => {
        const obj = {};
        const obj2 = { a: {} };
        obj.a = obj;
        obj2.a.a = obj2;

        // Dry run:
        // 1st: obj vs obj2 (WeakSet: [obj2, obj])
        // 2nd: obj.a vs obj2.a (WeakSet: [obj2.a, obj2, obj]) --> Returns obj2.a since obj.a is obj

        expect(Dust.equal(Dust.merge(obj, obj2), { a: { a: obj2 } })).toBe(true);
        expect(Dust.equal(Dust.merge(obj2, obj), { a: obj })).toBe(true);
    });

    it('should handle single circular references', () => {
        const obj = {};
        const obj2 = { x: {} };
        obj.x = obj;

        expect(Dust.equal(Dust.merge(obj, obj2, { x: {} }))).toBe(false);
        expect(Dust.equal(Dust.merge(obj2, obj, { x: obj }))).toBe(false);
    });

    it('should handle complex circular references', () => {
        const obj = {};
        const obj2 = { x: {}, y: obj };
        obj2.x.x = obj2;
        obj2.x.y = obj2.x;
        obj.x = obj2;
        obj.y = obj;

        expect(Dust.equal(Dust.merge(obj2, obj), { x: { x: obj2, y: obj2.x }, y: obj })).toBe(true);
        expect(Dust.equal(Dust.merge(obj, obj2), { x: obj2, y: obj })).toBe(true);
    });

    it('should handle circular references', () => {
        const obj = {};
        const obj2 = {};
        obj.a = obj;
        obj2.a = obj2;

        expect(Dust.equal(Dust.merge(obj, obj2), { a: obj2 })).toBe(true);
    });

    it('should handle complex circular references', () => {
        const obj = {};
        const obj2 = {};

        obj.a = obj;
        obj2.a = obj;
        expect(Dust.equal(Dust.merge(obj, obj2), { a: obj })).toBe(true);

        obj.a = obj2;
        obj2.a = obj;
        expect(Dust.equal(Dust.merge(obj, obj2), { a: obj })).toBe(true);

        obj.a = obj;
        obj2.a = obj2;
        expect(Dust.equal(Dust.merge(obj, obj2), { a: obj2 })).toBe(true);
    });
});

describe('set()', () => {
    it('should throw on incorrect parameters', () => {
        expect(() => Dust.set({}, 1)).toThrow('Path must be a non-empty string');
        expect(() => Dust.set({}, null)).toThrow('Path must be a non-empty string');
        expect(() => Dust.set({}, '')).toThrow('Path must be a non-empty string');
        expect(() => Dust.splitPath('\u0000')).toThrow('Path cannot contain reserved characters');
        expect(() => Dust.splitPath('\u0001')).toThrow('Path cannot contain reserved characters');
    });

    it('should throw on invalid paths', () => {
        expect(() => Dust.get({}, '.')).toThrow('Key must be a non-empty string');
        expect(() => Dust.get({}, '..')).toThrow('Key must be a non-empty string');
        expect(() => Dust.get({}, 'x.')).toThrow('Key must be a non-empty string');
    });

    it('should return the object if path is not provided provided', () => {
        const obj = {};
        expect(Dust.set(obj)).toBe(obj);
    });

    it('should set value for arrays', () => {
        expect(Dust.equal(Dust.set([1], '0', 2), [2])).toBe(true);
        expect(Dust.equal(Dust.set([], '0', 1), [1])).toBe(true);
        expect(Dust.equal(Dust.set([1], '-1', 3), [3])).toBe(true);
        expect(Dust.equal(Dust.set([1], '-2', 3), [1])).toBe(true);
        expect(Dust.equal(Dust.set([1], '1', 2), [1, 2])).toBe(true);
        expect(Dust.equal(Dust.set([[1]], '0.0', 2), [[2]])).toBe(true);
        expect(Dust.equal(Dust.set([1], '0.a', 2), [{ a: 2 }])).toBe(true);
        expect(Dust.equal(Dust.set([1], '0.a.1', 2), [{ a: [undefined, 2] }])).toBe(true);
        expect(Dust.equal(Dust.set([], 'x'), [])).toBe(true);
        expect(Dust.equal(Dust.set([], '1\\.2'), [])).toBe(true);
    });

    it('should set value for arguments objects', () => {
        const fn = function () {
            expect(Dust.set(arguments, '0', 2)[0]).toBe(2);
        };

        fn(1);
    });

    it('should set value for typed arrays', () => {
        for (const ctor of internals.typedArrays) {
            expect(Dust.equal(Dust.set(new ctor([1, 2]), '0', 2), new ctor([2, 2]))).toBe(true);
            expect(Dust.equal(Dust.set(new ctor([1, 2]), '-1', 3), new ctor([1, 3]))).toBe(true);
            expect(Dust.equal(Dust.set(new ctor([1, 2]), '-3', 3), new ctor([1, 2]))).toBe(true);
            expect(Dust.equal(Dust.set(new ctor([1, 2]), 'x', 3), new ctor([1, 2]))).toBe(true);
            expect(Dust.equal(Dust.set(new ctor([1, 2]), '1\\.2', 3), new ctor([1, 2]))).toBe(true);
        }
    });

    it('should set value for maps', () => {
        expect(Dust.equal(Dust.set(new Map(), 'x', 1), new Map([['x', 1]]))).toBe(true);
        expect(Dust.equal(Dust.set(new Map([['x', [1]]]), 'x', 2), new Map([['x', 2]]))).toBe(true);
        expect(Dust.equal(Dust.set(new Map([['x', [1]]]), 'x.0', 2), new Map([['x', [2]]]))).toBe(true);
        expect(Dust.equal(Dust.set(new Map([['x', [1]]]), 'x.x', 2), new Map([['x', [1]]]))).toBe(true);
        expect(Dust.equal(Dust.set(new Map([['x', 1]]), 'x.a', 2), new Map([['x', { a: 2 }]]))).toBe(true);
        expect(Dust.equal(Dust.set(new Map([['x.y', 1]]), 'x\\.y', 2), new Map([['x.y', 2]]))).toBe(true);
    });

    it('should set value for objects', () => {
        expect(Dust.equal(Dust.set({ x: 1 }, 'x', 2), { x: 2 })).toBe(true);
        expect(Dust.equal(Dust.set({}, 'x', 1), { x: 1 })).toBe(true);
        expect(Dust.equal(Dust.set({ x: 1 }, 'x.y', 2), { x: { y: 2 } })).toBe(true);
        expect(Dust.equal(Dust.set({ x: 1 }, 'x.0', 2), { x: [2] })).toBe(true);
        expect(Dust.equal(Dust.set({ x: 1 }, 'x.-1', 2), { x: { '-1': 2 } })).toBe(true);
        expect(Dust.equal(Dust.set({ x: [1] }, 'x.0', 2), { x: [2] })).toBe(true);
        expect(Dust.equal(Dust.set({ x: [1, 2] }, 'x.-1', 3), { x: [1, 3] })).toBe(true);
        expect(Dust.equal(Dust.set({ a: new Map([['x', 1]]) }, 'a.x', 2), { a: new Map([['x', 2]]) })).toBe(true);
        expect(Dust.equal(Dust.set({ 'x.y.z': 1 }, 'x\\.y\\.z', 2), { 'x.y.z': 2 })).toBe(true);
    });

    it('should not set non-own values', () => {
        const obj = Object.create({ a: 1 });
        const obj2 = Object.create({ a: { b: 1 } });

        expect(Dust.set(obj, 'a', 2).a).toBe(1);
        expect(Dust.set({ x: obj2 }, 'x.a.b', 2).x.a.b).toBe(1);
    });

    it('should allow split keys', () => {
        const keys = Dust.splitPath('x.y');
        expect(Dust.equal(Dust.set({}, keys, 2), { x: { y: 2 } })).toBe(true);
    });

    it('should set values inside example objects', () => {
        expect(Dust.equal(Dust.set({}, 'a', 1), { a: 1 })).toBe(true);
        expect(Dust.equal(Dust.set({}, 'a.b', 1), { a: { b: 1 } })).toBe(true);
        expect(Dust.equal(Dust.set({}, 'a.0', 1), { a: [1] })).toBe(true);
        expect(Dust.equal(Dust.set([], '0', 1), [1])).toBe(true);
        expect(Dust.equal(Dust.set([1, 2], '-1', 3), [1, 3])).toBe(true);
        expect(Dust.equal(Dust.set(new Map([['key', 'x']]), 'key', 'y'), new Map([['key', 'y']]))).toBe(true);
        expect(Dust.equal(Dust.set({}, 'x\\.y\\.z', 1), { 'x.y.z': 1 })).toBe(true);
    });
});

describe('splitPath()', () => {
    it('should throw on invalid errors', () => {
        expect(() => Dust.splitPath(1)).toThrow('Path must be a non-empty string');
        expect(() => Dust.splitPath('')).toThrow('Path must be a non-empty string');
        expect(() => Dust.splitPath(null)).toThrow('Path must be a non-empty string');
        expect(() => Dust.splitPath('\u0000')).toThrow('Path cannot contain reserved characters');
        expect(() => Dust.splitPath('\u0001')).toThrow('Path cannot contain reserved characters');
    });

    it('should return split keys', () => {
        const split = Dust.splitPath('x.y.z');
        expect(Dust.splitPath(split)).toBe(split);
    });

    it('should clone split keys', () => {
        const keys = Dust.splitPath('x.y.z');
        const cloned = Dust.splitPath(keys, { clone: true });

        expect(keys).not.toBe(cloned);
        expect(Dust.equal(keys, cloned)).toBe(true);
    });

    it('should split paths', () => {
        expect(Dust.equal(Dust.splitPath('x.y.z'), ['x', 'y', 'z'])).toBe(true);
        expect(Dust.equal(Dust.splitPath('x.0.z'), ['x', '0', 'z'])).toBe(true);
    });

    it('should ignore escaped "."', () => {
        expect(Dust.equal(Dust.splitPath('x\\.y.z'), ['x.y', 'z'])).toBe(true);
    });

    it('should ignore "\\" if not followed by a "."', () => {
        expect(Dust.equal(Dust.splitPath('x\\y.z'), ['x\\y', 'z'])).toBe(true);
    });

    it('should escape "\\"', () => {
        expect(Dust.equal(Dust.splitPath('x\\\\.z'), ['x\\', 'z'])).toBe(true);
    });

    it('should throw on invalid "."', () => {
        expect(() => Dust.splitPath('.')).toThrow('Key must be a non-empty string');
        expect(() => Dust.splitPath('.x')).toThrow('Key must be a non-empty string');
        expect(() => Dust.splitPath('x.')).toThrow('Key must be a non-empty string');
        expect(() => Dust.splitPath('..')).toThrow('Key must be a non-empty string');
        expect(() => Dust.splitPath('.x.')).toThrow('Key must be a non-empty string');
    });
});
