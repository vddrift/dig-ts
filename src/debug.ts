import {
    dig,
    digUp,
    ItemOf, last,
    NoArray,
    ValueOf
} from './index';
import {families} from './sample-data/families';

// internal types copied from index.ts
type Find<T>   = (value: ItemOf<T>, index?:number, array?:T) => boolean
type NoArrayA<T,a>         = NoArray<ValueOf<NoArray <T>,a>>
type NoArrayB<T,a,b>       = NoArray<ValueOf<NoArrayA<T,a>,b>>;
type NoArrayC<T,a,b,c>     = NoArray<ValueOf<NoArrayB<T,a,b>,c>>;
type NoArrayD<T,a,b,c,d>   = NoArray<ValueOf<NoArrayC<T,a,b,c>,d>>;
// type NoArrayE<T,a,b,c,d,e> = NoArray<ValueOf<NoArrayD<T,a,b,c,d>,e>>;

const aoooo = [{a:{b:{c:{d:1}}}}];          aoooo[0] .a  .b .c  .d;
const ooooo = {a:{b:{c:{d:{e:1}}}}};        ooooo.a  .b  .c .d  .e;
const oaoao = {a:[{b:[{c:1}]}]};            const c0:number = oaoao.a  [0] .b [0] .c; c0;
const oaoaoAny = JSON.parse('{a:[{b:[{c:1}]}]}');            oaoaoAny.a.b.c.d[0][1][2];
let o;
const oBranch = {
    a1:{
        b1_1:'1.1',
        b1_2:'1.2'
    },
    a2:{
        b2_1:'2.1',
        b2_2:'2.2'
    },
}; oBranch.a1.b1_1;
type maybeA = {a?:maybeB};
type maybeB = {b?:maybeC};
type maybeC = {c?:maybeD};
type maybeD = {d?:number};
const maybeA:maybeA = {};
type maybeAs = {a?:maybeBs}[];
type maybeBs = {b?:maybeCs}[];
type maybeCs = {c?:maybeDs}[];
type maybeDs = {d?:number}[];
const maybeABC:maybeAs = [{a:[{b:[{c:[{d:1}]}]}]}];
if (maybeABC[0]!==undefined) {
    if (maybeABC[0].a==undefined) {
        const o1 = maybeABC[0].a;
        if (o1) {
            if (o1[0]) {

            }
        }
    }
}
function max<T, a extends string>(obj:T, a:a&keyof NoArray<T>):number
function max<T,
    a extends string,
    b extends string>(obj:T,
                      a:a&keyof NoArray<T>,
                      b:b&keyof NoArrayA<T,a>): number
function max<T,
    a extends string,
    b extends string,
    c extends string>(obj:T,
                      a:a&keyof NoArray<T>,
                      b:b&keyof NoArrayA<T,a>,
                      c:c&keyof NoArrayB<T,a,b>): number
function max<T,
    a extends string,
    b extends string,
    c extends string,
    d extends string>(obj:T,
                      a:a&keyof NoArray<T>,
                      b:b&keyof NoArrayA<T,a>,
                      c:c&keyof NoArrayB<T,a,b>,
                      d:d&keyof NoArrayC<T,a,b,c>): number
function max<T,
    a extends string,
    b extends string,
    c extends string,
    d extends string,
    e extends string>(obj:T,
                      a:a&keyof NoArray<T>,
                      b:b&keyof NoArrayA<T,a>,
                      c:c&keyof NoArrayB<T,a,b>,
                      d:d&keyof NoArrayC<T,a,b,c>,
                      e:e&keyof NoArrayD<T,a,b,c,d>): number
function max (obj:any, a:any, ...rest:any[]) {
    console.log(rest);
    while(obj instanceof Array) {obj=obj[0]}
    return obj[a];
}
type Abc = {b?:{c:{d:number}[]}[]}[];
const Abc:Abc= [{b:[{c:[{d:1}]}]}];
type AAbc = Array<Array<{b:{c:{d:number}[]}}>>;
const AAbc:AAbc= [[{b:{c:[{d:1}]}}]]; AAbc[0][0].b.c;
//*FAIL*/let b2:number = max(AAbc, 'b'); b2; b2.toPrecision(); AAbc[0][0].b.c[0].d.toString();
//*FAIL*/let b3:number = max(AAbc, 'b', 'c'); b3.toString();
let b4:number = max(AAbc, 'b', 'c', 'd'); b4;
const b:NoArray<AAbc> = AAbc[0][0]; b.b.c;
const c:keyof NoArray<AAbc> = 'b'; c;
type b = 'b'
const c2:keyof NoArray<AAbc> = 'b'; c2;
const c3:NoArrayA<AAbc,b> = AAbc[0][0].b; c3.c[0].d;
digUp(maybeA, 'a', 'b', 'c'); maybeA.a && maybeA.a.b && maybeA.a.b.c;

const maybeB1:maybeB = maybeA.a?maybeA.a:{b:{c:{d:1}}};const maybeC1 = maybeB1?maybeB1.b:{c:0}; maybeC1?maybeC1.c:{c:0}
const maybeB2:maybeB|undefined = digUp(maybeA, 'a'); const maybeC2 = maybeB2?maybeB2.b:{c:0}; maybeC2?maybeC2.c:{c:0}
const maybeB3 = maybeA.a?maybeA.a:{b:{c:{d:1}}};       const maybeC3 = maybeB3?maybeB3.b:{c:0}; maybeC3?maybeC3.c:{c:0}
const maybeB4 = digUp(maybeA, 'a');                  const maybeC4 = maybeB4?maybeB4.b:{c:0}; maybeC4?maybeC4.c:{c:0}
const o3=digUp(oBranch, 'a1', 'b1_2'); o3?o3.indexOf:0;
const o5=digUp(oBranch, 'a1'); o5?o5.b1_2:0;
const o6=digUp(oaoao, 'a', 0, 'b');  o6?o6[0]:0;
const o4=digUp(oaoao, 'a', 0);  o4?o4.b:0;
const o8=digUp(aoooo, 0); o8 && o8.a;
const o9=digUp(aoooo, 0,   'a', 'b', 'c'); o9?o9.d:0;
const o10=digUp(ooooo, 'a', 'b', 'c', 'd'); o10?o10.e:0;
const o11=digUp(oaoao, 'a', 0,   'b',  0);  o11?o11.c:0;
const o12=digUp(oaoao, 'a', 0,   'b');         o12?o12[0].c:0;
// /*FAIL*/digUp(oBranch, 'a1', 'b2_1');
// /*FAIL*/digUp(oBranch, 'a2', 'b1_1');
dig(oaoao, 'a').filter(a=>!a.b); oaoao.a[0].b[0].c;
//    find<S extends T>(predicate: (this: void, value: T, index: number, obj: T[]) => value is S, thisArg?: any): S | undefined;
//    find(predicate: (value: T, index: number, obj: T[]) => boolean, thisArg?: any): T | undefined;
//*FAIL*/ type Find2<T>   = Exclude<T extends Array<infer U> ? (value: U) => boolean : never, never>;
//*FAIL*/ type Find2<T>   = Exclude<T extends Array<any> ? (value: ItemOf<T>) => boolean : never, never>;
//*FAIL*/ type Find2<T>   = T extends Array<infer U> ? (value: U) => boolean : never;
//*FAIL*/ type Find2<T>   = T extends Array<infer U> ? (value: U, index?:number, array?:T) => boolean : never;
// type Find2<T> = (value: ItemOf<T>, index?:number, array?:T) => boolean;
// type Find2<T, U=ItemOf<T>> = (value: U, index?:number, array?:T) => boolean;
dig(maybeABC).find(o=>!o.a);
dig(maybeABC, o=>!o.a);
dig(maybeABC, 0, 'a').find(a=>!a.b);

// Max works with optional properties
const maxD:number = dig(maybeABC, 0, 'a').max('b','c','d'); maxD;

// Max ignores (nested) arrays
const maxB1 = dig( {a:  {b:1}  }, 'a').max('b'); maxB1;
const maxB2 = dig( {a: [{b:1}] }, 'a').max('b'); maxB2;
const maxB3 = dig( {a:[[{b:1}]]}, 'a').max('b'); maxB3;
const maxId = dig([{id:1,name:'a'}, {id:2,name:'b'}, {id:3,name:'c'}]).max('id');  maxId;

// Max requires valid keys
const FailMaxUnknownKey = dig({a:{b:1}}, 'a').max('x'); FailMaxUnknownKey;

// Max requires numbers
const FailMaxString  = dig({a:'x'}).max('a');  FailMaxString;
const FailMaxStringB = dig({a:{b:'x'}}).max('a', 'b');  FailMaxStringB;

dig(maybeABC, 0, 'a', a=>!a.b); //*FAIL*/ dig(maybeABC, 0, 'a', a=>!a.x);
dig(oaoao, 'a', a=>!a.b);   //*FAIL*/ dig(oaoao, 'a', a=>!a.x);
const maxC1:number =dig(oaoao, 'a').max('b', 'c'); maxC1;
type ABC = Array<{a:{b:boolean}}>;
const abc:ABC = [{a:{b:true}}, {a:{b:false}}];
function g<T>(object:T, a:Find<T>):void {object; a;}
g(abc, (o)=>!o.a.b)
aoooo.filter(o=>!o.a.b.c.d).length
const g0 = digUp(aoooo, 0); g0 && g0.a;
const g1 = digUp(aoooo, o=>!o.a.b.c.d); g1 && g1.a;
const g2 = digUp(aoooo, o=>!o.a.b.c.d, 'a'); g2 && g2.b;
const h1 = digUp(ooooo, 'a'); h1 && h1.b; aoooo.filter(o=>!o.a.b.c.d).length
const o13=dig(oBranch, 'a1').get(); o13?o13.b1_2:0;
const maybeB5:maybeB = maybeA.a?maybeA.a:{b:{c:{d:1}}};         const maybeC5 = maybeB5?maybeB5.b:{c:0}; maybeC5?maybeC5.c:{c:0}
const maybeB6:maybeB|undefined = dig(maybeA, 'a').get({b:{c:{d:1}}});  const maybeC6 = maybeB6?maybeB6.b:{c:0}; maybeC6?maybeC6.c:{c:0}
const maybeB7 = maybeA.a?maybeA.a:{b:{c:{d:1}}};                const maybeC7 = maybeB7?maybeB7.b:{c:0}; maybeC7?maybeC7.c:{c:0}
const maybeB8 = dig(maybeA, 'a').get({b:{c:{d:1}}});         const maybeC8 = maybeB8?maybeB8.b:{c:0}; maybeC8?maybeC8.c:{c:0}
dig(oaoao, 'a').filter(a=>!a.b); oaoao.a[0].b[0].c;
dig(maybeABC, 0, 'a').get();
dig(maybeABC, 0, 'a', a=>!a[0].b, 'b').get();
dig(oBranch, 'a2', 'b2_1').get();
dig(oaoao, 'a').filter(a=>!a.b).dig(0,'b').get();
const o15=dig(oaoao, 'a', a=>!a.b); o15[0].z.e;
const o16=oaoao.a.find(a=>!!a.b); o16?o16.b:0;
dig(oaoao, 'a', a=>!a[0].a).get();
dig(oaoao, 'a', 0).get();
//*FAIL*/dig(oaoao).set();
dig(oBranch, 'a2').set(2);
dig(oaoao, 'a', 0, 'b').filter(b=>!b[0].c);
dig(oaoao, 'a', 0, 'b').find(b=>!b.c);
const o17=dig(oBranch, 'a1').get(); o17?o17.b1_2:0;
const o18=dig(aoooo, 0).get(); o=o18 && o18.a;  aoooo[0] .a  .b .c  .d;
const o19=dig(aoooo, 0,   'a', 'b', 'c').get(); o=o19 && o19.d;
const o20=dig(ooooo, 'a', 'b', 'c', 'd').get(); o=o20 && o20.e;
const o21=dig(oaoao, 'a', 0,   'b',  0).get();  o=o21 && o21.c;
const o22=dig(oaoao, 'a', 0,   'b').get();         o=o22 && o22[0].c;
const o23=dig(oaoaoAny, 'a', 'x',   'y',  0).get();  o=o23 && o23.c;
o;
const a2 = dig({a:1}).max('a');  a2;
const b5 = dig({a:{b:1}}).max('a', 'b');  b5;
const c4 = dig({a:{b:{c:1}}}).max('a', 'b', 'c');  c4;
const people = [{id:1,name:'a'}, {id:2,name:'b'}, {id:3,name:'c'}];
const nameOfId1 = dig(people, item=>item.id==1, 'name'); nameOfId1;
const people2 = dig(people).filter(person=>person.id>1);
// people2.dig(people, 0, 'name');
people2.dig(last);
people2.dig(last, 'id');

// const digon:DigFunction = dig;
// digon.apply(null, [people, 0, 'name'])

// const nameOfLast = dig(families, 0, 'pets').get(); nameOfLast
// const pets = dig(families, 0, 'pets').filter(pet=>pet.age>4);
// pets[0].products[0].category; dig(pets, 0, 'age');
// pets.dig(true).get();
// const oldPets = dig(pets).filter(pet=>pet.age>4); oldPets[0].name
const products = dig(families, 0, 'pets').filter(pet=>pet.age>4).dig(0, 'name'); products;

dig(<any>[],99).get([]);
dig({a:1}, 'a').get(2);
const FAIL_INCOMPLETE_DEFAULT = dig({a:{b:0}}, 'a').get({}); FAIL_INCOMPLETE_DEFAULT
dig(<{a:{b?: number}}> {a:{b:0}}, 'a').get({});
dig(<any>{a: 1}, 'a').get();
dig({a: 1}, 'a').get(2);
dig(<any>{a: 1}, 'a').get(2);

const array_extended = dig(<{a:number[]}>{a:[]}, 'a').get([]); array_extended.pop();

let s = new Map();
const d = (a)=>!a;
s.set(d,1);
type Pet = {
    fur:{a:{b:{c:number}}}
    legs:4
};
const store = <{pets:Pet[]}>
    {pets:[{fur:{a:{b:{c:2}}}}]};
dig(store, 'pets', pet=>!!pet.fur, 'fur');
dig(store, 'pets', pet=>!!pet);
dig(store, 'pets')
    .return(pets=>({
        furry: pets.filter(pet=>!!pet.fur),
        nonFurry: pets.filter(pet=>!pet.fur),
    }));

{ // new scope
    const abc = [
        {b:{c:1}},
        {b:{c:2}},
        {b:{c:3}}
    ];
    digUp(abc, [0]);
    dig(abc).filter(a=>a.b.c>1).dig(0, 'b', 'c');
    dig(abc).filter(a=>a.b.c>1).dig(last);
    dig(abc).filter(a=>a.b.c>1).dig('length');
}
{ // new scope
    const abc = {a:{b:{c:{d:{e:{f:1}}}}}, a2:{b2:{c2:{d2:{e2:{f2:1}}}}}};
    const arr = [{a:{b:{c:{d:{e:{f:1}}}}}}, {b2:{c2:{d2:{e2:{f2:1}}}}}];
    const A = {b:{c:{d:{e:{f:1}}}}};
    const B = {c:{d:{e:{f:1}}}};
    const C = {d:{e:{f:1}}};
    const X = {x:0};
    let _;
    const a4 = digUp(arr, 0);          _=a4&&(a4.a     || a4.X);
    const b4 = digUp(arr, 0, 'a');        _=b4&&(b4.b    || b4.X);
    const b5 = digUp(arr, [0, 'a']);      _=b5&&(b5.b    || b5.X);

    // 1 argument
    const a2 = digUp(abc,['a']);         _=a2&&(a2.b.c || a2.b. X);
    const b2 = digUp(abc,['a','b']);     _=b2&&(b2.c.d || b2   .X);
    const c2 = digUp(abc,['a','b','c']); _=c2&&(c2.d.e || c2   .X);

    const a1 = digUp(abc,'a');           _=a1&&(a1.b.c || a1.b. X);
    /**/       digUp(abc,                                      'X' );
    /**/       digUp(abc,[                                     'X']);
    /**/       digUp(abc,['a',                                 'X']);
    /**/       digUp(abc,['a','b',                             'X']);

    // 2 arguments
    const b1 = digUp(abc,'a','b');         _=b1&&(b1.c.d||b1.c. X);
    /**/       digUp(abc,'a',                                  'X'); // !!!
    const a3 = digUp(abc,['a'],A);         _=a3&&(a3.b.c||a3.b. X);
    const b3 = digUp(abc,['a','b'],B);     _=b3&&(b3.c.d||b3   .X);
    /**/       digUp(abc,['a','b'],                             A);
    const c3 = digUp(abc,['a','b','c'],C); _=c3&&(c3.d.e||c3   .X);
    /**/       digUp(abc,['a'],                                 X);
    /**/       digUp(abc,['a','b'],                             X);
    /**/       digUp(abc,['a','b','c'],                         X);

    // 3 arguments
    /**/       digUp(abc,'a','b',                              'X');
    const c1 = digUp(abc,'a','b','c');     _=c1&&(c1.d.e||c1.d. X);

    _=0;console.log(_);
}

// dig([{a:1}, 'a']).filter().digOn('a');
digUp([], 'length');

