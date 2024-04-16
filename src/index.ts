
// export class DigFilter<T> {
//     constructor(public args:any[]) {
//         console.log(args);
//     }
//     filter(value: T, index: number, array: T[]) {
//         console.log(value, index, array, this.args);
//     }
// }
// class DigMaxFilter<T> extends DigFilter<T> {
//     constructor(public args:any[]) {
//         super(args);
//         console.log(args);
//     }
//     filter(value: T, index: number, array: T[]) {
//         console.log(value, index, array, this.args);
//     }
// }


export const digUp:DigupFunction = (object:any, ...keys:any[]): any =>{
    if (object === undefined) {
        return undefined;
    }
    let result;
    let key = keys.shift();
    if (key instanceof Array) {
        let Default = keys.shift();
        result =  digUp.apply(null, [object, ...key]);
        return result === undefined ? Default : result;
    }
    if (object instanceof Array) {
        if (typeof(key)==='function') {
            result = object.find(key);
        } else {
            result = object[key];
        }
    } else {
        result = object[key];
    }
    if (keys.length===0 || result===undefined || result===null) {
        return result;
    } else {
        return digUp.apply(null, [result, ...keys]);
    }
};

interface FirstObjectResponse<T>  {
    get():T|undefined;
    get(Default?: T):T;
    merge<Other extends object>(object:Other):T&Other;
    return(func:(dig:Digger<T>)=>any):any // tweak result. For branching etc.
    min: DigNumber<T>;
    max: DigNumber<T>;
    sum: DigNumber<T>;
    avg: DigNumber<T>;
}
interface ObjectResponse<T> {
    get():T|undefined;
    get(Default?: any):any;
    delete(uncreate?:boolean):T;
    exists():boolean;
    set(value, create?:boolean):T;
    merge<Other extends object>(object:Other):T&Other;
    return(func:(dig:Digger<T>)=>any):any // tweak result. For branching etc.
    min: DigNumber<T>;
    max: DigNumber<T>;
    sum: DigNumber<T>;
    avg: DigNumber<T>;
}
interface ArrayResponse<Arr, Item> extends Array<Item> {
    get():Arr|undefined;
    get(Default?: Arr):Arr;
    set(value:Arr, create?:boolean):Arr;
    exists():boolean;
    return(func: (dig: Digger<Item>)=>any):any // tweak result. For branching etc.
    dig:DigOnFunction<Arr>
    // delete():Arr|undefined;
    //  map<U>(callbackfn: (value: Item, index: number, array: Item[]) => U, thisArg?: any): U[];
    // push(value: Item, create?:boolean): number; // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/push
    // concat(value: Item[], create?:boolean): Item[];
    // forEach(func: (value: Item) => void): void;
    // eachDig(func: (value: Item) => void): void;
    filter(callbackfn: (value: Item, index: number, array: Item[]) => boolean): FilteredArray<Item>
    // filter<S extends Item>(callbackfn: (value: Item, index: number, array: Arr) => value is S, thisArg?: any): FilteredArray<Item>;
    // find(func: (value: Item) => boolean): Item|undefined;
    min: DigNumber<Item>;
    max: DigNumber<Item>;
    sum: DigNumber<Item>;
    avg: DigNumber<Item>;
    collect: DigCollect<Item>
}
// interface ArrayResponse<Arr, Item> extends Array<Item>, ArrayDigger<Arr, Item> {
//
// }
interface ArrayDigger<Arr, Item> {
    get():Arr|undefined;
    get(Default?: Arr):Arr;
    set(value:Arr, create?:boolean):Arr;
    exists():boolean;
    return(func: (dig: Digger<Item>)=>any):any // tweak result. For branching etc.
    // digOn:DigOnFunction<Arr>
    // delete():Arr|undefined;
    // map<U>(callbackfn: (value: Item, index: number, array: Item[]) => U, thisArg?: any): U[];
    // push(value: Item, create?:boolean): number; // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/push
    // concat(value: Item[], create?:boolean): Item[];
    // forEach(func: (value: Item) => void): void;
    // eachDig(func: (value: Item) => void): void;
    filter(callbackfn: (value: Item, index: number, array: Item[]) => boolean): FilteredArray<Item>
    // filter<S extends Item>(callbackfn: (value: Item, index: number, array: Arr) => value is S, thisArg?: any): FilteredArray<Item>;
    // find(func: (value: Item) => boolean): Item|undefined;
    min: DigNumber<Item>;
    max: DigNumber<Item>;
    sum: DigNumber<Item>;
    avg: DigNumber<Item>;
}

// type Response<T, R> = T extends Array<infer U> ? ArrayResponse2<R> : ObjectResponse<R>;
class Digger<T>
    extends Array<T>
    implements // ArrayResponse<T[], T>,
                           ArrayDigger<T[], T>,
                           ObjectResponse<T>,
                           FirstObjectResponse<T> {
    constructor(
        private object,
        public path) {super()}

    get(Default?:any) {
        let result = this.makeResult(false);
        return result === undefined ? Default : result;
    }
    exists() {
        return this.makeResult(false) !== undefined;
    }
    collect(...keys) {
        const result = collect(this.object, keys);
        return new Digger(result, []);
    }
    delete(uncreate=true) {
        let result = this.makeResult(false);
        // Don't delete if it's not defined, or can't be found, e.g. dig(myObject).delete doesn't make sense.
        if (result==undefined || this.path.length==0) {
            return;
        }
        // Remove last key and get parent object/array.
        let parent;
        let lastKey = this.path.pop();
        let path = [...this.path];
        if (path.length>0) {
            parent = digUp.apply(null, [this.object, ...path]);

            // Remove result from array or object.
            if (parent instanceof Array) {
                parent.splice(parent.indexOf(result), 1);
            } else if (lastKey) {
                delete parent[lastKey];
            }
        }
        // Track back and remove all empty objects/arrays.
        while (path.length>0 && uncreate) {
            lastKey = path.pop();
            const grandParent  = path.length==0 ? this.object : digUp.apply(null, [this.object, ...path]);
            // Remove from array
            if (grandParent instanceof Array) {
                grandParent.splice(grandParent.indexOf(parent), 1);

                // Array with other items shouldn't be deleted.
                if (grandParent.length>0) {
                    uncreate = false;
                }
            } else {
                // Remove from object
                delete grandParent[lastKey];

                // Object with other properties shouldn't be deleted.
                if(!isEmpty(grandParent)) {
                    uncreate = false;
                }
            }
            parent = grandParent;
        }
        return result;
    }
    set(val, create: boolean=true) {
        let result = this.makeResult(create, val instanceof Array);
        // Don't set if we can't set, e.g. dig(myObject).set('a');
        if (result===undefined) {
            return;
        }
        if (result===null){
            throw new Error('Cannot set property of null');
        }

        // Remove last key and get parent object/array.
        const lastKey = this.path.pop();
        if (this.path.length>0 && lastKey) {
            const parent = digUp.apply(null, [this.object, ...this.path]);
            parent[lastKey] = val;
            return val;
        }
    }

    /**
     * push(1, false) --> don't create.
     */
    push(...items:any[]) {
        let create = true;

        // Don't create is last item is false.
        if (items.length>1 && items[items.length-1]===false) {
            create = false;
            items.pop();
        }
        let result:Array<any> = this.makeResult(create, true);
        if (result===undefined) {
            return 0; // length is 0
        }
        if (!(result instanceof Array)) {
            throw new Error('Can only push to array');
        }
        return result.push.apply(result, items); // length of changed array.
    }
    // push<Item>(item: Item, create?: boolean) {
    //     let result:Array<Item> = this.makeResult(create, true);
    //     if (result===undefined) {
    //         return 0; // length is 0
    //     }
    //     if (!(result instanceof Array)) {
    //         throw new Error('Can only push to array');
    //     }
    //     return result.push(item); // length of changed array.
    // }
    // forEach(func:(value) => any) {
    forEach(callbackfn: (value: T, index: number, array: T[]) => void): void {
        let result:Array<any> = this.makeResult(true, true);
        return result ? result.forEach(callbackfn) : undefined;
    }
    eachDig(func:(value) => void) {
        let result:Array<any> = this.makeResult(true, true);
        if(result) {
            return result.forEach(item=>func.call(null, dig.call(null, item)))
        }
        return;
    }
    filter(callbackfn: (value: T, index: number, array: T[]) => boolean) {
        let result:T[] = this.makeResult(true, true);
        // console.log('result=', result.length);
        // console.log('callbackfn.length=', callbackfn.toString());
        result = result ? result.filter(callbackfn) : [];
        // console.log('result_after.length=', result.length);
        const dig:DigOnFunction<any> = function(...keys:any[]) {
            // DigOnFunction is Digger without the first argument.
            return new Digger<T>(result, keys);
        };
        return Object.assign(result, {dig:dig, toArray:()=>result});
    }
    find(predicate: (value: T, index: number, obj: T[]) => boolean): T | undefined {
        // find(func:(value:T) => boolean) {
        let result:T[] = this.makeResult(true, true);
        return result ? result.find(predicate) : undefined;
    }
    map<U>(callbackfn: (value: T, index: number, array: T[]) => U): U[] {
        // map(callbackfn:(value:T) => any) {
        let result:T[] = this.makeResult(false, true); // don't create when there's nothing to map.
        return result ? result.map(callbackfn) : [];
    }

    concat(...items: ConcatArray<T>[]): T[] {
        let result:T[] = this.makeResult(true, true);
        return result ? result.concat.call(null, items) : [...items];
    }
    return<T>(func:(dig:Digger<T>) => any) {
        return func.call(null, dig);
    }
    min(...keys) {
        return getMin(this.object, keys);
    }
    max(...keys) {
        return getMax(this.object, keys);
    }
    sum(...keys) {
        return getSum(this.object, keys);
    }
    avg(...keys):number|undefined {
        return getAvg(this.object, keys);
    }
    merge(object) {
        let result:Object = this.makeResult(true);

        return {...object, ...result};
    }
    // findDig(func:(value) => any, ...keys) => dig.apply(null, [result ? result.find(func)  :undefined, ...keys]),
    private makeResult(create=true, lastIsArray=false) {
        let result = this.path.length > 0 ? digUp.apply(null, [this.object, ...this.path]) : this.object;

        if (result !== undefined || !create) {
            return result;
        }
        // Return empty object or array if there are no keys, e.g. dig(myObject)
        if (this.path.length===0 ) {
            return lastIsArray ? [] : {};
        }

        // Make empty nested object/array to match the keys.
        result = this.object;
        let i = 0;
        do {
            let key = this.path[i];

            // check missing property
            if (result[key] === undefined) {
                let isArray: boolean = false;

                // missing property is an array when the NEXT key is a number or function (not a string).
                if (i < this.path.length - 1) {
                    let nextKey = this.path[i + 1];
                    isArray = typeof nextKey !== 'string';
                }
                // ...or when it's the last key and the value happens to be an array.
                else {
                    isArray = lastIsArray;
                }
                result[key] = isArray ? [] : {};
            }
            result = result[key];
            i++
        } while (result !== null && i < this.path.length);
        return result
    }
}

/**
 * Get child numbers from an object or array, e.g.
 *      abc = {a:{b:[{c:1}, {c:2}]}}
 *      collect(abc, ['a', 'b', 'c'])   //   [1, 2]
 */
function collect(input, keys: string[], result = new Array()) {

    // A. Arrays: flatten
    if (input instanceof Array
        // array.length is a property of an object. That's handled below.
        && (keys[0]!='length' || keys.length > 1)) {

        // arrays are flattened by collecting the same keys from each item.
        input.forEach(item => {
            collect(item, keys, result);
        });
    }
    // B. Object: traverse or add to result
    else if (typeof input === 'object' && input !== null && keys.length) {
        const keysCopy = keys.slice(0); // shallow copy
        const key = <string>keysCopy.shift();
        if (keysCopy.length) {
            collect(input[key], keysCopy, result); // traverse
        } else {
            result.push(input[key]);
        }
    }
    // C. undefined and other: ignore

    return result;
}
function collectNumbers(object, keys) {
    return collect(object, keys)
            .map(val=>parseFloat(val))
            .filter(val=>typeof val === 'number' && !isNaN(val));
}
function getMax(object, keys) {
    const numbers = collectNumbers(object, keys);
    return numbers.length ? numbers.reduce((prev, cur)=> Math.max(prev, cur)) : undefined;
}
function getMin(object, keys) {
    const numbers = collectNumbers(object, keys);
    return numbers.length ? numbers.reduce((prev, cur)=> Math.min(prev, cur)) : undefined;
}
function getSum(object, keys) {
    const numbers = collectNumbers(object, keys);
    return numbers.length ? numbers.reduce((prev, cur)=> prev + cur) : undefined;
}
function getAvg(object, keys) {
    const numbers = collectNumbers(object, keys);
    return numbers.length ? numbers.reduce((prev, cur)=> prev + cur) / numbers.length : undefined;
}
export function max<T>(...keys) {
    let best;
    return (item: T, index: number, array: T[]) => {
        // Get best value of entire array. Only once. Just remember it.
        if (index === 0) {
            best = getMax(array, keys);
        }
        // See if this item has the best value.
        return (best !== undefined) ? best === getMax(item, keys) : false;
    }
}
export function min<T>(...keys) {
    let best;
    return (item: T, index: number, array: T[]) => {
        // Get best value of entire array. Only once. Just remember it.
        if (index === 0) {
            best = getMin(array, keys);
        }
        // See if this item has the best value.
        return (best !== undefined) ? best === getMin(item, keys) : false;
    }
}
export function avg<T>(...keys) {
    let best;
    return (item: T, index: number, array: T[]) => {
        // Get best value of entire array. Only once. Just remember it.
        if (index === 0) {
            best = getAvg(array, keys);
        }
        // See if this item has the best value.
        return (best !== undefined) ? best === getAvg(item, keys) : false;
    }
}
/**
 * Example:
 const abc  = [{a:{b:[{c:1},{c:10}]}}, {a:{b:[{c:1}]}}, {a:{}}];
 const tens = abc.filter(where('a','b','c').greaterThanOrEqual(10));
 // tens becomes: [{a:{b:[{c:1},{c:10}]}]
*/
export function where<T>(...keys) {
    return new Where<T>(keys);
}
type FilterFunction<T> = (value: T, index: number, array: T[]) => boolean;

class Where<T> {
    constructor(private keys) {}
    greaterThan(number): FilterFunction<T> {
        return item => collect(item, this.keys).some(n => n > number);
    }
    greaterThanOrEqual(number): FilterFunction<T> {
        return item => collect(item, this.keys).some(n => n >= number);
    }
    lessThan(number): FilterFunction<T> {
        return item => collect(item, this.keys).some(n => n < number);
    }
    lessThanOrEqual(number): FilterFunction<T> {
        return item => collect(item, this.keys).some(n => n <= number);
    }
    equals(number): FilterFunction<T> {
        return item => collect(item, this.keys).some(n => n == number);
    }
    check(fn): FilterFunction<T> {
        return item => {
            const collection = collect(item, this.keys)
                return collection.some(n => fn.call(null, n))
        };

    }
}
// export const dig:DigFunction = (object:object, ...keys:(number|string)[]): Dig => new Dig(object, keys);
export const dig:DigFunction = function<T>(object:T, ...keys:(number|string)[]): Digger<T> {
    return new Digger(object, keys);
};

// function isNumber(key:number|string) {
//     return typeof key === 'number' || !isNaN(parseInt(key));
// }
// @ts-ignore: 'value' is never read but it's the first argument of Array.find
export const last = (value, index, array) => index==array.length-1;

// Types that might be useful outside dig.ts
export type ItemOf<T>     = T extends Array<infer U> ? U      : never
export type ValueOf<T, K> = K extends keyof T ? T[K] : never;
export type IndexOf<T>    = T extends Array<any>     ? number|'length' : keyof T;
export type NoArray<A> =
    A extends Array<infer B> ?
        B extends Array<infer C> ?
            C extends Array<infer D> ?
                D extends Array<infer E> ?
                    Required<E>:
                    Required<D>:
                Required<C>:
            Required<B>:
        Required<A>;

// Internal types.
type Key       = string|number;
type Find<T>        = T extends object ? (value: ItemOf<T>, index?:number, array?:T) => boolean : never;
// type Find<T>        = T extends object ? FindFunction<T> : never;
type MustBeNumber<T> = T extends number ? string : 'Last property should be a number'

/**
 * Below you'll find a similar pattern, where each type reuses the previous one.
 * This allows recursion, limited to 5 or 6 steps.
 */

type NoArrayA<T,a>         = NoArray<ValueOf<NoArray <T>,a>>
type NoArrayB<T,a,b>       = NoArray<ValueOf<NoArrayA<T,a>,b>>;
type NoArrayC<T,a,b,c>     = NoArray<ValueOf<NoArrayB<T,a,b>,c>>;
type NoArrayD<T,a,b,c,d>   = NoArray<ValueOf<NoArrayC<T,a,b,c>,d>>;
type NoArrayE<T,a,b,c,d,e> = NoArray<ValueOf<NoArrayD<T,a,b,c,d>,e>>;

// Arguments.
// `dig` and `digUp` use max 6 arguments for nested keys.
// That should be plenty. The default max arguments for eslint is 3. See https://eslint.org/docs/rules/max-params
type A<T,a>                 = T                extends Array<infer U> ? U : a extends keyof T                ? Required<T>[a] : any
type B<T,a,b>               = A<T,a>           extends Array<infer U> ? U : b extends keyof A<T,a>           ? Required<A<T,a>>[b] : any;
type C<T,a,b,c>             = B<T,a,b>         extends Array<infer U> ? U : c extends keyof B<T,a,b>         ? Required<B<T,a,b>>[c] : any;
type D<T,a,b,c,d>           = C<T,a,b,c>       extends Array<infer U> ? U : d extends keyof C<T,a,b,c>       ? Required<C<T,a,b,c>>[d] : any;
type E<T,a,b,c,d,e>         = D<T,a,b,c,d>     extends Array<infer U> ? U : e extends keyof D<T,a,b,c,d>     ? Required<D<T,a,b,c,d>>[e] : any;
type F<T,a,b,c,d,e,f>       = E<T,a,b,c,d,e>   extends Array<infer U> ? U : f extends keyof E<T,a,b,c,d,e>   ? Required<E<T,a,b,c,d,e>>[f] : any;

// Results for each set of arguments
type ResultA<T,a>           = T                extends Array<infer U> ? U : a extends keyof T                ? T[a] : any
type ResultB<T,a,b>         = A<T,a>           extends Array<infer U> ? U : b extends keyof A<T,a>           ? A<T,a>[b] : any;
type ResultC<T,a,b,c>       = B<T,a,b>         extends Array<infer U> ? U : c extends keyof B<T,a,b>         ? B<T,a,b>[c] : any;
type ResultD<T,a,b,c,d>     = C<T,a,b,c>       extends Array<infer U> ? U : d extends keyof C<T,a,b,c>       ? C<T,a,b,c>[d] : any;
type ResultE<T,a,b,c,d,e>   = D<T,a,b,c,d>     extends Array<infer U> ? U : e extends keyof D<T,a,b,c,d>     ? D<T,a,b,c,d>[e] : any;
type ResultF<T,a,b,c,d,e,f> = E<T,a,b,c,d,e>   extends Array<infer U> ? U : f extends keyof E<T,a,b,c,d,e>   ? E<T,a,b,c,d,e>[f] : any;



// WARNING! Insane typescript below! It works though...


// See https://github.com/Microsoft/TypeScript/issues/12290
// type IsDefined<T> = Exclude<T, undefined>;
// type Defined = Exclude<any, undefined>;


interface DigupFunction {
    // 'a', 'b'
    <T, a extends Key,
        b extends Key> (object:T,
        a:a&IndexOf<T>        |Find<T>,
        b:b&IndexOf<A<T,a>>   |Find<A<T,a>>)
        :ResultB<T,a,b>|undefined


    // 'a' OR
    // ['a', 'b'?, 'c'?, ...etc]
    <T, Arr extends {0:Key},
        a extends Key,
        b extends Key,
        c extends Key,
        d extends Key,
        e extends Key,
        f extends Key> (object:T,
                        // a:Arr&{0:a&IndexOf<T>        |Find<T>}|{0:a&IndexOf<T>        |Find<T>,1:b&IndexOf<A<T,a>>   |Find<A<T,a>>}
                        a:
                            Arr&{0:a&IndexOf<T>              |Find<T>,
                            1?:b&IndexOf<A<T,a>>         |Find<A<T,a>>
                            2?:c&IndexOf<B<T,a,b>>       |Find<B<T,a,b>>
                            3?:d&IndexOf<C<T,a,b,c>>     |Find<C<T,a,b,c>>
                            4?:e&IndexOf<D<T,a,b,c,d>>   |Find<D<T,a,b,c,d>>
                            5?:f&IndexOf<E<T,a,b,c,d,e>> |Find<E<T,a,b,c,d,e>>
                        }
                            |a&IndexOf<T>|Find<T>
    )
        : Arr extends {0:any, 1:any, 2:any, 3:any, 4:any, 5:any} ? ResultF<T,a,b,c,d,e,f>
        : Arr extends {0:any, 1:any, 2:any, 3:any, 4:any}        ? ResultE<T,a,b,c,d,e>
        : Arr extends {0:any, 1:any, 2:any, 3:any}               ? ResultD<T,a,b,c,d>
        : Arr extends {0:any, 1:any, 2:any}                      ? ResultC<T,a,b,c>
        : Arr extends {0:any, 1:any}                             ? ResultB<T,a,b>
        : Arr extends {0:any}                                    ? ResultA<T,a>
        : any;

    // 'a', 'b' OR
    // ['a', 'b'?, 'c'?, ...etc], Default
    <T, Arr extends Array<any>|string, //Default extends Arr|Key,
        a extends Key,
        b extends Key, //BB extends Key,
        c extends Key,
        d extends Key,
        e extends Key,
        f extends Key> (object:T,
        // a:Arr&{0:a&IndexOf<T>        |Find<T>}|{0:a&IndexOf<T>        |Find<T>,1:b&IndexOf<A<T,a>>   |Find<A<T,a>>}
        a:
            Arr&{0:a&IndexOf<T>              |Find<T>,
                1?:b&IndexOf<A<T,a>>         |Find<A<T,a>>
                2?:c&IndexOf<B<T,a,b>>       |Find<B<T,a,b>>
                3?:d&IndexOf<C<T,a,b,c>>     |Find<C<T,a,b,c>>
                4?:e&IndexOf<D<T,a,b,c,d>>   |Find<D<T,a,b,c,d>>
                5?:f&IndexOf<E<T,a,b,c,d,e>> |Find<E<T,a,b,c,d,e>>
                }
               |a&IndexOf<T>|Find<T>,
        Default
            : Arr extends IndexOf<T> |Find<T>                        ? IndexOf<A<T,a>>|Find<A<T,a>> // 'a', 'b'
            : Arr extends {0:any, 1:any, 2:any, 3:any, 4:any, 5:any} ? ResultF<T,a,b,c,d,e,f>
            : Arr extends {0:any, 1:any, 2:any, 3:any, 4:any}        ? ResultE<T,a,b,c,d,e>
            : Arr extends {0:any, 1:any, 2:any, 3:any}               ? ResultD<T,a,b,c,d>
            : Arr extends {0:any, 1:any, 2:any}                      ? ResultC<T,a,b,c>
            : Arr extends {0:any, 1:any}                             ? ResultB<T,a,b>
            : Arr extends {0:any}                                    ? ResultA<T,a>
            : never
            // : any

    )
        // : BB extends IndexOf<A<T,a>> |Find<A<T,a>>                ? ResultB<T,a,BB>
        : Arr extends IndexOf<T> |Find<T>                        ? {c:{d:1}}
        : Arr extends {0:any, 1:any, 2:any, 3:any, 4:any, 5:any} ? ResultF<T,a,b,c,d,e,f>
        : Arr extends {0:any, 1:any, 2:any, 3:any, 4:any}        ? ResultE<T,a,b,c,d,e>
        : Arr extends {0:any, 1:any, 2:any, 3:any}               ? ResultD<T,a,b,c,d>
        : Arr extends {0:any, 1:any, 2:any}                      ? ResultC<T,a,b,c>
        : Arr extends {0:any, 1:any}                             ? ResultB<T,a,b>
        : Arr extends {0:any}                                    ? ResultA<T,a>
        : any;

   // 'a'
   //  <T, a extends Key> (object:T,
   //                      a:a&IndexOf<T>        |Find<T>)
   //      :ResultA<T,a>|undefined

    // ['a'], Default
    // <T, a extends Key> (Object:T, Array:{0:a&keyof T})
    //     : a extends keyof T ? T[a]: any;

    // ['a'], Default
    // <T, a extends Key> (Object:T, Array:{0:a&keyof T}, Default: a extends keyof T ? T[a]: never)
    //     : a extends keyof T ? T[a]: any;

    // 'a', 'b', 'c'
    <T, a extends Key,
        b extends Key,
        c extends Key> (object:T,
                        a:a&IndexOf<T>        |Find<T>,
                        b:b&IndexOf<A<T,a>>   |Find<A<T,a>>,
                        c:c&IndexOf<B<T,a,b>> |Find<B<T,a,b>>)
        :ResultC<T,a,b,c>|undefined
    // 'a', 'b', 'c', 'd'
    <T, a extends Key,
        b extends Key,
        c extends Key,
        d extends Key> (object:T,
                        a:a&IndexOf<T>          |Find<T>,
                        b:b&IndexOf<A<T,a>>     |Find<A<T,a>>,
                        c:c&IndexOf<B<T,a,b>>   |Find<B<T,a,b>>,
                        d:d&IndexOf<C<T,a,b,c>> |Find<C<T,a,b,c>>)
        :ResultD<T,a,b,c,d>|undefined
    // 'a', 'b', 'c', 'd', 'e'
    <T, a extends Key,
        b extends Key,
        c extends Key,
        d extends Key,
        e extends Key> (object:T,
                        a:a&IndexOf<T>            |Find<T>,
                        b:b&IndexOf<A<T,a>>       |Find<A<T,a>>,
                        c:c&IndexOf<B<T,a,b>>     |Find<B<T,a,b>>,
                        d:d&IndexOf<C<T,a,b,c>>   |Find<C<T,a,b,c>>,
                        e:e&IndexOf<D<T,a,b,c,d>> |Find<D<T,a,b,c,d>>)
        :ResultE<T,a,b,c,d,e>|undefined
    // 'a', 'b', 'c', 'd', 'e', 'f'
    <T, a extends Key,
        b extends Key,
        c extends Key,
        d extends Key,
        e extends Key,
        f extends Key> (object:T,
                        a:a&IndexOf<T>              |Find<T>,
                        b:b&IndexOf<A<T,a>>         |Find<A<T,a>>,
                        c:c&IndexOf<B<T,a,b>>       |Find<B<T,a,b>>,
                        d:d&IndexOf<C<T,a,b,c>>     |Find<C<T,a,b,c>>,
                        e:e&IndexOf<D<T,a,b,c,d>>   |Find<D<T,a,b,c,d>>,
                        f:f&IndexOf<E<T,a,b,c,d,e>> |Find<E<T,a,b,c,d,e>>)
        :ResultF<T,a,b,c,d,e,f>|undefined

    // 'a', 'b', 'c', 'd', 'e', 'f', etc...
    <T, a extends Key,
        b extends Key,
        c extends Key,
        d extends Key,
        e extends Key,
        f extends Key> (object:T,
                        a:a&IndexOf<T>              |Find<T>,
                        b:b&IndexOf<A<T,a>>         |Find<A<T,a>>,
                        c:c&IndexOf<B<T,a,b>>       |Find<B<T,a,b>>,
                        d:d&IndexOf<C<T,a,b,c>>     |Find<C<T,a,b,c>>,
                        e:e&IndexOf<D<T,a,b,c,d>>   |Find<D<T,a,b,c,d>>,
                        f:f&IndexOf<E<T,a,b,c,d,e>> |Find<E<T,a,b,c,d,e>>,
                        ...etc:any[])
        :any|undefined

}
type ResponseA<T,a> = A<T,a> extends Array<infer U>
    ? ArrayResponse <ResultA<T,a>, U>
    : ObjectResponse<ResultA<T,a>>;

type ResponseB<T,a,b> = B<T,a,b> extends Array<infer U>
    ? ArrayResponse <ResultB<T,a,b>, U>
    : ObjectResponse<ResultB<T,a,b>>;

type ResponseC<T,a,b,c> = C<T,a,b,c> extends Array<infer U>
    ? ArrayResponse <ResultC<T,a,b,c>, U>
    : ObjectResponse<ResultC<T,a,b,c>>;

type ResponseD<T,a,b,c,d> = D<T,a,b,c,d> extends Array<infer U>
    ? ArrayResponse <ResultD<T,a,b,c,d>, U>
    : ObjectResponse<ResultD<T,a,b,c,d>>;

type ResponseE<T,a,b,c,d,e> = E<T,a,b,c,d,e> extends Array<infer U>
    ? ArrayResponse <ResultE<T,a,b,c,d,e>, U>
    : ObjectResponse<ResultE<T,a,b,c,d,e>>;

type ResponseF<T,a,b,c,d,e,f> = F<T,a,b,c,d,e,f> extends Array<infer U>
    ? ArrayResponse <ResultF<T,a,b,c,d,e,f>, U>
    : ObjectResponse<ResultF<T,a,b,c,d,e,f>>;

interface DigFunction {
    <T>(object: T):
        T extends Array<infer U>
            ? ArrayResponse<T, U>
            : FirstObjectResponse<T>;


    <a extends Key, T>(object: T,
                       a: a & IndexOf<T> | Find<T>): ResponseA<T,a>
        // A<T, a> extends Array<infer U>
        //     ? ArrayResponse<ResultA<T,a>,U>
        //     : ObjectResponse<ResultA<T, a>>;

    // 'a' OR
    // ['a', 'b'?, 'c'?, ...etc]
    <T, Arr extends Array<Key>,
        a extends Key,
        b extends Key,
        c extends Key,
        d extends Key,
        e extends Key,
        f extends Key> (object:T,
                        // a:Arr&{0:a&IndexOf<T>        |Find<T>}|{0:a&IndexOf<T>        |Find<T>,1:b&IndexOf<A<T,a>>   |Find<A<T,a>>}
                        a:
                            Arr&{0:a&IndexOf<T>          |Find<T>,
                            1?:b&IndexOf<A<T,a>>         |Find<A<T,a>>
                            2?:c&IndexOf<B<T,a,b>>       |Find<B<T,a,b>>
                            3?:d&IndexOf<C<T,a,b,c>>     |Find<C<T,a,b,c>>
                            4?:e&IndexOf<D<T,a,b,c,d>>   |Find<D<T,a,b,c,d>>
                            5?:f&IndexOf<E<T,a,b,c,d,e>> |Find<E<T,a,b,c,d,e>>
                        }
                        //|a&IndexOf<T>|Find<T>
    )
        : Arr extends {0:any, 1:any, 2:any, 3:any, 4:any, 5:any} ? ResponseF<T,a,b,c,d,e,f>
        : Arr extends {0:any, 1:any, 2:any, 3:any, 4:any}        ? ResponseE<T,a,b,c,d,e>
        : Arr extends {0:any, 1:any, 2:any, 3:any}               ? ResponseD<T,a,b,c,d>
        : Arr extends {0:any, 1:any, 2:any}                      ? ResponseC<T,a,b,c>
        : Arr extends {0:any, 1:any}                             ? ResponseB<T,a,b>
        : Arr extends {0:any}                                    ? ResponseA<T,a>
        : any;

    <a extends Key,
        b extends Key, T>
    (object: T,
     a: a & IndexOf  <T>    | Find  <T>,
     b: b & IndexOf<A<T,a>> | Find<A<T,a>>): ResponseB<T,a,b>
        // B<T,a,b> extends Array<infer U>
        //     ? ArrayResponse <ResultB<T,a,b>, U>
        //     : ObjectResponse<ResultB<T,a,b>>;

    <a extends Key,
        b extends Key,
        c extends Key, T>(object: T,
                          a: a & IndexOf  <T>      | Find  <T>,
                          b: b & IndexOf<A<T,a>>   | Find<A<T,a>>,
                          c: c & IndexOf<B<T,a,b>> | Find<B<T,a,b>>): ResponseC<T,a,b,c>
        // C<T,a,b,c> extends Array<infer U>
    //     ? ArrayResponse <ResultC<T,a,b,c>, U>
    //     : ObjectResponse<ResultC<T,a,b,c>>;

    <a extends Key,
        b extends Key,
        c extends Key,
        d extends Key, T>(object: T,
                          a: a & IndexOf  <T>        | Find  <T>,
                          b: b & IndexOf<A<T,a>>     | Find<A<T,a>>,
                          c: c & IndexOf<B<T,a,b>>   | Find<B<T,a,b>>,
                          d: d & IndexOf<C<T,a,b,c>> | Find<C<T,a,b,c>>): ResponseD<T,a,b,c,d>
        // D<T,a,b,c,d> extends Array<infer U>
        //     ? ArrayResponse <ResultD<T,a,b,c,d>, U>
        //     : ObjectResponse<ResultD<T,a,b,c,d>>;

    <a extends Key,
        b extends Key,
        c extends Key,
        d extends Key,
        e extends Key, T>(object: T,
                          a: a & IndexOf  <T>          | Find  <T>,
                          b: b & IndexOf<A<T,a>>       | Find<A<T,a>>,
                          c: c & IndexOf<B<T,a,b>>     | Find<B<T,a,b>>,
                          d: d & IndexOf<C<T,a,b,c>>   | Find<C<T,a,b,c>>,
                          e: e & IndexOf<D<T,a,b,c,d>> | Find<D<T,a,b,c,d>>): ResponseE<T,a,b,c,d,e>
        // E<T,a,b,c,d,e> extends Array<infer U>
        //     ? ArrayResponse <ResultE<T,a,b,c,d,e>, U>
        //     : ObjectResponse<ResultE<T,a,b,c,d,e>>;

    <a extends Key,
        b extends Key,
        c extends Key,
        d extends Key,
        e extends Key,
        f extends Key, T>(object: T,
                          a: a & IndexOf  <T>            | Find  <T>,
                          b: b & IndexOf<A<T,a>>         | Find<A<T,a>>,
                          c: c & IndexOf<B<T,a,b>>       | Find<B<T,a,b>>,
                          d: d & IndexOf<C<T,a,b,c>>     | Find<C<T,a,b,c>>,
                          e: e & IndexOf<D<T,a,b,c,d>>   | Find<D<T,a,b,c,d>>,
                          f: f & IndexOf<E<T,a,b,c,d,e>> | Find<E<T,a,b,c,d,e>>): ResponseF<T,a,b,c,d,e,f>
        // F<T,a,b,c,d,e,f> extends Array<infer U>
        //     ? ArrayResponse <ResultF<T,a,b,c,d,e,f>, U>
        //     : ObjectResponse<ResultF<T,a,b,c,d,e,f>>;
}
// todo: combine 'a', 'b', 'c', etc...
// <T, a,
//     //     b,
//     //     c,
//     //     d,
//     //     e extends Key, ee,
//     //     f extends Key, ff,
//     //     g extends Key, gg> (object:T,
//     //     a:a &IndexOf<T>                 /*| Find<  T   >*/,
//     //     b?:b&IndexOf<A<T,a>>            /*| Find<A<T,a>>*/,
//     //     c?:c&IndexOf<B<T,a,b>>          /*| Find<B<T,a,b>>*/,
//     //     d?:d&IndexOf<C<T,a,b,c>>        /*| Find<C<T,a,b,c>>*/,
//     //     e?:e&IndexOf<D<T,a,b,c,d>>      /*| Find<D<T,a,b,c,d>>*/,
//     //     f?:f&IndexOf<E<T,a,b,c,d,e>>    /*| Find<E<T,a,b,c,d,e>>*/,
//     //     g?:g&IndexOf<F<T,a,b,c,d,e,f>>  /*| Find<F<T,a,b,c,d,e,d>>*/,
//     //     ...etc
//     // )
//     // // :d extends string ? {e:{f:number}}
//     // // :b extends string ? {c:{d:{e:{f:number}}}}
//     // //     : bb extends string ? {c:{d:{e:{f:number}}}}
//     // //     : {b:{c:{d:{e:{f:number}}}}}
//     // // :d extends string ? {e:{f:number}}
//     // // :c extends string ? {d:{e:{f:number}}}
//     // // :b extends string ? {c:{d:{e:{f:number}}}}
//     // // :a extends string ? {b:{c:{d:{e:{f:number}}}}}
//     // // :any
//     // // :ReturnABCD<T,a,b,c,d>;
//     // // :b extends undefined ? ResultA<T,a> : ResultB<T,a,b> // no
//     //
//     // // :any
//     //
//     // // :d extends string ? {e:{f:number}}
//     // // :c extends string ? {d:{e:{f:number}}}
//     // // :b extends string ? {c:{d:{e:{f:number}}}}
//     // // :a extends string ? {b:{c:{d:{e:{f:number}}}}}
//     // // :never
//     //
//     // // :d extends string ? ResultD<T,a,b,c,d>
//     // // :c extends string ? ResultC<T,a,b,c>
//     // // :b extends string ? ResultB<T,a,b>
//     // // :ResultA<T,a>  // no
//     //
//     // // ResultD<T,a,b,c,d> extends never ?
//     // // ResultC<T,a,b,c> extends never ?
//     // // ResultB<T,a,b> extends never ?
//     // // ResultA<T,a>:
//     // // ResultB<T,a,b>:
//     // // ResultC<T,a,b,c>:
//     // // ResultD<T,a,b,c,d>;
//     //     // :ResultA<T,a>
//     //     // :ResultB<T,a,b>
//     // // :d extends Defined ? ResultD<T,a,b,c,d>
//     // // :c extends Defined   ? ResultC<T,a,b,c>
//     // // :b extends Defined     ? ResultB<T,a,b>
//     // // :a extends Defined          ? ResultA<T,a>:any
//     // // :d extends IndexOf<C<T,a,b,c>> ? ResultD<T,a,b,c,d>
//     // // :c extends IndexOf<B<T,a,b>>   ? ResultC<T,a,b,c>
//     // // :b extends IndexOf<A<T,a>>     ? ResultB<T,a,b>
//     // // :a extends IndexOf<T>          ? ResultA<T,a>
//     // // :never;
//     //
//     // // :b extends undefined ? undefined|ResultA<T,a>
//     // // :c extends undefined ? undefined|ResultB<T,a,b>
//     // // :d extends undefined ? undefined|ResultC<T,a,b,c>
//     // // :e extends undefined ? undefined|ResultD<T,a,b,c,d>
//     // // :f extends undefined ? undefined|ResultE<T,a,b,c,d,e>
//     // // :g extends undefined ? undefined|ResultF<T,a,b,c,d,e,f>
//     // // :any

export interface DigOnFunction<T> {
    // <a extends Key>(
    //  a: a & IndexOf<T>| Find<T>): any
    <a extends Key>(
        a: a & IndexOf<T> | Find<T>):
        // A<T, a> extends Array<infer U>
        //     ? ArrayResponse<ResultA<T,a>,U>
        //     : never; // First Array
    A<T, a> extends Array<infer U>
    ? ArrayResponse<ResultA<T,a>,U>
    : ObjectResponse<ResultA<T,a>>

    <a extends Key,
        b extends Key>
    (a: a & IndexOf  <T>    | Find  <T>,
     b: b & IndexOf<A<T,a>> | Find<A<T,a>>):
        B<T,a,b> extends Array<infer U>
            ? ArrayResponse <ResultB<T,a,b>, U>
            : ObjectResponse<ResultB<T,a,b>>;

    <a extends Key,
        b extends Key,
        c extends Key>
    (a: a & IndexOf  <T>      | Find  <T>,
     b: b & IndexOf<A<T,a>>   | Find<A<T,a>>,
     c: c & IndexOf<B<T,a,b>> | Find<B<T,a,b>>):
        C<T,a,b,c> extends Array<infer U>
            ? ArrayResponse <ResultC<T,a,b,c>, U>
            : ObjectResponse<ResultC<T,a,b,c>>;

    <a extends Key,
        b extends Key,
        c extends Key,
        d extends Key>
    (a: a & IndexOf  <T>        | Find  <T>,
     b: b & IndexOf<A<T,a>>     | Find<A<T,a>>,
     c: c & IndexOf<B<T,a,b>>   | Find<B<T,a,b>>,
     d: d & IndexOf<C<T,a,b,c>> | Find<C<T,a,b,c>>):
        D<T,a,b,c,d> extends Array<infer U>
            ? ArrayResponse <ResultD<T,a,b,c,d>, U>
            : ObjectResponse<ResultD<T,a,b,c,d>>;

    <a extends Key,
        b extends Key,
        c extends Key,
        d extends Key,
        e extends Key>
    (a: a & IndexOf  <T>          | Find  <T>,
     b: b & IndexOf<A<T,a>>       | Find<A<T,a>>,
     c: c & IndexOf<B<T,a,b>>     | Find<B<T,a,b>>,
     d: d & IndexOf<C<T,a,b,c>>   | Find<C<T,a,b,c>>,
     e: e & IndexOf<D<T,a,b,c,d>> | Find<D<T,a,b,c,d>>):
        E<T,a,b,c,d,e> extends Array<infer U>
            ? ArrayResponse <ResultE<T,a,b,c,d,e>, U>
            : ObjectResponse<ResultE<T,a,b,c,d,e>>;

    <a extends Key,
        b extends Key,
        c extends Key,
        d extends Key,
        e extends Key,
        f extends Key>
    (a: a & IndexOf  <T>            | Find  <T>,
     b: b & IndexOf<A<T,a>>         | Find<A<T,a>>,
     c: c & IndexOf<B<T,a,b>>       | Find<B<T,a,b>>,
     d: d & IndexOf<C<T,a,b,c>>     | Find<C<T,a,b,c>>,
     e: e & IndexOf<D<T,a,b,c,d>>   | Find<D<T,a,b,c,d>>,
     f: f & IndexOf<E<T,a,b,c,d,e>> | Find<E<T,a,b,c,d,e>>):
        F<T,a,b,c,d,e,f> extends Array<infer U>
            ? ArrayResponse <ResultF<T,a,b,c,d,e,f>, U>
            : ObjectResponse<ResultF<T,a,b,c,d,e,f>>;
}

interface DigCollect<T> {
    <a extends string>
    (a:a&keyof NoArray<T>|'length'):ArrayResponse<ResultA<T,a>, ItemOf<ResultA<T,a>>>
    <a extends string,
        b extends string>
    (a:a&keyof NoArray<T>,
     b:b&keyof NoArrayA<T,a>|'length'):ArrayResponse<ResultB<T,a,b>, ItemOf<ResultB<T,a,b>>>
    <a extends string,
        b extends string,
        c extends string>
    (a:a&keyof NoArray<T>,
     b:b&keyof NoArrayA<T,a>,
     c:c&keyof NoArrayB<T,a,b>|'length'):ArrayResponse<ResultC<T,a,b,c>, ItemOf<ResultC<T,a,b,c>>>
    <a extends string,
        b extends string,
        c extends string,
        d extends string>
    (a:a&keyof NoArray<T>,
     b:b&keyof NoArrayA<T,a>,
     c:c&keyof NoArrayB<T,a,b>,
     d:d&keyof NoArrayC<T,a,b,c>|'length'):ArrayResponse<ResultD<T,a,b,c,d>, ItemOf<ResultD<T,a,b,c,d>>>
    <a extends string,
        b extends string,
        c extends string,
        d extends string,
        e extends string>
    (a:a&keyof NoArray<T>,
     b:b&keyof NoArrayA<T,a>,
     c:c&keyof NoArrayB<T,a,b>,
     d:d&keyof NoArrayC<T,a,b,c>,
     e:e&keyof NoArrayD<T,a,b,c,d>|'length'):ArrayResponse<ResultE<T,a,b,c,d,e>, ItemOf<ResultE<T,a,b,c,d,e>>>
}
interface DigNumber<T> {
    <a extends string>
    (a:a&(keyof NoArray<T>|'length')&MustBeNumber<NoArrayA<T,a>>):number|undefined
    <a extends string,
        b extends string>
    (a:a&keyof NoArray<T>,
     b:b&(keyof NoArrayA<T,a>|'length')&MustBeNumber<NoArrayB<T,a,b>>):number|undefined;
    <a extends string,
        b extends string,
        c extends string>
    (a:a&keyof NoArray<T>,
     b:b&keyof NoArrayA<T,a>,
     c:c&(keyof NoArrayB<T,a,b>|'length')&MustBeNumber<NoArrayC<T,a,b,c>>):number|undefined;
    <a extends string,
        b extends string,
        c extends string,
        d extends string>
    (a:a&keyof NoArray<T>,
     b:b&keyof NoArrayA<T,a>,
     c:c&keyof NoArrayB<T,a,b>,
     d:d&(keyof NoArrayC<T,a,b,c>|'length')&MustBeNumber<NoArrayD<T,a,b,c,d>>):number|undefined;
    <a extends string,
        b extends string,
        c extends string,
        d extends string,
        e extends string>
    (a:a&keyof NoArray<T>,
     b:b&keyof NoArrayA<T,a>,
     c:c&keyof NoArrayB<T,a,b>,
     d:d&keyof NoArrayC<T,a,b,c>,
     e:e&(keyof NoArrayD<T,a,b,c,d>|'length')&MustBeNumber<NoArrayE<T,a,b,c,d,e>>):number|undefined;
}
interface FilteredArray<T> extends Array<T> {
    // dig:DigFunction
    dig:DigOnFunction<T[]>
    // dig:Dig<T>
    // dig<a extends Key, T> (//object:Array<Item>,
    //                     a:a&IndexOf<T>  |Find<T>)
    //     :A<T,a> extends Array<infer U> ? ArrayResponse<ResultA<T,a>, U> : ObjectResponse<ResultA<T,a>>;
    // dig<a extends Key,
    //     b extends Key, T> (//object:T,
    //                     a:a&IndexOf<T>      |Find<T>,
    //                     b:b&IndexOf<A<T,a>> |Find<A<T,a>>)
    //     :B<T,a,b> extends Array<infer U> ? ArrayResponse<ResultB<T,a,b>, U> : ObjectResponse<ResultB<T,a,b>>;
    // dig<a extends Key,
    //     b extends Key,
    //     c extends Key, T> (//object:T,
    //                     a:a&IndexOf<T>        |Find<T>,
    //                     b:b&IndexOf<A<T,a>>   |Find<A<T,a>>,
    //                     c:c&IndexOf<B<T,a,b>> |Find<B<T,a,b>>)
    //     :C<T,a,b,c> extends Array<infer U> ? ArrayResponse<ResultC<T,a,b,c>, U> : ObjectResponse<ResultC<T,a,b,c>>;
    // dig<a extends Key,
    //     b extends Key,
    //     c extends Key,
    //     d extends Key, T> (//object:T,
    //                     a:a&IndexOf<T>          |Find<T>,
    //                     b:b&IndexOf<A<T,a>>     |Find<A<T,a>>,
    //                     c:c&IndexOf<B<T,a,b>>   |Find<B<T,a,b>>,
    //                     d:d&IndexOf<C<T,a,b,c>> |Find<C<T,a,b,c>>)
    //     :D<T,a,b,c,d> extends Array<infer U> ? ArrayResponse<ResultD<T,a,b,c,d>, U> : ObjectResponse<ResultD<T,a,b,c,d>>;
    // dig<a extends Key,
    //     b extends Key,
    //     c extends Key,
    //     d extends Key,
    //     e extends Key, T> (//object:T,
    //                     a:a&IndexOf<T>            |Find<T>,
    //                     b:b&IndexOf<A<T,a>>       |Find<A<T,a>>,
    //                     c:c&IndexOf<B<T,a,b>>     |Find<B<T,a,b>>,
    //                     d:d&IndexOf<C<T,a,b,c>>   |Find<C<T,a,b,c>>,
    //                     e:e&IndexOf<D<T,a,b,c,d>> |Find<D<T,a,b,c,d>>)
    //     :E<T,a,b,c,d,e> extends Array<infer U> ? ArrayResponse<ResultE<T,a,b,c,d,e>, U> : ObjectResponse<ResultE<T,a,b,c,d,e>>;
    // dig<a extends Key,
    //     b extends Key,
    //     c extends Key,
    //     d extends Key,
    //     e extends Key,
    //     f extends Key, T> (//object:T,
    //                     a:a&IndexOf<T>              |Find<T>,
    //                     b:b&IndexOf<A<T,a>>         |Find<A<T,a>>,
    //                     c:c&IndexOf<B<T,a,b>>       |Find<B<T,a,b>>,
    //                     d:d&IndexOf<C<T,a,b,c>>     |Find<C<T,a,b,c>>,
    //                     e:e&IndexOf<D<T,a,b,c,d>>   |Find<D<T,a,b,c,d>>,
    //                     f:f&IndexOf<E<T,a,b,c,d,e>> |Find<E<T,a,b,c,d,e>>)
    //     :F<T,a,b,c,d,e,f> extends Array<infer U> ? ArrayResponse<ResultF<T,a,b,c,d,e,f>, U> : ObjectResponse<ResultF<T,a,b,c,d,e,f>>;
    // dig(...keys:(number|string|Find)[]): any;
}
// type Response<T> = T extends Array<infer U> ? {
//     get:(Default?: T)=>T;
//     set:(Default: T)=>T;
//     delete: ()=>T;
//     create: (Default: T)=>T;
//     filter(callbackfn: (value: T, index: number, array: T[]) => any, thisArg?: any): T[];
// } : {
//     get:(Default?: T)=>T;
//     set:(Default: T)=>T;
//     delete: ()=>T;
//     create: (Default: T)=>T;
// }
// type Response<T> = T extends Array<infer U> ?
//     ObjectResponse<T> & {
//         filter<S extends T>(callbackfn: (value: T, index: number, array: T[]) => value is S, thisArg?: any): S[];
//         filter(callbackfn: (value: T, index: number, array: T[]) => any, thisArg?: any): T[];
//         forEach(callbackfn: (value: T, index: number, array: T[]) => void, thisArg?: any): void;
//         find(predicate: (value: number, index: number, obj: Int8Array) => boolean, thisArg?: any): number | undefined;
//     }
//     : ObjectResponse<T>


// export function dig<T> (object:T): T extends Array<infer U> ? ArrayResponse<T, U> : ObjectResponse<T>;
// export function dig<T,
//     a extends Key> (object:T,
//                     a:a&IndexOf<T>  |Find<T>)
//     :A<T,a> extends Array<infer U> ? ArrayResponse<ResultA<T,a>, U> : ObjectResponse<ResultA<T,a>>;
// // :Response<A<T,a>, ResultA<T,a>>;
// export function dig<T,
//     a extends Key,
//     b extends Key> (object:T,
//                     a:a&IndexOf<T>      |Find<T>,
//                     b:b&IndexOf<A<T,a>> |Find<A<T,a>>
// )
//     :B<T,a,b> extends Array<infer U> ? ArrayResponse<ResultB<T,a,b>, U> : ObjectResponse<ResultB<T,a,b>>;
// export function dig<T,
//     a extends Key,
//     b extends Key,
//     c extends Key> (object:T,
//                     a:a&IndexOf<T>        |Find<T>,
//                     b:b&IndexOf<A<T,a>>   |Find<A<T,a>>,
//                     c:c&IndexOf<B<T,a,b>> |Find<B<T,a,b>>)
//     :C<T,a,b,c> extends Array<infer U> ? ArrayResponse<ResultC<T,a,b,c>, U> : ObjectResponse<ResultC<T,a,b,c>>;
// export function dig<T,
//     a extends Key,
//     b extends Key,
//     c extends Key,
//     d extends Key> (object:T,
//                     a:a&IndexOf<T>          |Find<T>,
//                     b:b&IndexOf<A<T,a>>     |Find<A<T,a>>,
//                     c:c&IndexOf<B<T,a,b>>   |Find<B<T,a,b>>,
//                     d:d&IndexOf<C<T,a,b,c>> |Find<C<T,a,b,c>>)
//     :D<T,a,b,c,d> extends Array<infer U> ? ArrayResponse<ResultD<T,a,b,c,d>, U> : ObjectResponse<ResultD<T,a,b,c,d>>;
// export function dig<T,
//     a extends Key,
//     b extends Key,
//     c extends Key,
//     d extends Key,
//     e extends Key> (object:T,
//                     a:a&IndexOf<T>            |Find<T>,
//                     b:b&IndexOf<A<T,a>>       |Find<A<T,a>>,
//                     c:c&IndexOf<B<T,a,b>>     |Find<B<T,a,b>>,
//                     d:d&IndexOf<C<T,a,b,c>>   |Find<C<T,a,b,c>>,
//                     e:e&IndexOf<D<T,a,b,c,d>> |Find<D<T,a,b,c,d>>)
//     :E<T,a,b,c,d,e> extends Array<infer U> ? ArrayResponse<ResultE<T,a,b,c,d,e>, U> : ObjectResponse<ResultE<T,a,b,c,d,e>>;
// export function dig<T,
//     a extends Key,
//     b extends Key,
//     c extends Key,
//     d extends Key,
//     e extends Key,
//     f extends Key> (object:T,
//                     a:a&IndexOf<T>              |Find<T>,
//                     b:b&IndexOf<A<T,a>>         |Find<A<T,a>>,
//                     c:c&IndexOf<B<T,a,b>>       |Find<B<T,a,b>>,
//                     d:d&IndexOf<C<T,a,b,c>>     |Find<C<T,a,b,c>>,
//                     e:e&IndexOf<D<T,a,b,c,d>>   |Find<D<T,a,b,c,d>>,
//                     f:f&IndexOf<E<T,a,b,c,d,e>> |Find<E<T,a,b,c,d,e>>)
//     :F<T,a,b,c,d,e,f> extends Array<infer U> ? ArrayResponse<ResultF<T,a,b,c,d,e,f>, U> : ObjectResponse<ResultF<T,a,b,c,d,e,f>>;
//
// export function dig(object:any, ...keys:(number|string)[]): any {
//     return new Dig(object, keys);
// }


/**
 * Remove part of a nested object, retracing path, clearing empty objects.
 * @param obj
 * @param path
 */
export function objectPathDelete(obj, keys) {
    let refs = new Array(); // []; somehow doesn't work

    // Step inside object, storing references.
    for (let i = 0; i < keys.length; i++) {
        let key = keys[i];
        if (obj[key] == undefined) {
            return false; // path not found. can't delete.
        }
        // refs.push({parent: obj, key: key});
        refs.push({parent: obj, key: key});
        obj = obj[key];
    }
    // Now step back and delete.
    let last = refs.length - 1;
    for (let i = last; i >= 0; i--) {
        let ref = refs[i];
        if (i == last ||                      // value at latest step must go, perhaps leaving an empty object.
            isEmpty(ref.parent[ref.key])) { // empty object at earlier step must also go, perhaps leaving another empty object, etc.
            delete ref.parent[ref.key];
        }
    }
    return true;
}
export function isEmpty(obj) {
    for (let i in obj) {
        if (obj.hasOwnProperty(i)) {
            return false;
        }
    }
    return true;
}
