"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Str extends String {
    replaceAll(searchValue, replaceValue) {
        const typeofSearchValue = typeof searchValue;
        if (typeofSearchValue === 'string' || typeofSearchValue === 'number') {
            return this
                .split(searchValue)
                .join(replaceValue);
        }
        else if (typeofSearchValue === 'object') {
            let temp = this;
            for (let [sv, rv] of searchValue.items())
                temp = temp.replaceAll(sv, rv);
            return temp;
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
        return this.slice(0, end);
    }
}
function str(value) {
    return new Str(value);
}
exports.str = str;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLE1BQU0sR0FBSSxTQUFRLE1BQU07SUFHcEIsVUFBVSxDQUFDLFdBQVcsRUFBRSxZQUFZO1FBQ2hDLE1BQU0saUJBQWlCLEdBQUcsT0FBTyxXQUFXLENBQUM7UUFDN0MsSUFBSyxpQkFBaUIsS0FBSyxRQUFRLElBQUksaUJBQWlCLEtBQUssUUFBUSxFQUFHO1lBQ3BFLE9BQU8sSUFBSTtpQkFDTixLQUFLLENBQUMsV0FBVyxDQUFDO2lCQUNsQixJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7U0FFM0I7YUFBTSxJQUFLLGlCQUFpQixLQUFLLFFBQVEsRUFBRztZQUN6QyxJQUFJLElBQUksR0FBRyxJQUFJLENBQUM7WUFDaEIsS0FBTSxJQUFJLENBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBRSxJQUFJLFdBQVcsQ0FBQyxLQUFLLEVBQUU7Z0JBQ3ZDLElBQUksR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUVuQyxPQUFPLElBQUksQ0FBQztTQUNmO2FBQU07WUFDSCxPQUFPLENBQUMsSUFBSSxDQUFDLDJDQUEyQyxXQUFXLFdBQVcsaUJBQWlCLEVBQUUsQ0FBQyxDQUFDO1lBQ25HLE9BQU8sSUFBSSxDQUFDO1NBQ2Y7SUFDTCxDQUFDO0lBRUQsa0JBQWtCO0lBQ2xCLElBQUksQ0FBQyxZQUFvQixFQUFFLGFBQWEsR0FBRyxLQUFLO1FBRTVDLElBQUksR0FBRyxHQUFHLGFBQWE7WUFDbkIsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDO1lBQ2hDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ2pDLElBQUssR0FBRyxLQUFLLENBQUMsQ0FBQztZQUNYLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxFQUFFLFNBQVMsWUFBWSxJQUFJLGFBQWEsZUFBZSxDQUFDLENBQUM7UUFDekYsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUM5QixDQUFDO0NBQ0o7QUFFRCxTQUFnQixHQUFHLENBQUMsS0FBVztJQUMzQixPQUFPLElBQUksR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFBO0FBQ3pCLENBQUM7QUFGRCxrQkFFQyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIFN0ciBleHRlbmRzIFN0cmluZyB7XG4gICAgcmVwbGFjZUFsbChzZWFyY2hWYWx1ZXM6IFRNYXA8YW55PiwgcmVwbGFjZVZhbHVlOiBzdHJpbmcpOiB0aGlzXG4gICAgcmVwbGFjZUFsbChzZWFyY2hWYWx1ZTogc3RyaW5nIHwgbnVtYmVyLCByZXBsYWNlVmFsdWU6IHN0cmluZyk6IHRoaXNcbiAgICByZXBsYWNlQWxsKHNlYXJjaFZhbHVlLCByZXBsYWNlVmFsdWUpIHtcbiAgICAgICAgY29uc3QgdHlwZW9mU2VhcmNoVmFsdWUgPSB0eXBlb2Ygc2VhcmNoVmFsdWU7XG4gICAgICAgIGlmICggdHlwZW9mU2VhcmNoVmFsdWUgPT09ICdzdHJpbmcnIHx8IHR5cGVvZlNlYXJjaFZhbHVlID09PSAnbnVtYmVyJyApIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzXG4gICAgICAgICAgICAgICAgLnNwbGl0KHNlYXJjaFZhbHVlKVxuICAgICAgICAgICAgICAgIC5qb2luKHJlcGxhY2VWYWx1ZSk7XG4gICAgICAgICAgICBcbiAgICAgICAgfSBlbHNlIGlmICggdHlwZW9mU2VhcmNoVmFsdWUgPT09ICdvYmplY3QnICkge1xuICAgICAgICAgICAgbGV0IHRlbXAgPSB0aGlzO1xuICAgICAgICAgICAgZm9yICggbGV0IFsgc3YsIHJ2IF0gb2Ygc2VhcmNoVmFsdWUuaXRlbXMoKSApXG4gICAgICAgICAgICAgICAgdGVtcCA9IHRlbXAucmVwbGFjZUFsbChzdiwgcnYpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4gdGVtcDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgcmVwbGFjZUFsbCBnb3QgYSBiYWQgdHlwZSwgc2VhcmNoVmFsdWU6ICR7c2VhcmNoVmFsdWV9LCB0eXBlOiAke3R5cGVvZlNlYXJjaFZhbHVlfWApO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgLyoqTm9uIGluY2x1c2l2ZSovXG4gICAgdXBUbyhzZWFyY2hTdHJpbmc6IHN0cmluZywgc2VhcmNoRnJvbUVuZCA9IGZhbHNlKSB7XG4gICAgICAgIFxuICAgICAgICBsZXQgZW5kID0gc2VhcmNoRnJvbUVuZFxuICAgICAgICAgICAgPyB0aGlzLmxhc3RJbmRleE9mKHNlYXJjaFN0cmluZylcbiAgICAgICAgICAgIDogdGhpcy5pbmRleE9mKHNlYXJjaFN0cmluZyk7XG4gICAgICAgIGlmICggZW5kID09PSAtMSApXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYCR7dGhpcy52YWx1ZU9mKCl9LnVwVG8oJHtzZWFyY2hTdHJpbmd9LCR7c2VhcmNoRnJvbUVuZH0pIGluZGV4IGlzIC0xYCk7XG4gICAgICAgIHJldHVybiB0aGlzLnNsaWNlKDAsIGVuZCk7XG4gICAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc3RyKHZhbHVlPzogYW55KSB7XG4gICAgcmV0dXJuIG5ldyBTdHIodmFsdWUpXG59XG4iXX0=