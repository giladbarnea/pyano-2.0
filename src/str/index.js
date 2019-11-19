"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Str extends String {
    replaceAll(searchValue, replaceValue) {
        const typeofSearchValue = typeof searchValue;
        if (typeofSearchValue === 'string' || typeofSearchValue === 'number') {
            return str(this
                .split(searchValue)
                .join(replaceValue));
        }
        else if (typeofSearchValue === 'object') {
            let temp = this;
            for (let [sv, rv] of searchValue.items())
                temp = temp.replaceAll(sv, rv);
            return str(temp);
        }
        else {
            console.warn(`replaceAll got a bad type, searchValue: ${searchValue}, type: ${typeofSearchValue}`);
            return this;
        }
    }
    /**Non inclusive*/
    upTo(searchString, searchFromEnd = false) {
        let end = searchFromEnd
            ? this.lastIndexOf(searchString)
            : this.indexOf(searchString);
        if (end === -1)
            console.warn(`${this.valueOf()}.upTo(${searchString},${searchFromEnd}) index is -1`);
        return str(this.slice(0, end));
    }
    lower() {
        return str(this.toLowerCase());
    }
}
function str(value) {
    return new Str(value);
}
exports.str = str;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLE1BQU0sR0FBSSxTQUFRLE1BQU07SUFHcEIsVUFBVSxDQUFDLFdBQVcsRUFBRSxZQUFZO1FBQ2hDLE1BQU0saUJBQWlCLEdBQUcsT0FBTyxXQUFXLENBQUM7UUFDN0MsSUFBSyxpQkFBaUIsS0FBSyxRQUFRLElBQUksaUJBQWlCLEtBQUssUUFBUSxFQUFHO1lBQ3BFLE9BQU8sR0FBRyxDQUFDLElBQUk7aUJBQ1YsS0FBSyxDQUFDLFdBQVcsQ0FBQztpQkFDbEIsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7U0FFNUI7YUFBTSxJQUFLLGlCQUFpQixLQUFLLFFBQVEsRUFBRztZQUN6QyxJQUFJLElBQUksR0FBRyxJQUFXLENBQUM7WUFDdkIsS0FBTSxJQUFJLENBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBRSxJQUFJLFdBQVcsQ0FBQyxLQUFLLEVBQUU7Z0JBQ3ZDLElBQUksR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUVuQyxPQUFPLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUNwQjthQUFNO1lBQ0gsT0FBTyxDQUFDLElBQUksQ0FBQywyQ0FBMkMsV0FBVyxXQUFXLGlCQUFpQixFQUFFLENBQUMsQ0FBQztZQUNuRyxPQUFPLElBQUksQ0FBQztTQUNmO0lBQ0wsQ0FBQztJQUVELGtCQUFrQjtJQUNsQixJQUFJLENBQUMsWUFBb0IsRUFBRSxhQUFhLEdBQUcsS0FBSztRQUU1QyxJQUFJLEdBQUcsR0FBRyxhQUFhO1lBQ25CLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQztZQUNoQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUNqQyxJQUFLLEdBQUcsS0FBSyxDQUFDLENBQUM7WUFDWCxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sRUFBRSxTQUFTLFlBQVksSUFBSSxhQUFhLGVBQWUsQ0FBQyxDQUFDO1FBQ3pGLE9BQU8sR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDbkMsQ0FBQztJQUVELEtBQUs7UUFDRCxPQUFPLEdBQUcsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQTtJQUNsQyxDQUFDO0NBQ0o7QUFFRCxTQUFnQixHQUFHLENBQUMsS0FBVztJQUMzQixPQUFPLElBQUksR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFBO0FBQ3pCLENBQUM7QUFGRCxrQkFFQztBQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBc0JHIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgU3RyIGV4dGVuZHMgU3RyaW5nIHtcbiAgICByZXBsYWNlQWxsKHNlYXJjaFZhbHVlczogVE1hcDxhbnk+KTogU3RyXG4gICAgcmVwbGFjZUFsbChzZWFyY2hWYWx1ZTogc3RyaW5nIHwgbnVtYmVyLCByZXBsYWNlVmFsdWU6IHN0cmluZyk6IFN0clxuICAgIHJlcGxhY2VBbGwoc2VhcmNoVmFsdWUsIHJlcGxhY2VWYWx1ZSkge1xuICAgICAgICBjb25zdCB0eXBlb2ZTZWFyY2hWYWx1ZSA9IHR5cGVvZiBzZWFyY2hWYWx1ZTtcbiAgICAgICAgaWYgKCB0eXBlb2ZTZWFyY2hWYWx1ZSA9PT0gJ3N0cmluZycgfHwgdHlwZW9mU2VhcmNoVmFsdWUgPT09ICdudW1iZXInICkge1xuICAgICAgICAgICAgcmV0dXJuIHN0cih0aGlzXG4gICAgICAgICAgICAgICAgLnNwbGl0KHNlYXJjaFZhbHVlKVxuICAgICAgICAgICAgICAgIC5qb2luKHJlcGxhY2VWYWx1ZSkpO1xuICAgICAgICAgICAgXG4gICAgICAgIH0gZWxzZSBpZiAoIHR5cGVvZlNlYXJjaFZhbHVlID09PSAnb2JqZWN0JyApIHtcbiAgICAgICAgICAgIGxldCB0ZW1wID0gdGhpcyBhcyBTdHI7XG4gICAgICAgICAgICBmb3IgKCBsZXQgWyBzdiwgcnYgXSBvZiBzZWFyY2hWYWx1ZS5pdGVtcygpIClcbiAgICAgICAgICAgICAgICB0ZW1wID0gdGVtcC5yZXBsYWNlQWxsKHN2LCBydik7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHJldHVybiBzdHIodGVtcCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYHJlcGxhY2VBbGwgZ290IGEgYmFkIHR5cGUsIHNlYXJjaFZhbHVlOiAke3NlYXJjaFZhbHVlfSwgdHlwZTogJHt0eXBlb2ZTZWFyY2hWYWx1ZX1gKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIC8qKk5vbiBpbmNsdXNpdmUqL1xuICAgIHVwVG8oc2VhcmNoU3RyaW5nOiBzdHJpbmcsIHNlYXJjaEZyb21FbmQgPSBmYWxzZSk6IFN0ciB7XG4gICAgICAgIFxuICAgICAgICBsZXQgZW5kID0gc2VhcmNoRnJvbUVuZFxuICAgICAgICAgICAgPyB0aGlzLmxhc3RJbmRleE9mKHNlYXJjaFN0cmluZylcbiAgICAgICAgICAgIDogdGhpcy5pbmRleE9mKHNlYXJjaFN0cmluZyk7XG4gICAgICAgIGlmICggZW5kID09PSAtMSApXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYCR7dGhpcy52YWx1ZU9mKCl9LnVwVG8oJHtzZWFyY2hTdHJpbmd9LCR7c2VhcmNoRnJvbUVuZH0pIGluZGV4IGlzIC0xYCk7XG4gICAgICAgIHJldHVybiBzdHIodGhpcy5zbGljZSgwLCBlbmQpKTtcbiAgICB9XG4gICAgXG4gICAgbG93ZXIoKTogU3RyIHtcbiAgICAgICAgcmV0dXJuIHN0cih0aGlzLnRvTG93ZXJDYXNlKCkpXG4gICAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc3RyKHZhbHVlPzogYW55KTogU3RyIHtcbiAgICByZXR1cm4gbmV3IFN0cih2YWx1ZSlcbn1cblxuLypcbiBsZXQgaGkgPSBzdHIoJ2hpJyk7XG4gaGkgICAgICAgICAgICAgICAgICAgICAgICAgU3RyIHtcImhpXCJ9XG4gaGkubG93ZXIoKSAgICAgICAgICAgICAgICAgU3RyIHtcImhpXCJ9XG4gdHlwZW9mIGhpICAgICAgICAgICAgICAgICAgb2JqZWN0XG4gaGkgaW5zdGFuY2VvZiBTdHJpbmcgICAgICAgdHJ1ZVxuIGhpIGluc3RhbmNlb2YgU3RyICAgICAgICAgIHRydWVcbiBoaSA9PSAnaGknICAgICAgICAgICAgICAgICB0cnVlXG4gaGkgPT09ICdoaScgICAgICAgICAgICAgICAgZmFsc2VcbiBoaSA9PSBzdHIoJ2hpJykgICAgICAgICAgICBmYWxzZVxuIGhpID09PSBzdHIoJ2hpJykgICAgICAgICAgIGZhbHNlXG4gXG4gbGV0IGVtcHR5ID0gc3RyKCcnKTtcbiBlbXB0eSAgICAgICAgICAgICAgICAgICAgICBTdHIge1wiXCJ9XG4gZW1wdHkubG93ZXIoKSAgICAgICAgICAgICAgU3RyIHtcIlwifVxuIHR5cGVvZiBlbXB0eSAgICAgICAgICAgICAgIG9iamVjdFxuIGVtcHR5IGluc3RhbmNlb2YgU3RyaW5nICAgIHRydWVcbiBlbXB0eSBpbnN0YW5jZW9mIFN0ciAgICAgICB0cnVlXG4gZW1wdHkgPT0gJycgICAgICAgICAgICAgICAgdHJ1ZVxuIGVtcHR5ID09PSAnJyAgICAgICAgICAgICAgIGZhbHNlXG4gZW1wdHkgPT0gc3RyKCcnKSAgICAgICAgICAgZmFsc2VcbiBlbXB0eSA9PT0gc3RyKCcnKSAgICAgICAgICBmYWxzZVxuICovXG4iXX0=