class Str extends String {
    replaceAll(searchValues: TMap<any>): Str
    replaceAll(searchValue: string | number, replaceValue: string): Str
    replaceAll(searchValue, replaceValue) {
        const typeofSearchValue = typeof searchValue;
        if ( typeofSearchValue === 'string' || typeofSearchValue === 'number' ) {
            return str(this
                .split(searchValue)
                .join(replaceValue));
            
        } else if ( typeofSearchValue === 'object' ) {
            let temp = this as Str;
            for ( let [ sv, rv ] of searchValue.items() )
                temp = temp.replaceAll(sv, rv);
            
            return str(temp);
        } else {
            console.warn(`replaceAll got a bad type, searchValue: ${searchValue}, type: ${typeofSearchValue}`);
            return this;
        }
    }
    
    /**Non inclusive*/
    upTo(searchString: string, searchFromEnd = false): Str {
        
        let end = searchFromEnd
            ? this.lastIndexOf(searchString)
            : this.indexOf(searchString);
        if ( end === -1 )
            console.warn(`${this.valueOf()}.upTo(${searchString},${searchFromEnd}) index is -1`);
        return str(this.slice(0, end));
    }
    
    lower(): Str {
        return str(this.toLowerCase())
    }
}

export function str(value?: any): Str {
    return new Str(value)
}

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
