import Bone = require('../src');

let voidType: void;
let boolType: boolean;
let strType: string;
let objType: object;
let unkType: unknown;
let arrNumType: number[];
let guard: unknown;

// assert()

Bone.assert('x');
Bone.assert(true);
Bone.assert(true, {});
Bone.assert(true, '');
Bone.assert(true, new Error());
voidType = Bone.assert(true);

// clone()

Bone.clone('x');
Bone.clone(1);
Bone.clone(false);
Bone.clone({ a: 1 });
Bone.clone({}, { shallow: true, symbol: true });
strType = Bone.clone('x');

const cloneReturnVal: { a: number } = Bone.clone({ a: 1 });
const cloneReturnVal2: { a: string } = Bone.clone({} as { a: string });
function withCloneOptions(options: Bone.clone.Options) { }

// equal()

Bone.equal(1, 2);
Bone.equal([], [], { compareDescriptors: true, symbol: true, deepFunction: true });
boolType = Bone.equal([], {});

// get()

Bone.get({});
Bone.get({}, undefined);
Bone.get({}, undefined);
Bone.get({}, 'x');

// set()

Bone.set({}, undefined, 1);
Bone.set({}, undefined, 1);
Bone.set({}, 'x', 1);

// isObject()

if (Bone.isObject(guard)) {
    objType = guard;
}

// merge()

strType = Bone.merge('x', 'y');
strType = Bone.merge([1], 'y');
arrNumType = Bone.merge('x', [1]);

Bone.merge({}, {}, { symbol: true });

const mergeReturnVal: { a: number; b: string } = Bone.merge({ a: 1 }, { b: 'x' });
const mergeReturnVal2: { a: number; b: number } = Bone.merge({} as { a: number }, {} as { b: number });

// splitPath()

const keys = Bone.splitPath('x');
Bone.splitPath(keys, { clone: true });

for (const split of keys) {
    split;
}

Bone.set({}, keys, 1);
Bone.get({}, keys);
