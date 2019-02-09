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
The shorter format is also available in a separate small package [`digup-ts`](https://www.npmjs.com/package/digup-ts).


## Typescript support

Typescript is fully supported, so your editor points out missing properties.
```
let X = dig(response, 'X').get(); // typescript error 'X' doesn't exist...
```

## Array find

The examples below all use the following data:
```typescript
const store = {
    customers: [
        {name: 'A', age:20}, // missing purchases
        {name: 'B', // missing age
            purchases: [
                {name: 'shoes', price:10}
            ]
        },
        {name: 'C', age:60,
            purchases: [
                {name: 'flipflops'}, // missing price
                {name: 'boots', price:20}
            ]
        },
        {}, // missing name + purchases
        {purchases: [{name: 'boots', price:20}]} // missing name
    ]
}
```
## Array.find among keys

Use a function to find a single item in an array.
```typescript
import { dig, last } from 'dig-ts';

// Get customer B using a function
const customerB = dig(store, 'customers', cust=>cust.name=='B').get();

// Similar with shorter format.
const customerC = digup(store, 'customers', cust=>cust.name=='C');

// Get price of boots of customer C (or 0 if not found)
const price = dig(store, 'customers', cust=>cust.name=='C', 'purchases', pur=>pur.name=='boots', 'price').get(0);

// 'last' function is included in dig-ts
const lastSale = dig(store, 'customers', last, 'purchases', last).get(); // boots object

```

## `Array.filter`, `Array.sort` and chaining

```typescript
// Let's take 'store' from above.

// 1. Who bought expensive stuff?
const goodCustomers = dig(store, 'customers')
                        .filter(customer=>
                            dig(customer, 'purchases')
                                .some(purchase=>purchase.price>10)
                            );

// 2. Which expensive products were made by the last old customer?
const bigOldSales = dig(store, 'customers')
                       .filter(customer=>customer.age>=60)
                       .dig(last, 'products')
                       .filter(product=>product.price>10);

// 3. What was the name of that last once?
bigSales.dig(last, 'name').get();

```
As you can tell by examples 2 and 3 above, 
the `.dig` method is added to the result of `filter` and `sort`. 
This allows us to keep on digging, aka [method chaining](https://schier.co/blog/2013/11/14/method-chaining-in-javascript.html):

```typescript
const bigOldSales = dig(store, 'customers')
                       .filter(customer=>customer.age>=60)
                       .dig(last, 'products')
                       .sort((a,b)=>a>b?-1:1)
                       .dig(0, 'name').get();
```
In case you're wondering why `reduce` and `map` don't return a DigArray with `.dig` method: 
map and reduce can change the array content,
making it unpredictable for typescript. 

## exists 
Check if a value exists:
```typescript
if (dig(store, 'customers', 99, 'products', 0).exists()) {
    // ...welcome 100th customer (if he/she bought anything).
}
```

## return 
Make custom object
```typescript
const bootBuyers = dig(store, 'customers')
                    .filter(customer=>dig(customer, 'purchases', purchase=>purchase.name==='boots')
                    .return(customers => ({
                        count: customers.length,
                        first: customers.dig(0), 
                        last: customers.dig(last)   
                    }));
                    
}
```

## Alternatives
Here are some alternatives, only for reading nested data.

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
