class Str extends String {
    replaceAll(searchValues: TMap<any>, replaceValue: string): this
    replaceAll(searchValue: string | number, replaceValue: string): this
    replaceAll(searchValue, replaceValue) {
        const typeofSearchValue = typeof searchValue;
        if ( typeofSearchValue === 'string' || typeofSearchValue === 'number' ) {
            return this
                .split(searchValue)
                .join(replaceValue);
            
        } else if ( typeofSearchValue === 'object' ) {
            let temp = this;
            for ( let [ sv, rv ] of searchValue.items() )
                temp = temp.replaceAll(sv, rv);
            
            return temp;
        } else {
            console.warn(`replaceAll got a bad type, searchValue: ${searchValue}, type: ${typeofSearchValue}`);
            return this;
        }
    }
    
    /**Non inclusive*/
    upTo(searchString: string, searchFromEnd = false) {
        
        let end = searchFromEnd
            ? this.lastIndexOf(searchString)
            : this.indexOf(searchString);
        if ( end === -1 )
            console.warn(`${this.valueOf()}.upTo(${searchString},${searchFromEnd}) index is -1`);
        return this.slice(0, end);
    }
}

export function str(value?: any) {
    return new Str(value)
}
