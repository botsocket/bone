import Dust = require('../src');

let voidType: void;
let boolType: boolean;
let strType: string;
let objType: object;
let unkType: unknown;
let arrNumType: number[];
let guard: unknown;

// assert()

Dust.assert('x');
Dust.assert(true);
Dust.assert(true, {});
Dust.assert(true, '');
Dust.assert(true, new Error());
voidType = Dust.assert(true);

// clone()

Dust.clone('x');
Dust.clone(1);
Dust.clone(false);
Dust.clone({ a: 1 });
Dust.clone({}, { shallow: true, symbol: true });
strType = Dust.clone('x');

const cloneReturnVal: { a: number } = Dust.clone({ a: 1 });
const cloneReturnVal2: { a: string } = Dust.clone({} as { a: string });
function withCloneOptions(options: Dust.clone.Options) { }

// equal()

Dust.equal(1, 2);
Dust.equal([], [], { compareDescriptors: true, symbol: true, deepFunction: true });
boolType = Dust.equal([], {});

// get()

Dust.get({});
Dust.get({}, undefined);
Dust.get({}, undefined);
Dust.get({}, 'x');

// set()

Dust.set({}, undefined, 1);
Dust.set({}, undefined, 1);
Dust.set({}, 'x', 1);

// isObject()

if (Dust.isObject(guard)) {
    objType = guard;
}

// merge()

strType = Dust.merge('x', 'y');
strType = Dust.merge([1], 'y');
arrNumType = Dust.merge('x', [1]);

Dust.merge({}, {}, { symbol: true });

const mergeReturnVal: { a: number; b: string } = Dust.merge({ a: 1 }, { b: 'x' });
const mergeReturnVal2: { a: number; b: number } = Dust.merge({} as { a: number }, {} as { b: number });

// splitPath()

const keys = Dust.splitPath('x');
Dust.splitPath(keys, { clone: true });

for (const split of keys) {
    split;
}

Dust.set({}, keys, 1);
Dust.get({}, keys);
