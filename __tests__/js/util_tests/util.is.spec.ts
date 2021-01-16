// require("../../../src/utilz") // works
// require("src/utilz") // works
// require("utilz") // works

function vexpect(name: string, val: any, apply: (...args: any) => boolean, expected: boolean) {
    let actual = apply(val);
    if (actual !== expected) {
        console.warn(`SHOULD ${expected === false ? "NOT" : ""} pass ${apply.name}(${name}) but actual is ${actual}. "${name}": ${typeof val} = ${util.inspect(val, { colors: true })}`)
    }
    expect(actual).toBe(expected)
    return actual === expected
}

import * as util from "utilz"

const named_fn_in_var = function namedfn() {
}
const fn_with_args = function fnwargs(...args) {
}
const STUFF = {
    '[]': [],
    '[undefined]': [undefined],
    '[null]': [null],
    '[1]': [1],
    '[[]]': [[]],
    '[[undefined]]': [[undefined]],
    'Array': Array,
    'Array()': Array(),
    'Array([])': Array([]),
    'Array([undefined])': Array([undefined]),
    'Array([null])': Array([null]),
    'Array([1])': Array([1]),
    'new Array': new Array,
    'new Array()': new Array(),
    'new Array([])': new Array([]),
    'new Array([undefined])': new Array([undefined]),
    'new Array([null])': new Array([null]),
    'new Array([1])': new Array([1]),
    '{}': {},
    '{foo:"bar"}': { foo: 'bar' },
    '{foo:undefined}': { foo: undefined },
    '{foo:null}': { foo: null },
    '{foo:[]}': { foo: [] },
    '{foo:[1]}': { foo: [1] },
    '{foo:{}}': { foo: {} },
    '{foo:{bar:"baz"}}': { foo: { bar: "baz" } },
    'Object': Object,
    'Object.create(null)': Object.create(null),
    'Object.create({})': Object.create({}),
    'Object.create({foo:undefined})': Object.create({ foo: undefined }),
    'Object.create({foo:null})': Object.create({ foo: null }),
    'Object.create({foo:"bar"})': Object.create({ foo: 'bar' }),
    'Map': Map,
    'new Map': new Map,
    'new Map([])': new Map([]),
    'new Map([[undefined,undefined]])': new Map([[undefined, undefined]]),
    'new Map([["foo",undefined]])': new Map([["foo", undefined]]),
    'new Map([["foo",null]])': new Map([["foo", null]]),
    'new Map([["foo","bar"]])': new Map([["foo", "bar"]]),
    'Boolean': Boolean,
    'new Boolean': new Boolean,
    'Boolean()': Boolean(),
    'Boolean(true)': Boolean(true),
    'Boolean(false)': Boolean(false),
    'Boolean(0)': Boolean(0),
    'Boolean(1)': Boolean(1),
    'new Boolean()': new Boolean(),
    'new Boolean(true)': new Boolean(true),
    'new Boolean(false)': new Boolean(false),
    'new Boolean(0)': new Boolean(0),
    'new Boolean(1)': new Boolean(1),
    'Number': Number,
    'new Number': new Number,
    'Number()': Number(),
    'Number(0)': Number(0),
    'Number(1)': Number(1),
    'Number(true)': Number(true),
    'Number(false)': Number(false),
    'new Number()': new Number(),
    'new Number(0)': new Number(0),
    'new Number(1)': new Number(1),
    'new Number("0")': new Number("0"),
    'new Number("1")': new Number("1"),
    'new Number(true)': new Number(true),
    'new Number(false)': new Number(false),
    'Set': Set,
    'new Set': new Set,
    'new Set()': new Set(),
    'new Set(undefined)': new Set(undefined),
    'new Set(null)': new Set(null),
    'new Set([null,undefined])': new Set([null, undefined]),
    'new Set([])': new Set([]),
    'new Set([undefined])': new Set([undefined]),
    'new Set([null])': new Set([null]),
    'new Set([1])': new Set([1]),
    'Error': Error,
    'Error()': Error(),
    'new Error': new Error,
    'new Error()': new Error(),
    'Function': Function,
    'Function()': Function(),
    'new Function()': new Function(),
    '()=>{}': () => {
    },
    'function(){}': function () {
    },
    'function foo(){}': function foo() {
    },
    'function foo(...args){}': function foo(...args) {
    },
    'named_fn_in_var': named_fn_in_var,
    'fn_with_args': fn_with_args,
    '0': 0,
    '1': 1,
    '': '',
    ' ': ' ',
    '"0"': '0',
    '"1"': '1',
    'false': false,
    'true': true,
    'null': null,
    'undefined': undefined,
}
const KEYS = Object.keys(STUFF);

/*for (let [key, val] of util.enumerate(STUFF)) {
    let proto = undefined;
    try {
        proto = Object.getPrototypeOf(val)
    } catch (e) {
        continue
    }
    let keys;
    try {
        keys =Object.keys(proto) // Object.create(null)
    } catch {
        continue
    }
    try{
        keys.length
    }catch (e){
        debugger;
    }
}*/

function _validate_keys(keyarr: Array<string>): boolean {
    for (let k of keyarr) {
        if (!KEYS.includes(k)) {
            throw new Error(`partition(value) | keyarr has a key that's not in KEYS. key: ${k} (${typeof k})`)
        }
    }
    return true;
}

function partition(predicate: (key: string) => boolean): [yes: Object, no: Object]
function partition(options: { yes: Array<string>, skip?: Array<string> }): [yes: Object, no: Object]
function partition(options: { yes: (key: string) => boolean, skip?: Array<string> }): [yes: Object, no: Object]
function partition(options: { no: Array<string> }): [yes: Object, no: Object]
function partition(value): [yes: Object, no: Object] {
    let predicate;
    let shouldskip = (key) => false;
    if (util.is.isFunction(value)) {
        predicate = value;
    } else {
        if (value.skip) {
            _validate_keys(value.skip);
            shouldskip = (key) => value.skip.includes(key);
        }
        if (value.yes) {
            if (util.is.isFunction(value.yes)) {
                predicate = value.yes;
            } else {
                _validate_keys(value.yes)
                predicate = (key) => value.yes.includes(key) && (value.skip ?? []).includes(key) === false;
            }
        } else if (value.no) {
            _validate_keys(value.no)
            predicate = (key) => value.no.includes(key) === false;
        }
    }
    const yes = {};
    const no = {};
    for (let [key, val] of util.enumerate(STUFF)) {
        if (shouldskip(key)) {
            continue
        }
        // let val = STUFF[key];
        if (predicate(key)) {
            yes[key] = val;
        } else {
            no[key] = val;
        }
    }
    return [yes, no]
}

describe("util.is", () => {

    test("isTMap", () => {

        const [tmaps, nottmaps] = partition({
                yes: key => key.startsWith('{') || key.startsWith('Object.create'),
            }
        );
        for (let [tmapname, tmapval] of util.enumerate(tmaps)) {
            let actual = util.is.isTMap(tmapval);
            expect(actual).toBe(true)
        }

        for (let [nottmapname, nottmapval] of util.enumerate(nottmaps)) {
            let actual = util.is.isTMap(nottmapval);
            expect(actual).toBe(false)
        }


    });
    test("isObject", () => {
        const [objs, notobjs] = partition({
                yes: key => key.startsWith('[') || key.startsWith('{') || key.startsWith('Object.create') || key.startsWith('new ') || key == 'Error()' || key.startsWith('Array('),
                skip: ['new Function()']
            }
        );
        for (let [objname, objval] of util.enumerate(objs)) {
            let actual = util.is.isObject(objval);
            if (actual !== true) {

                console.warn(`SHOULD pass isObject(${objname}) but actual is ${actual}: "${objname}": ${util.inspect(objval, { colors: true })}`)
            }
            expect(actual).toBe(true)
        }
        for (let [notobjname, notobjval] of util.enumerate(notobjs)) {
            vexpect(notobjname, notobjval, util.is.isObject, false)
            // let actual = util.is.isObject(notobjval);
            // if (actual !== false) {
            //     console.warn(`SHOULD NOT pass isObject(${notobjname}) but actual is ${actual}: "${notobjname}": ${typeof notobjval} = ${util.inspect(notobjval, { colors: true })}`)
            // }
            // expect(actual).toBe(false)
        }

    });

    test("isFunction", () => {
        const [fns, notfns] = partition({
            yes: ['Boolean', 'Function', 'Function()', 'new Function()', 'Number', 'Set', 'Map', 'Object', 'Error', 'Array',
                '()=>{}', 'function(){}', 'function foo(){}', 'function foo(...args){}',
                'named_fn_in_var', 'fn_with_args'
            ],
        });
        for (let [fnname, fnval] of util.enumerate(fns)) {
            let actual = util.is.isFunction(fnval);
            if (actual !== true) {
                console.warn(`"${fnname}": ${util.inspect(fnval, { colors: true })}`)
            }
            expect(actual).toBe(true)
        }
        for (let [notfnname, notfnval] of util.enumerate(notfns)) {
            vexpect(notfnname, notfnval, util.is.isFunction, false)
        }
    });

    test("isPrimitive", () => {

        const [primitives, nonprimitives] = partition({
            yes: key => ['0', '1', '', ' ', '"0"', '"1"', 'false', 'true', 'null', 'undefined'].includes(key) || key.startsWith('Boolean(') || key.startsWith('Number('),
        });
        for (let [primitivename, primitiveval] of util.enumerate(primitives)) {
            vexpect(primitivename, primitiveval, util.is.isPrimitive, true)
        }

        for (let [nonprimitivename, nonprimitiveval] of util.enumerate(nonprimitives)) {
            vexpect(nonprimitivename, nonprimitiveval, util.is.isPrimitive, false)
        }

    })

    test("isArray", () => {

        const [arrays, nonarrays] = partition({
            yes: key => key.startsWith('[') || key.startsWith('Array(') || key.startsWith('new Array'),
            // just 'Array' is a Function, not an empty array
        });
        for (let [arrayname, arrayval] of util.enumerate(arrays)) {
            vexpect(arrayname, arrayval, util.is.isArray, true)
        }
        for (let [nonarrayname, nonarrayval] of util.enumerate(nonarrays)) {
            vexpect(nonarrayname, nonarrayval, util.is.isArray, false)
        }

    })

    test("isEmpty", () => {

        const [empties, nonempties] = partition({
            yes: ['[]', 'Array()', 'new Array', 'new Array()', '{}',
                'Object.create(null)', 'Object.create({})'],

            // need __proto__ check but not sure if that's too much:
            skip: ['Object.create({foo:undefined})', 'Object.create({foo:null})'
            ]
        });
        for (let [emptyname, emptyval] of util.enumerate(empties)) {
            vexpect(emptyname, emptyval, util.is.isEmpty, true)
        }
        for (let [nonemptyname, nonemptyval] of util.enumerate(nonempties)) {
            vexpect(nonemptyname, nonemptyval, util.is.isEmpty, false)

        }

    })
})