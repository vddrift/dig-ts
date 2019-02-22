# dig nested object selector

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
`digUp` immediately returns a value, without `.get()`. 

```typescript
import { digUp } from 'dig-ts';

// Let's say response is as above.

let first = digUp(response, 'a', 'b', 0, 'c'); // 'First'
let maybe = digUp(response, 'a', 'b', 9, 'c'); // undefined
let str   = digUp(response, ['a', 'b', 9, 'c'], 'unknown'); // 'unknown'
```
`dig` offers a lot more, but `digUp` is fine for reading only. 
As you can see, it accepts a default value, like 'unknown'. 
Just wrap the keys in an array.
The shorter format is also available in a separate small package [`digup-ts`](https://www.npmjs.com/package/digup-ts).


## Typescript support

Typescript is fully supported, so your editor points out missing properties.
```
let X = dig(response, 'X').get(); // typescript error 'X' doesn't exist...
```

## Example data

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
### Update
To set the price of first boots to 22:
```typescript
dig(store).collect('customer', 'purchases')
    .filter(purchase=>purchase.name=='boots')
    .dig(0, 'price')
    .set(10)
```

### Delete
To remove the last customer:
```typescript
dig(store, 'customer', last).delete()
```
## Array.find among keys

Use a function to find a single item in an array.
```typescript
import { dig, digUp, last } from 'dig-ts';

// Get last purchase of customer B using a function
const customerB = dig(store, 'customers', cust=>cust.name=='B', 'purchases', last).get();

// Similar with shorter format.
const customerC = digUp(store, 'customers', cust=>cust.name=='C', 'purchases', last);

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
                       .sort((a,b) => a.price==b.price? 0 : (a.price<b.price? -1 : 1);
```
In case you're wondering why `reduce` and `map` don't return a DigArray with `.dig` method: 
map and reduce can change the array content,
making it unpredictable for typescript. 

## exists 
Check if a value exists:
```typescript
if (dig(store, 'customers', 99, 'products', 0).exists()) {
    // ...welcome 100th customer, if (s)he bought anything.
}
```

## return 
Returning a custom object.
```typescript
const bootBuyers = dig(store, 'customers')
                    .filter(customer=>dig(customer, 'purchases', purchase=>purchase.name==='boots')
                    .return(customers => ({
                        count: customers.length,
                        first: customers.dig(0), 
                        last: customers.dig(last)   
                    }));
```

## Putting it all together
Here's a more complex example, using the example data above, combining several methods.
```typescript
import { dig, last } from 'dig-ts';

const summary = dig(response, 'data', 'customers')
    .return(customers => ({
        customerCount: customers.length,
        purchaseCount: customers.collect('purchases').length,
        biggestPurchase: customers.max('purchases', 'price'),
        biggestPurchaseByLastOldCustomer: customers.filter(customer=>customer.age>=60)
            .dig(last, 'products').max('price')
        ,
        topCustomer: customers.filter(cust => dig(cust).max('purchases', 'length') 
                                           == customers.max('purchases', 'length'))
                         .dig(last)
                         .return(cust=>({
                            name: cust.name,
                            ...dig(cust, 'purchases').return(purchases => ({
                                itemCount: purchases.length;
                                totalPrice: purchases.sum('price')
                            }))
                         })
        })
    );
```
summary will be:
```
{
    customerCount: 5,
    purchaseCount: 4,
    biggestPurchase: 20,
    biggestPurchaseByLastOldCustomer: 20,
    topCustomer: {
        name: 'C',
        itemCount: 2,
        totalPrice: 20
    }
}
```
Now to forget name of top client:
```typescript
dig(summary, 'topCustomer', 'customerName').delete()
```

## License

`dig-ts` is MIT Licensed.
