/*import { dict } from "../Dict";
 import { enumerate } from "../util";
 
 class Str extends String {
 replaceAll(searchValues: TMap<string>, replaceValue: undefined): string
 replaceAll(searchValue: string | number, replaceValue: string): string
 replaceAll(searchValue, replaceValue) {
 const typeofSearchValue = typeof searchValue;
 if ( typeofSearchValue === 'string' || typeofSearchValue === 'number' ) {
 return super
 .split(searchValue)
 .join(replaceValue);
 
 } else if ( typeofSearchValue === 'object' ) {
 let temp = this;
 for ( let [ sv, rv ] of enumerate(searchValue) )
 temp = str(temp).replaceAll(sv, rv);
 
 return temp;
 } else {
 console.warn(`replaceAll got a bad type, searchValue: ${searchValue}, type: ${typeofSearchValue}`);
 return this;
 }
 }
 
 removeAll(removeValue, ...removeValues) {
 let temp = this;
 for ( let value of [ removeValue, ...removeValues ] )
 temp = temp.replaceAll(value, '');
 return temp;
 }
 
 /!**Non inclusive*!/
 upTo(searchString: string, searchFromEnd = false): string {
 
 let end = searchFromEnd
 ? this.lastIndexOf(searchString)
 : this.indexOf(searchString);
 if ( end === -1 )
 console.warn(`${this.valueOf()}.upTo(${searchString},${searchFromEnd}) index is -1`);
 return this.slice(0, end);
 }
 
 lower(): string {
 return this.toLowerCase()
 }
 
 upper(): string {
 return this.toUpperCase()
 }
 
 title(): string {
 
 if ( this.includes(' ') )
 return this.split(' ').map(s => str(s).title()).join(' ');
 else
 return str(this[0]).upper() + str(this.slice(1, this.length)).lower();
 
 }
 
 isdigit(): boolean {
 // @ts-ignore
 return !isNaN(Math.floor(this));
 }
 
 }
 
 export function str(value?: any): Str {
 return new Str(value)
 }*/

/*
 let hi = str('hi');
 hi                         Str {"hi"}
 hi.lower()                 Str {"hi"}
 typeof hi                  object
 hi instanceof String       true
 hi instanceof Str          true
 hi == 'hi'                 true
 hi === 'hi'                false
 hi == str('hi')            false
 hi === str('hi')           false
 
 let empty = str('');
 empty                      Str {""}
 empty.lower()              Str {""}
 typeof empty               object
 empty instanceof String    true
 empty instanceof Str       true
 empty == ''                true
 empty === ''               false
 empty == str('')           false
 empty === str('')          false
 */
