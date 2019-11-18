class Str extends String {
    replaceAll(searchValue, replaceValue): string | this {
        const type = typeof searchValue;
        if ( type == 'string' || type == 'number' ) {
            return this
                .split(searchValue)
                .join(replaceValue);
        } else if ( type == 'object' ) {
            let temp = this;
            for ( let [ sv, rv ] of searchValue.items() )
                temp = temp.replaceAll(sv, rv);
            
            return temp;
        } else {
            console.error(`replaceAll got a bad type, searchValue: ${searchValue}, type: ${type}`);
        }
    }
}

export function str(value?: any) {
    return new Str(value)
}
