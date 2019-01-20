export type Purchase = {date:string, price:number, at:'online'|'store', discount?:number|null, returned?:true, payment:'cash'|{type:'credit_card', number:number}};
export type Product = {category:string, name:string, purchased: Purchase[]};
export type Pet = {name:string, age:number, products:Product[]};
export type Kid = {name:string, age:number, products:Product[]};
export type Adult = {name:string, age:number, products:Product[]};
export type Family = {
    name:string,
    pets?:Pet[],
    kids?:Kid[],
    adults?:Adult[],
};
export const families:Family[] = [
    {name:'Allen',
        pets:[
            {name:'dog', age:6, products:[
                    {category:'food', name:'Dog Munch', purchased:[
                            {date:'2019-01-02', price:1.99, at:'online', discount:1, payment:{type:'credit_card', number:111}},
                            {date:'2019-01-03', price:2.99, at:'store',  discount:null, payment:'cash', returned:true},
                        ]},
                    {category:'food', name:'Munch', purchased:[
                            {date:'2019-01-01', price:2.99, at:'store',  payment:{type:'credit_card', number:321}},
                        ]},
                    {category:'toy', name:'ball', purchased:[
                            {date:'2019-01-02', price:4.99, at:'store',  payment:{type:'credit_card', number:111}},
                        ]},
                ]
            },
            {name:'cat', age:3, products:[
                    {category:'food', name:'Cat Munch', purchased:[
                            {date:'2019-01-01', price:2.99, at:'store',  discount:null, payment:{type:'credit_card', number:111}},
                            {date:'2019-01-03', price:2.99, at:'store',  payment:'cash', returned:true},
                        ]},
                    {category:'food', name:'Munch', purchased:[
                            {date:'2019-02-01', price:2.99, at:'store',  payment:{type:'credit_card', number:321}},
                        ]},
                ]
            },
        ],
        kids: [
            {name:'Aaron', age:6, products:[
                    {category:'toy', name:'ball', purchased:[
                            {date:'2019-01-02', price:12.99, at:'store', payment:{type:'credit_card', number:111}},
                        ]}
                ]},
            {name:'Alice', age:9, products:[
                    {category:'toy', name:'Drone', purchased:[
                            {date:'2019-01-02', price:20.99, at:'store', payment:{type:'credit_card', number:111}},
                            {date:'2019-02-03', price:20.99, at:'online', payment:{type:'credit_card', number:111}, returned: true},
                        ]}
                ]},
        ],
        adults: [
            {name:'Adam', age:35, products:[
                {category:'beverage', name:'beer', purchased:[
                    {date:'2019-01-02', price:2.99, at:'store', payment:{type:'credit_card', number:111}},
                    {date:'2019-01-03', price:2.99, at:'store', payment:'cash'},
                ]},
                {category:'food', name:'Man Munch', purchased:[
                    {date:'2019-01-02', price:5.99, at:'online', payment:{type:'credit_card', number:111}},
                ]}
            ]},
            {name:'Anna', age:36, products:[
                {category:'toy', name:'Drone', purchased:[
                    {date:'2019-01-03', price:2.99, at:'online', payment:{type:'credit_card', number:111}, returned: true},
                ]},
                {category:'food', name:'Lady Munch', purchased:[
                    {date:'2019-01-02', price:5.89, at:'online', payment:{type:'credit_card', number:111}},
                ]}
            ]},
        ]},
    {name:'Baker',
        pets:[
            {name:'fish', age:1, products:[
                {category:'food', name:'Munch', purchased:[
                    {date:'2019-01-01', price:2.99, at:'store',  payment:{type:'credit_card', number:222}},
                ]}]},
            {name:'cat', age:3, products:[
                {category:'food', name:'Cat Munch', purchased:[
                    {date:'2019-02-01', price:3.99, at:'store',  payment:{type:'credit_card', number:222}},
                    {date:'2019-02-03', price:3.99, at:'store',  payment:'cash', returned:true},
                ]},
                {category:'toy', name:'ball', purchased:[
                    {date:'2019-01-01', price:4.99, at:'store',  discount:null, payment:{type:'credit_card', number:222}},
                ]}]}],
        kids: [
            {name:'Becky', age:16, products:[
                {category:'toy', name:'ball', purchased:[
                    {date:'2019-01-02', price:5.99, at:'store', payment:{type:'credit_card', number:222}},
                ]}]},
            {name:'Brenda', age:19, products:[
                {category:'toy', name:'Drone', purchased:[
                    {date:'2019-02-02', price:20.99, at:'store', payment:{type:'credit_card', number:222}},
                    {date:'2019-01-03', price:20.99, at:'online', payment:{type:'credit_card', number:222}, returned: true},
                ]}]},
        ],
        adults: [
            {name:'Ben', age:45, products:[
                {category:'beverage', name:'beer', purchased:[
                    {date:'2019-02-02', price:1.99, at:'store', payment:{type:'credit_card', number:222}},
                    {date:'2019-01-03', price:1.99, at:'store', payment:'cash'},
                ]},
                {category:'food', name:'Man Munch', purchased:[
                    {date:'2019-02-02', price:5.99, at:'online', payment:{type:'credit_card', number:222}},
                ]}
            ]},
            {name:'Beth', age:46, products:[
                {category:'beverage', name:'beer', purchased:[
                    {date:'2019-02-02', price:2.99, at:'online', payment:{type:'credit_card', number:222}},
                ]},
                {category:'food', name:'Lady Munch', purchased:[
                    {date:'2019-01-02', price:5.89, at:'online', payment:{type:'credit_card', number:222}},
                    {date:'2019-01-02', price:4.89, at:'store', payment:'cash'},
                ]}
            ]},
        ]},
    // {name:'Cooper',
    //     pets:[
    //         {type:'dog', age:3, products:[
    //             {category:'food', name:'Dog Munch', purchased:[
    //                 {date:'2019-02-01', price:3.99, at:'online',  payment:{type:'credit_card', number:222}},
    //                 {date:'2019-02-03', price:3.99, at:'store',  payment:'cash', returned:true},
    //                 {date:'2019-02-03', price:3.99, at:'store',  payment:'cash', returned:true},
    //                 {date:'2019-02-03', price:3.99, at:'store',  payment:'cash', returned:true},
    //                 ]}]}],
    //     kids: [],
    //     adults: [
    //         {name:'Charles', age:55, products:[
    //             {category:'beverage', name:'wine', purchased:[
    //                 {date:'2019-02-02', price:5.99, at:'store', payment:{type:'credit_card', number:333}},
    //             ]},
    //             {category:'food', name:'Man Munch', purchased:[
    //                 {date:'2019-02-02', price:5.99, at:'online', payment:{type:'credit_card', number:333}},
    //             ]}
    //         ]},
    //     ]
    // }
];
