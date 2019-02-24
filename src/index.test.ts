import {dig, digUp, last, max} from './index';
import {families} from './sample-data/families';

describe('digUp', () => {
    const abc = {
        a: {
            b: {
                c: 'C',
            },
        }
    };
    const abc_untyped = <any>abc; // used to avoid typescript errors below.
    let a, b, c, d;

    it('should recieve keys as an array.', () => {
        b = digUp(abc, ['a', 'b']);
        // console.log(b.c); // uncomment for typescript error: Object possibly undefined
        if (b) { // let typescript exclude 'undefined', because there's no default.
            // console.log(b.d); // uncomment for typescript error: Property 'd' does not exist
            expect(b.c).toEqual('C'); // type digUp. c is suggested by IDE.
        } else {
            fail('b not set')
        }
    });
    it('should get nested property.', () => {
        b = digUp(abc, 'a', 'b');
        // console.log(b.c); // uncomment for typescript error: Object possibly undefined
        if (b) { // let typescript exclude 'undefined', because there's no default.
            // console.log(b.d); // uncomment for typescript error: Property 'd' does not exist
            expect(b.c).toEqual('C'); // type digUp. c is suggested by IDE.
        } else {
            fail('b not set')
        }
    });
    it('should handle arrays', () => {
        let c;
        type ABC_arr = {
            a: {
                b_arr: [
                    {c: string}
                ]
            }
        };
        let abc_arr:ABC_arr = {a:{b_arr:[{c:'C'}]}};
        c = digUp(abc_arr, 'a', 'b_arr', 0, 'c');
        expect(c).toEqual('C');
    });
    it('should use default when propery not found.', () => {
        // uncomment for typescript error: Property 'd' does not exist
        // digUp(_ => abc.a.b.c.d.e, 'E');

        d = dig(abc_untyped, 'a', 'b', 'c', 'd').get('D');
        expect(d).toEqual('D');
    });
    it('should use undefined when propery not found and default missing.', () => {
        d = digUp(abc_untyped, 'a', 'b', 'c', 'd');
        expect(d).toBeUndefined();
    });

    it('should accept default:any, even if it\'s undefined', () => {
        let undefinedAny: any = undefined;
        let z = dig(abc_untyped, 'z').get(undefinedAny); // No typescript error because :any
        expect(z).toBeUndefined();
        //
        // let undefinedNumber: number|undefined = undefined;
        // z = dig(abc_untyped, 'z').get(<any>undefinedNumber); // No typescript error because <any>
        // expect(z).toBeUndefined();

        // <any> tells typescript to ignore an invalid default, when you're too lazy to write proper types.
        // b = digUp(abc, 'a', 'b');
        // if (b) {
        //     expect(b.c).toEqual('C');
        // }
        // b = dig(abc, 'a', 'b3').get(<any>{b:{c:'1'}});
        b = dig(abc, 'a', 'b').get({c:'1?'});
        expect(b.c).toEqual('C');
    });
    it('should not accept an incompatible default.', () => {

        // uncomment for error. invalid default.
        // const ab: {a:{b:{c:string}}} = {a:{b:{c:'c'}}};
        // a = dig(ab, 'a').get({b:{}}); // property 'c' is missing

        // uncomment for error. invalid default.
        // const abc: {a:{b:{c:string}}} = {a:{b:{c:'c'}}}
        // a = dig(abc, 'a', 'b', 'c').get(1); // not assignable to number
    });
    it('should accept valid default.', () => {

        // valid default because c is optional.
        const abc_optional: {a:{b:{c?:string}}} = {a:{b:{c:'C'}}};
        a = dig(abc_optional, 'a').get({b:{}});
        expect(a.b.c).toEqual('C');

    });
    it('should make discriminated unions', () => {
        // About discriminated unions: https://basarat.gitbooks.io/typescript/docs/types/discriminated-unions.html
        const abcExtra = {
            a: {
                b: {
                    c: 'C',
                    cExtra: 'Only in abcExtra', // not available when combined with abc.
                },
            }
        };
        const combined  = dig(abc, 'a', 'b').get(abcExtra.a.b);
        expect(combined.c).toEqual('C');
        // expect(combined.cExtra).toEqual('Only in abcExtra'); // uncomment for typscript error: c_extra does not exist.

        // const combinedReverse = dig(abcExtra, 'a', 'b').get(abc.a.b);// uncomment for typscript error: c_extra is missing.

        const single = digUp(abcExtra, 'a');
        // expect(single.b.c).toEqual('C from abcExtra'); // uncomment for typescript error: Object is possibly 'undefined'
        if (single) { // avoid typescript error
            expect(single.b.cExtra).toEqual('Only in abcExtra');
        } else {
            fail('single not set')
        }
    });
    it('should handle optional properties', () => {
        interface AbcOptional {
            a?:{b?:{c?:{d?:string}}}
        }
        const maybeAbc: AbcOptional = {
            a: {
                b: { // optional
                    c: {
                        d:'D'
                    },
                },
            }
        };
        // c = digUp(_ => maybeAbc.a.b.c); // uncomment for typescript error: object is possibly 'undefined'

        // Make all (nested) properties required
        c = digUp(maybeAbc, 'a', 'b', 'c');
        if (c) { // avoid typescript error
            expect(c.d).toEqual('D');
        } else {
            fail('c not set')
        }
    });
   it('unfortunately fails to check optional properties, as a result of all()', () => {

       type ABCDE = {a?: {b?: {c?: {d?: {e?: string}}}}}
       const abcde:ABCDE = {
           a: {
               b: {
                   c: {}
               }
           }
       };

       c = digUp(abcde, 'a', 'b', 'c');
       if (c) {
           // console.log(c.d.e); // uncomment for ts error: Object is possibly 'undefined'
       } else {
           fail('c not set')
       }
    });
   it('should work', () => {
        // type C = {d?: {e?: string}};
        // type B = {c?: C};
        // type ABCDE = {a?: {b?: B}};
        type ABCDE = {a?: {b?: {c?: {d?: {e?: {f?: {}}}}}}};
        const abcde:ABCDE = {
        // const abcde = {
            a: {
                b: {
                    c: {}
                }
            }
        };
        // abcde.a.b;
        if(abcde.a) {
            // abcde.a.b.c; // uncomment for ts error: Object is possibly 'undefined'
            if (abcde.a.b) {
                // abcde.a.b.c.d;
                if (abcde.a.b.c) {
                    // abcde.a.b.c.d.e;
                }
            }
        }

        a = digUp(abcde, 'a');
        // a = abcde.a;
        if (a) {
            if (a.b) {
                if (a.b.c) {
                    a.b.c.d;
                    if (a.b.c.d) {
                        a.b.c.d.e;
                    }
                }
            }
        }
        b = digUp(abcde, 'a', 'b');
        if (b!==undefined) {
            if (b.c) {
                if (b.c.d) {
                    if(b.c.d.e) {}
                }
            }
        }
        c = digUp(abcde, 'a', 'b', 'c');
        if (c) {
            if (c.d) {
                c.d.e;
                if (c.d.e) {}
            }
        }
        d = digUp(abcde, 'a', 'b', 'c', 'd'); // pathFind / pathFind / digUp / deepProp
        if (d) {
            // d.e.f; //
            if (d.e) {
                d.e.f;
                if (d.e) {
                    d.e.f;
                }
            }
        }
        let cc2 = digUp(abcde, 'a', 'b', 'c');
        if (cc2!==undefined) {
            expect(cc2.d).toBeUndefined();
            cc2.d;
            if (cc2.d) {
                cc2.d.e;
            }
        } else {
            fail('c2 not set')
        }
       let d_default = {e:{}};
       d = dig(abcde, 'a', 'b', 'c', 'd') // pathEither or deepEither or
           .get(d_default);
       expect(d).toEqual({e:{}})
    });
    it('should use digUp-ts', () => {
        interface Money {
            amount: number;
            currency: string;
        }
        interface PricePerPax {
            travelerId?: string;
            price?: Money;
        }
        interface OfferPriceBreakdown {
            totalPricePerPax?: PricePerPax[];
        }
        interface OrderItem {
            // orderItemPriceBreakdown?: OfferPriceBreakdown;
            orderItemPriceBreakdown: OfferPriceBreakdown;
        }
        const OI: OrderItem = //JSON.parse(`
            {orderItemPriceBreakdown: {
              totalPricePerPax: [
                  {
                      travelerId: 'AA',
                      price: {
                          amount: 105.8,
                          currency: 'EUR'
                      }
                  }
              ]
          }
        };
        // `);
        // const def = [{
        //     travelerId: 'AA',
        //     price: {
        //         amount: 105.8,
        //         currency: 'EUR'
        //     }
        // }];
        // const tppp: PricePerPax[] = digUp(_ => all(OI).orderItemPriceBreakdown.totalPricePerPax, def);
        const tppp: PricePerPax[] = digUp(OI, 'orderItemPriceBreakdown', 'totalPricePerPax') || [];
        if (tppp) {
            // const pricePerPax: PricePerPax = tppp.find(
            //     ppp => ppp.travelerId === 'AA'
            // ) || {};
            const pricePerPax:PricePerPax = {
                travelerId: 'a',
                price: {
                    amount: 105.8,
                    currency: 'EUR'
                }
            };

            // const price:Money|undefined = digUp(pricePerPax, 'price');
            const price:Money = digUp(pricePerPax, 'price') || {amount:1, currency:'EUR'};
            // const price:Money = dig(pricePerPax, 'price').get({amount:1, currency:'EUR'});
            // const price = pricePerPax.price;
            if (price) {
                price.amount
            }
        } else {
            fail('tppp not set')
        }
        return;
        // const e = digUp(_ => abc.a.b.c.d.e);
        // expect(e).toBeUndefined();
    });
    it('should set a nested value', () => {
        const abc:{a:{b:{c:number}}} = {a:{b:{c:0}}};
        dig(abc, 'a', 'b', 'c').set(1);
        expect(abc.a.b.c).toEqual(1);
    });
    it('should set a nested value while creating nested objects', () => {
        const abc:{a?:{b?:{c?:number}}} = {};
        dig(abc, 'a', 'b', 'c').set(1);
        expect(abc).toEqual({a:{b:{c:1}}});
    });
    it('should set a nested object property while creating nested objects+arrays', () => {
        const abc:Array<{a?:Array<{b?:Array<{c?:number}>}>}> = [];
        dig(abc, 0,'a', 0,'b', 0,'c').set(1);
        expect(abc).toEqual([{a:[{b:[{c:1}]}]}]);
    });
    it('should replace a nested array while creating nested objects+arrays', () => {
        const abc:Array<{a?:Array<{b?:Array<{c?:[number]}>}>}> = [];
        dig(abc, 0,'a', 0,'b', 0,'c').set([1]);
        expect(abc).toEqual([{a:[{b:[{c:[1]}]}]}]);
    });
    const people = [{id:1,name:'a'}, {id:2,name:'b'}, {id:3,name:'c'}];
    it('should use Array.find', () => {
        const nameOfId1 = dig(people, item=>item.id==1, 'name').get();
        expect(nameOfId1).toEqual('a');
    });
    it('should use Array.find last', () => {
        const nameOfLast = dig(people, last, 'id').get();
        expect(nameOfLast).toEqual(3);
    });

    it('should filter', () => {
        const oldPets = dig(families, 0, 'pets').filter(pet=>pet.age>4);
        expect(oldPets.length).toEqual(1);
        expect(oldPets[0].name).toEqual('dog');
        const productsOfOldDog = dig(families, 0, 'pets')
                        .filter(pet=>pet.age>4)
                        .dig(0, 'products').get([]);
        expect(productsOfOldDog.length).toEqual(3);
    });
    it('should work with :any', () => {
        const abc:any = {};
        dig(abc, 'a', 'b', 'c').set(2);
        expect(abc).toEqual({a:{b:{c:2}}});
    });
    it('should get length from array', () => {
        expect(digUp([], 'length')).toEqual(0);
    });
    it('should set property, while creating necessary objects/arrays', () => {
        const abc = <any>{};
        dig(abc, 'a', 'b', 'c').set(2);
        expect(abc).toEqual({a:{b:{c:2}}});
    });
    it('should delete property, while deleting unecessary objects', () => {
        const abc = <{a:{b:{c:number}}}>{};
        dig(abc, 'a', 'b', 'c').set(2);
        dig(abc, 'a', 'b', 'c').delete();
        expect(abc).toEqual({});
    });
    it('should keep empty objects, after delete, when uncreate is false', () => {
        const abc = <{a:{b:{c:number}}}>{};
        dig(abc, 'a', 'b', 'c').set(2);
        dig(abc, 'a', 'b', 'c').delete(false);
        expect(abc).toEqual({a:{b:{}}});
    });
    it('should keep non-empty objects, after delete.', () => {
        const abc = <{a:{b:{c:number}, b2:number}}>{a:{b2:1}};
        dig(abc, 'a', 'b', 'c').set(2);
        dig(abc, 'a', 'b', 'c').delete();
        expect(abc).toEqual({a:{b2:1}});
    });
    it('should remove empty parent array, after delete', () => {
        const abc:{a:{b:{c:number}[]}[]}[] = [{a:[{b:[{c:1}]}]}];
        dig(abc, 0, 'a', 0, 'b', 0, 'c').set(111);
        dig(abc, 0, 'a', 0, 'b', 0, 'c').delete();
        expect(abc).toEqual([]);
    });
    it('should remove empty parent arrays/objects, after delete', () => {
        const abc:{a:{b:{c:number}[]}[]}[] = [{a:[{b:[{c:1}]}]}];
        dig(abc, 0, 'a', 0, 'b', 0, 'c').set(111);
        dig(abc, 0, 'a', 0, 'b', 0, 'c').delete();
        expect(abc).toEqual([]);
    });
    it('should keep non-empty arrays+object, after delete', () => {
        const abc:{a:{b:{c:number}[]}[]}[] = [{a:[{b:[{c:1},{c:2}]}]}];
        dig(abc, 0, 'a', 0, 'b', 0, 'c').set(111);
        dig(abc, 0, 'a', 0, 'b', 0, 'c').delete();
        expect(abc).toEqual([{a:[{b:[{c:2}]}]}]);
    });
    it('should inherit array methods', () => {
        const abc:{a:number}[] = [{a:1}];
        const newLength = dig(abc).push({a:2});
        expect(newLength).toEqual(2)
        // expect(abc).toEqual([{a:1},{a:2}])
    });
    it('should keep non-empty arrays+object, after delete', () => {
        // const abc:{a:{b:{c:number}[]}[]}[] = [{a:[{b:[{c:1},{c:2}]}]}];
        // const abc:any = [{a:[{b:[{c:1},{c:2}]}]}];
        // dig(abc, 0, 'a',0,'b').delete();
        // dig(abc, 0, 'a',0,'b').push(1);
    });
    it('should use exits', () => {
        type ABC = {a:{b:{c:number}[]}[]}[]
        let abc:ABC = [{a:[{b:[{c:1},{c:2}]}]}];
        const b1 = dig(abc, 0, 'a', 0, 'b', 1).exists();
        const b9 = dig(abc, 0, 'a', 0, 'b', 9).exists();
        const b  = dig(abc, 0, 'a', 0, 'b').exists();
        expect(b1).toBe(true);
        expect(b9).toBe(false);
        expect(b).toBe(true);
        abc = [];
        const c  = dig(abc, 0, 'a', 0, 'b', 0, 'c').exists();
        expect(c).toBe(false);
    });
    it('should collect various values', () => {
        type ABC = Array<{ a: { b: Array<{ c: number }> } }>
        const abc: ABC = [
            {a: {b: [{c: 1}, {c: 2}]}},
            {a: {b: [{c: 3}, {c: 4}]}}
        ];
        const Cs = dig(abc).collect('a', 'b', 'c');
        expect(Cs).toEqual([1, 2, 3, 4]);
    });
    it('should collect various arrays', () => {
        type ABCarr = Array<{a:{b:Array<{c:Array<number>}>}}>
        const abcArr:ABCarr = [
            {a:{b:[{c:[1]},{c:[2]}]}},
            {a:{b:[{c:[3]},{c:[4]}]}}
        ];
        const CsArr = dig(abcArr).collect('a', 'b', 'c');
        expect(CsArr).toEqual([[1],[2],[3],[4]]);
    });
    it('should collect various array lengths', () => {
        type ABCarr = Array<{a:{b:Array<{c:Array<number>}>}}>
        const abcArr:ABCarr = [
            {a:{b:[{c:[1]},{c:[2]}]}},
            {a:{b:[{c:[3]},{c:[4,5,6]}]}}
        ];
        const CsArr = dig(abcArr).collect('a', 'b', 'c', 'length');
        expect(CsArr).toEqual([1,1,1,3]);
    });
    it('should find min, max, avg', () => {
        const abc:{a:{b:{c:number|undefined|string}[]}[]}[] = [
            {a:[{b:[{c:1},
                    {c:'2'},
                    {c:2},
                    {c:'3'},
                    {c:undefined}]
                }]
            }];
        const maxC = dig(abc).max('a', 'b', 'c');
        expect(maxC).toBe(3);
        const minC = dig(abc).min('a', 'b', 'c');
        expect(minC).toBe(1);
        const avgC = dig(abc).avg('a', 'b', 'c');
        expect(avgC).toBe(2); // (1+2+2+3)/4 = 8/4=2
        // const avgCs = dig(abc).collect('a', 'b', 'c').filter(avg);
    });
    fit('should filter min, max', () => {
        const abc:{a:{b:{c:number|undefined|string}}[]}[] = [
            {a:[{b:{c:1}}]},
            {a:[{b:{c:3}}]},
            {a:[{b:{c:2}}]},
            {a:[{b:{c:3}}]},
        ];
        // const b = dig(abc).collect('a', 'b');
        // const BwithMaxC = b.filter2(max('c'));
        const Cmax = dig(abc).collect('a').max('b', 'c');
        expect(Cmax).toEqual(3);
        const b = dig(abc).collect('a', 'b');
        const firstMax = b.find(max('c'));
        expect(firstMax).toEqual({c:3});
        const allMax = b.filter(max('c'));
        // expect(allMax).toEqual([{c: 3}, {c: 3}]); --> won't work because allMax array also has .dig method.
        expect(JSON.stringify(allMax)).toEqual(JSON.stringify([{c: 3}, {c: 3}]));

    });
});

