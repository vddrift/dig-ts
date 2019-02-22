export const store = {
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
