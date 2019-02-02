# digup nested object selector

`dig-ts` handles nested objects and arrays,
without throwing error `Cannot read property 'x' of undefined`.

#### Features
- Typescript support, for proper code-completion while coding.
- Supported by all browsers 
- Light weight
- Supports arrays, nested get, set, delete.
- Transform any structure to any other with find, filter and many other features.

#### Install

```bash
npm i --save dig-ts
```

#### Requirements

- TypeScript >= 2.9

## Example `dig` Usage

```typescript
import { dig } from 'dig-ts';

// Let's pretend abc is unpredictable and maybe incomplete.
const response = {a:
                    {b: [
                          {c: 'First'}, 
                          {c: 'Second'}
                        ]
                    }
                  };

let first = dig(response, 'a', 'b', 0, 'c').get(); // 'First'
let maybe = dig(response, 'a', 'b', 9, 'c').get(); // undefined
let str   = dig(response, 'a', 'b', 9, 'c').get('unknown'); // 'unknown'

```

#### shorter format
`digup` immediately returns a value, without `.get()`. 

```typescript
import { digup } from 'dig-ts';

// Let's say response is as above.

let first = digup(response, 'a', 'b', 0, 'c'); // 'First'
let maybe = digup(response, 'a', 'b', 9, 'c'); // undefined
let str   = digup(response, ['a', 'b', 9, 'c'], 'unknown'); // 'unknown'
```
`dig` offers a lot more, but `digup` is fine for reading only. 
As you can see, it accepts a default value, like 'unknown'. 
Just wrap the keys in an array.
The shorter format is also available in a separate small package [`ts-digup`](https://www.npmjs.com/package/ts-digup).


## Typescript support

Typescript is fully supported, so your editor points out missing properties.
```
let X = dig(response, 'X').get(); // typescript error 'X' doesn't exist...
```

## Array find
Use a function to find a single item in an array.
```
import { dig, last } from 'dig-ts';

const store = {
    customers: [  // some are incomplete
        {name:'A'},
        {name:'B', purchases: 1},
        {name:'C', purchases: 5,  viewIds:[3, 1, 2]}
        {name:'D', purchases: 10, viewIds:[8, 7, 5, 6]}
    ]
}

const customerB = dig(store, 'customers', cust=>cust.name=='B').get();

// 'last' function is included in dig-ts
const lastOne   = dig(store, 'customers', last).get();

// digup also accepts functions
const customerC = digup(store, 'customers', cust=>cust.name=='C');
```

## Array filter
```
// Let's take 'store' from above.

// Who bought more than 3 things?
const goodCustomers = dig(store, 'customers')
                         .filter(cust=>customer.purchases > 3);

const firstOne  = dig(store, 'customers', 0).get();
const customerB = dig(store, 'customers', cust=>cust.name=='B').get();

// digup also accepts functions
const customerC = digup(store, 'customers', cust=>cust.name=='C');

// 'last' function is included in dig-ts
const lastOne   = dig(store, 'customers', last).get();

```
Some more complex examples
```
store.products = [
    {id:1, name: 'sneakers'},
    {id:2, name: 'flipflops'},
    {name: 'flopsneakers'} // incomplete
];

```

## Alternatives
Logical expressions are very verbose for long paths.
```
let c2 = (abc.a && abc.a.b && abc.a.b[9] && abc.a.b[9].c) || 'C-9'
```
[`Lodash`](https://lodash.com/) `get(...)` is more compact, 
but removes typescript support.

```typescript
import { get } from 'lodash';

let c9 = get(abc, 'a.b[1].c', 'C-1');
```

[`ts-optchain`](https://www.npmjs.com/package/ts-optchain) preserves typescript typings and has an elegant syntax. 
Unfortunately it requires Proxy. 
Please consider this option if the [browser support](https://caniuse.com/#search=proxy) suits your project.

```typescript
import { oc } from 'ts-optchain';

let c1 = oc(abc).b.c('C-1');
```
With [`ts-safe`](https://www.npmjs.com/package/ts-save) you provide an anonymous function and optional default value. Any runtime errors are caught and ignored. However, optional properties might be a problem. Full disclosure: I wrote ts-safe.
```typescript
import { safe } from 'ts-safe';

let abc = {a:{b:{c:'C'}}}; // Let's pretend abc isn't so predictable.

let c = safe(_=>a.b.c, 'C-default');
```
More alternatives:

- https://github.com/facebookincubator/idx
- https://github.com/yayoc/optional-chain

### Type Preservation

`dig-ts` preserves TypeScript typings and code-completion by IDEs like Visual Studio Code or WebStorm.

```typescript
const abc = {a: {b: {c: 'C'}}};

let b = digup(_=> abc.a.b, {c:'C default'});

console.log(b.c) // When typing 'b' your code editor suggests '.c'
```


### Optional properties

To traverse optional properties, wrap your object in the `all` function, included in `ts-digup`. 
```typescript
import { digup } from 'dig-ts';

// Everything is optional.
type ABCDE = {a?: {b?: {c?: {d?: {e?: string}}}}}
const abc:ABCDE = {
    a:{
        b: {
            c: {} // incomplete.
        }
    }
};

let e1 = digup(abc, 'a', 'b', 'c', 'd');
```

Note: the `all` function tells typescript all (nested) properties exits. 
This affects the return value. For instance, using `abc` from before: 
```typescript
// 'all' tells typescript not to worry whether anything exists.
let c = digup(_=> all(abc).a.b.c);

if (c) {
    // When c exists, typescript falsely assumes d and e exist.
    console.log(c.d.e); // RUNTIME error: Cannot read property
    
    // This works. Typscript normally enforces this. Now it's up to you. 
    if (c.d) {
        console.log(c.d.e);
    }
}
```
Please keep this in mind when using optional properties.

## License

`dig-ts` is MIT Licensed.
