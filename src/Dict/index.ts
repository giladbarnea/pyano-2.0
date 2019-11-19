/*
 type TDict<T> = Dict<T> & { [P in keyof T]: T[P] };
 
 
 class Dict<T> {
 
 constructor(obj: T) {
 Object.assign(this, obj);
 }
 
 /!**lol*!/
 items(): [ string, T[keyof T] ][] {
 const proxy = this;
 const kvpairs = [];
 for ( let k in proxy ) {
 kvpairs.push([ k, proxy[k] ]);
 }
 return kvpairs;
 }
 
 keys(): string[] {
 const proxy = this;
 const keys = [];
 for ( let k in proxy ) {
 keys.push(k);
 }
 return keys;
 }
 
 values(): string[] {
 const proxy = this;
 const values = [];
 for ( let k in proxy ) {
 values.push(proxy[k]);
 }
 return values;
 }
 
 
 }
 
 export function dict<T>(obj: T): TDict<T> {
 return new Dict<T>(obj) as TDict<T>;
 }
 */
