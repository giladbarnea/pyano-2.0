console.group(`renderer.ts`);
const { remote } = require('electron');
const argvars = remote.process.argv.slice(2).map(s => s.toLowerCase());
const DEBUG = argvars.includes('debug');
const DRYRUN = argvars.includes('dry-run');
const NOPYTHON = argvars.includes('no-python');
const path = require('path');
let ROOT_PATH_ABS;
let SRC_PATH_ABS;
if (path.basename(__dirname) === 'src') {
    ROOT_PATH_ABS = path.join(__dirname, '..');
    SRC_PATH_ABS = __dirname;
}
else {
    ROOT_PATH_ABS = __dirname;
    SRC_PATH_ABS = path.join(ROOT_PATH_ABS, 'src');
}
const TEMPLATES_PATH_ABS = path.join(ROOT_PATH_ABS, 'templates');
const SALAMANDER_PATH_ABS = path.join(TEMPLATES_PATH_ABS, 'Salamander');
const EXPERIMENTS_PATH_ABS = path.join(SRC_PATH_ABS, 'experiments');
const TRUTHS_PATH_ABS = path.join(EXPERIMENTS_PATH_ABS, 'truths');
const CONFIGS_PATH_ABS = path.join(EXPERIMENTS_PATH_ABS, 'configs');
const SUBJECTS_PATH_ABS = path.join(EXPERIMENTS_PATH_ABS, 'subjects');
console.table({
    __dirname,
    ROOT_PATH_ABS,
    SRC_PATH_ABS,
    TEMPLATES_PATH_ABS,
    SALAMANDER_PATH_ABS,
    EXPERIMENTS_PATH_ABS,
    TRUTHS_PATH_ABS,
    CONFIGS_PATH_ABS,
    SUBJECTS_PATH_ABS,
    DEBUG, DRYRUN, NOPYTHON
});
Object.defineProperty(Object.prototype, "keys", {
    enumerable: false,
    value() {
        return Object.keys(this).map(key => key.isdigit()
            ? parseInt(key) : key);
    }
});
Object.defineProperty(Array.prototype, "last", {
    enumerable: false,
    value() {
        return this[this.length - 1];
    }
});
Object.defineProperty(Array.prototype, "lowerAll", {
    enumerable: false,
    value() {
        return this.map(s => s.lower());
    }
});
Object.defineProperty(Array.prototype, "rsort", {
    enumerable: false,
    value() {
        return this.sort((n, m) => n < m);
    }
});
Object.defineProperty(Array.prototype, "count", {
    enumerable: false,
    value(item) {
        let _count = 0;
        const { isFunction } = require('util');
        if (isFunction(item)) {
            for (let x of this) {
                if (item(x)) {
                    _count++;
                }
            }
        }
        else {
            for (let x of this) {
                if (x === item) {
                    _count++;
                }
            }
            return _count;
        }
    }
});
Object.defineProperty(String.prototype, "upTo", {
    enumerable: false,
    value(searchString, searchFromEnd = false) {
        let end = searchFromEnd
            ? this.lastIndexOf(searchString)
            : this.indexOf(searchString);
        if (end === -1)
            console.warn(`${this.valueOf()}.upTo(${searchString},${searchFromEnd}) index is -1`);
        return this.slice(0, end);
    }
});
Object.defineProperty(String.prototype, "in", {
    enumerable: false,
    value(arr) {
        return arr.includes(this.valueOf());
    }
});
Object.defineProperty(String.prototype, "lower", {
    enumerable: false,
    value() {
        return this.toLowerCase();
    }
});
Object.defineProperty(String.prototype, "upper", {
    enumerable: false,
    value() {
        return this.toUpperCase();
    }
});
Object.defineProperty(String.prototype, "title", {
    enumerable: false,
    value() {
        if (this.includes(' '))
            return this.split(' ').map(str => str.title()).join(' ');
        else
            return this[0].upper() + this.slice(1, this.length).lower();
    }
});
Object.defineProperty(String.prototype, "isdigit", {
    enumerable: false,
    value() {
        return !isNaN(Math.floor(this));
    }
});
Object.defineProperty(String.prototype, "removeAll", {
    enumerable: false,
    value(removeValue, ...removeValues) {
        let temp = this;
        for (let value of [removeValue, ...removeValues])
            temp = temp.replaceAll(value, '');
        return temp;
    }
});
Object.defineProperty(String.prototype, "replaceAll", {
    enumerable: false,
    value(searchValue, replaceValue) {
        const type = typeof searchValue;
        if (type === 'string' || type === 'number') {
            return this
                .split(searchValue)
                .join(replaceValue);
        }
        else if (type === 'object') {
            if (searchValue.compile) {
                let temp = this;
                let replaced = temp.replace(searchValue, replaceValue);
                while (replaced !== temp) {
                    temp = replaced;
                    replaced = replaced.replace(searchValue, replaceValue);
                }
                return replaced;
            }
            else {
                let temp = this;
                for (let [sv, rv] of Object.entries(searchValue))
                    temp = temp.replaceAll(sv, rv);
                return temp;
            }
        }
        else {
            console.warn(`replaceAll got a bad type, searchValue: ${searchValue}, type: ${type}`);
            return this;
        }
    }
});
Object.defineProperty(Number.prototype, "human", {
    enumerable: false,
    value(letters = false) {
        const floored = Math.floor(this);
        switch (floored) {
            case 0:
                return letters
                    ? "zeroth"
                    : "0th";
            case 1:
                return letters
                    ? "first"
                    : "1st";
            case 2:
                return letters
                    ? "second"
                    : "2nd";
            case 3:
                return letters
                    ? "third"
                    : "3rd";
            case 4:
                return letters
                    ? "fourth"
                    : "4th";
            case 5:
                return letters
                    ? "fifth"
                    : "5th";
            case 6:
                return letters
                    ? "sixth"
                    : "6th";
            case 7:
                return letters
                    ? "seventh"
                    : "7th";
            case 8:
                return letters
                    ? "eighth"
                    : "8th";
            case 9:
                return letters
                    ? "ninth"
                    : "9th";
            case 10:
                return letters
                    ? "tenth"
                    : "10th";
            case 11:
                return letters
                    ? "eleventh"
                    : "11th";
            case 12:
                return letters
                    ? "twelveth"
                    : "12th";
            case 13:
                return letters
                    ? "thirteenth"
                    : "13th";
            case 14:
                return letters
                    ? "fourteenth"
                    : "14th";
            case 15:
                return letters
                    ? "fifteenth"
                    : "15th";
            case 16:
                return letters
                    ? "sixteenth"
                    : "16th";
            case 17:
                return letters
                    ? "seventeenth"
                    : "17th";
            case 18:
                return letters
                    ? "eighteenth"
                    : "18th";
            case 19:
                return letters
                    ? "ninteenth"
                    : "19th";
            default:
                const stringed = floored.toString();
                const lastChar = stringed.slice(-1);
                let suffix;
                switch (lastChar) {
                    case "1":
                        suffix = "st";
                        break;
                    case "2":
                        suffix = "nd";
                        break;
                    case "3":
                        suffix = "rd";
                        break;
                    default:
                        suffix = "th";
                        break;
                }
                return `${floored}${suffix}`;
        }
    }
});
Object.defineProperty(Date.prototype, "human", {
    enumerable: false, value() {
        let d = this.getUTCDate();
        d = d < 10 ? `0${d}` : d;
        let m = this.getMonth() + 1;
        m = m < 10 ? `0${m}` : m;
        const y = this.getFullYear();
        const t = this.toTimeString().slice(0, 8).replaceAll(':', '-');
        return `${d}_${m}_${y}_${t}`;
    }
});
console.groupEnd();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVuZGVyZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJyZW5kZXJlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFRQSxPQUFPLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBRTdCLE1BQU0sRUFBRSxNQUFNLEVBQUUsR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDdkMsTUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO0FBQ3ZFLE1BQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDeEMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUMzQyxNQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBRS9DLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUU3QixJQUFJLGFBQXFCLENBQUM7QUFDMUIsSUFBSSxZQUFvQixDQUFDO0FBQ3pCLElBQUssSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsS0FBSyxLQUFLLEVBQUc7SUFDdEMsYUFBYSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQzNDLFlBQVksR0FBRyxTQUFTLENBQUM7Q0FDNUI7S0FBTTtJQUNILGFBQWEsR0FBRyxTQUFTLENBQUM7SUFDMUIsWUFBWSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLEtBQUssQ0FBQyxDQUFDO0NBQ2xEO0FBRUQsTUFBTSxrQkFBa0IsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxXQUFXLENBQUMsQ0FB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LElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDL0QsT0FBTyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO0lBQ2pDLENBQUM7Q0FDSixDQUFDLENBQUM7QUFPSCxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBUaGlzIGZpbGUgaXMgcmVxdWlyZWQgYnkgdGhlIGluZGV4Lmh0bWwgZmlsZSBhbmQgd2lsbFxuLy8gYmUgZXhlY3V0ZWQgaW4gdGhlIHJlbmRlcmVyIHByb2Nlc3MgZm9yIHRoYXQgd2luZG93LlxuLy8gTm8gTm9kZS5qcyBBUElzIGFyZSBhdmFpbGFibGUgaW4gdGhpcyBwcm9jZXNzIGJlY2F1c2Vcbi8vIGBub2RlSW50ZWdyYXRpb25gIGlzIHR1cm5lZCBvZmYuIFVzZSBgcHJlbG9hZC5qc2AgdG9cbi8vIHNlbGVjdGl2ZWx5IGVuYWJsZSBmZWF0dXJlcyBuZWVkZWQgaW4gdGhlIHJlbmRlcmluZ1xuLy8gcHJvY2Vzcy5cblxuXG5jb25zb2xlLmdyb3VwKGByZW5kZXJlci50c2ApO1xuXG5jb25zdCB7IHJlbW90ZSB9ID0gcmVxdWlyZSgnZWxlY3Ryb24nKTtcbmNvbnN0IGFyZ3ZhcnMgPSByZW1vdGUucHJvY2Vzcy5hcmd2LnNsaWNlKDIpLm1hcChzID0+IHMudG9Mb3dlckNhc2UoKSk7XG5jb25zdCBERUJVRyA9IGFyZ3ZhcnMuaW5jbHVkZXMoJ2RlYnVnJyk7XG5jb25zdCBEUllSVU4gPSBhcmd2YXJzLmluY2x1ZGVzKCdkcnktcnVuJyk7XG5jb25zdCBOT1BZVEhPTiA9IGFyZ3ZhcnMuaW5jbHVkZXMoJ25vLXB5dGhvbicpO1xuLy8gQHRzLWlnbm9yZVxuY29uc3QgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcbi8vIGNvbnN0IGZzID0gcmVxdWlyZSgnZnMnKTtcbmxldCBST09UX1BBVEhfQUJTOiBzdHJpbmc7XG5sZXQgU1JDX1BBVEhfQUJTOiBzdHJpbmc7XG5pZiAoIHBhdGguYmFzZW5hbWUoX19kaXJuYW1lKSA9PT0gJ3NyYycgKSB7XG4gICAgUk9PVF9QQVRIX0FCUyA9IHBhdGguam9pbihfX2Rpcm5hbWUsICcuLicpO1xuICAgIFNSQ19QQVRIX0FCUyA9IF9fZGlybmFtZTtcbn0gZWxzZSB7XG4gICAgUk9PVF9QQVRIX0FCUyA9IF9fZGlybmFtZTtcbiAgICBTUkNfUEFUSF9BQlMgPSBwYXRoLmpvaW4oUk9PVF9QQVRIX0FCUywgJ3NyYycpO1xufVxuLy8gL3NyYy90ZW1wbGF0ZXNcbmNvbnN0IFRFTVBMQVRFU19QQVRIX0FCUyA9IHBhdGguam9pbihST09UX1BBVEhfQUJTLCAndGVtcGxhdGVzJyk7XG4vLyAvc3JjL3RlbXBsYXRlcy9TYWxhbWFuZGVyXG5jb25zdCBTQUxBTUFOREVSX1BBVEhfQUJTID0gcGF0aC5qb2luKFRFTVBMQVRFU19QQVRIX0FCUywgJ1NhbGFtYW5kZXInKTtcblxuLy8gL3NyYy9leHBlcmltZW50c1xuY29uc3QgRVhQRVJJTUVOVFNfUEFUSF9BQlMgPSBwYXRoLmpvaW4oU1JDX1BBVEhfQUJTLCAnZXhwZXJpbWVudHMnKTtcbi8vIC9zcmMvZXhwZXJpbWVudHMvdHJ1dGhzXG5jb25zdCBUUlVUSFNfUEFUSF9BQlMgPSBwYXRoLmpvaW4oRVhQRVJJTUVOVFNfUEFUSF9BQlMsICd0cnV0aHMnKTtcbi8vIC9zcmMvZXhwZXJpbWVudHMvY29uZmlnc1xuY29uc3QgQ09ORklHU19QQVRIX0FCUyA9IHBhdGguam9pbihFWFBFUklNRU5UU19QQVRIX0FCUywgJ2NvbmZpZ3MnKTtcbi8vIC9zcmMvZXhwZXJpbWVudHMvc3ViamVjdHNcbmNvbnN0IFNVQkpFQ1RTX1BBVEhfQUJTID0gcGF0aC5qb2luKEVYUEVSSU1FTlRTX1BBVEhfQUJTLCAnc3ViamVjdHMnKTtcblxuLypwcm9jZXNzLmVudi5ST09UX1BBVEhfQUJTID0gUk9PVF9QQVRIX0FCUztcbiBwcm9jZXNzLmVudi5TUkNfUEFUSF9BQlMgPSBTUkNfUEFUSF9BQlM7XG4gXG4gcHJvY2Vzcy5lbnYuVEVNUExBVEVTX1BBVEhfQUJTID0gVEVNUExBVEVTX1BBVEhfQUJTO1xuIHByb2Nlc3MuZW52LlNBTEFNQU5ERVJfUEFUSF9BQlMgPSBTQUxBTUFOREVSX1BBVEhfQUJTO1xuIFxuIHByb2Nlc3MuZW52LkVYUEVSSU1FTlRTX1BBVEhfQUJTID0gRVhQRVJJTUVOVFNfUEFUSF9BQlM7XG4gcHJvY2Vzcy5lbnYuVFJVVEhTX1BBVEhfQUJTID0gVFJVVEhTX1BBVEhfQUJTO1xuIHByb2Nlc3MuZW52LkNPTkZJR1NfUEFUSF9BQlMgPSBDT05GSUdTX1BBVEhfQUJTO1xuIHByb2Nlc3MuZW52LlNVQkpFQ1RTX1BBVEhfQUJTID0gU1VCSkVDVFNfUEFUSF9BQlM7Ki9cbmludGVyZmFjZSBTdHJpbmcge1xuICAgIFxuICAgIGh1bWFuKCk6IHN0cmluZ1xuICAgIFxuICAgIGlzZGlnaXQoKTogYm9vbGVhblxuICAgIFxuICAgIGxvd2VyKCk6IHN0cmluZ1xuICAgIFxuICAgIHJlbW92ZUFsbChyZW1vdmVWYWx1ZTogc3RyaW5nIHwgbnVtYmVyIHwgUmVnRXhwIHwgVE1hcDxzdHJpbmc+LCAuLi5yZW1vdmVWYWx1ZXM6IEFycmF5PHN0cmluZyB8IG51bWJlciB8IFJlZ0V4cCB8IFRNYXA8c3RyaW5nPj4pOiBzdHJpbmdcbiAgICBcbiAgICByZXBsYWNlQWxsKHNlYXJjaFZhbHVlOiBUTWFwPHN0cmluZz4pOiBzdHJpbmdcbiAgICBcbiAgICByZXBsYWNlQWxsKHNlYXJjaFZhbHVlOiBzdHJpbmcgfCBudW1iZXIgfCBSZWdFeHAsIHJlcGxhY2VWYWx1ZTogc3RyaW5nKTogc3RyaW5nXG4gICAgXG4gICAgdGl0bGUoKTogc3RyaW5nXG4gICAgXG4gICAgdXBUbyhzZWFyY2hTdHJpbmc6IHN0cmluZywgc2VhcmNoRnJvbUVuZD86IGJvb2xlYW4pOiBzdHJpbmdcbn1cblxuaW50ZXJmYWNlIEFycmF5PFQ+IHtcbiAgICBsb3dlckFsbCgpOiBUW11cbiAgICBcbiAgICBjb3VudChpdGVtOiBUKTogbnVtYmVyXG4gICAgXG4gICAgY291bnQoaXRlbTogRnVuY3Rpb25SZXR1cm5zPGJvb2xlYW4+KTogbnVtYmVyXG59XG5cbi8vICoqICBQeXRob25TaGVsbFxuXG5cbmNvbnNvbGUudGFibGUoe1xuICAgIF9fZGlybmFtZSxcbiAgICBST09UX1BBVEhfQUJTLFxuICAgIFNSQ19QQVRIX0FCUyxcbiAgICBURU1QTEFURVNfUEFUSF9BQlMsXG4gICAgU0FMQU1BTkRFUl9QQVRIX0FCUyxcbiAgICBFWFBFUklNRU5UU19QQVRIX0FCUyxcbiAgICBUUlVUSFNfUEFUSF9BQlMsXG4gICAgQ09ORklHU19QQVRIX0FCUyxcbiAgICBTVUJKRUNUU19QQVRIX0FCUyxcbiAgICBERUJVRywgRFJZUlVOLCBOT1BZVEhPTlxufSk7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShPYmplY3QucHJvdG90eXBlLCBcImtleXNcIiwge1xuICAgIGVudW1lcmFibGUgOiBmYWxzZSxcbiAgICB2YWx1ZSgpOiBBcnJheTxzdHJpbmcgfCBudW1iZXI+IHtcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICByZXR1cm4gT2JqZWN0LmtleXModGhpcykubWFwKGtleSA9PiBrZXkuaXNkaWdpdCgpXG4gICAgICAgICAgICA/IHBhcnNlSW50KGtleSkgOiBrZXkpO1xuICAgIH1cbn0pO1xuLy8gKiogIEFycmF5XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoQXJyYXkucHJvdG90eXBlLCBcImxhc3RcIiwge1xuICAgIGVudW1lcmFibGUgOiBmYWxzZSxcbiAgICB2YWx1ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbdGhpcy5sZW5ndGggLSAxXTtcbiAgICB9XG59LCk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoQXJyYXkucHJvdG90eXBlLCBcImxvd2VyQWxsXCIsIHtcbiAgICBlbnVtZXJhYmxlIDogZmFsc2UsXG4gICAgdmFsdWUoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubWFwKHMgPT4gcy5sb3dlcigpKTtcbiAgICB9XG59LCk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoQXJyYXkucHJvdG90eXBlLCBcInJzb3J0XCIsIHtcbiAgICBlbnVtZXJhYmxlIDogZmFsc2UsXG4gICAgdmFsdWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNvcnQoKG4sIG0pID0+IG4gPCBtKTtcbiAgICB9XG59LCk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoQXJyYXkucHJvdG90eXBlLCBcImNvdW50XCIsIHtcbiAgICBlbnVtZXJhYmxlIDogZmFsc2UsXG4gICAgdmFsdWUoaXRlbTogYW55KTogbnVtYmVyIHtcbiAgICAgICAgbGV0IF9jb3VudCA9IDA7XG4gICAgICAgIGNvbnN0IHsgaXNGdW5jdGlvbiB9ID0gcmVxdWlyZSgndXRpbCcpO1xuICAgICAgICBcbiAgICAgICAgaWYgKCBpc0Z1bmN0aW9uKGl0ZW0pICkge1xuICAgICAgICAgICAgZm9yICggbGV0IHggb2YgdGhpcyApIHtcbiAgICAgICAgICAgICAgICBpZiAoIGl0ZW0oeCkgKSB7XG4gICAgICAgICAgICAgICAgICAgIF9jb3VudCsrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZm9yICggbGV0IHggb2YgdGhpcyApIHtcbiAgICAgICAgICAgICAgICBpZiAoIHggPT09IGl0ZW0gKSB7XG4gICAgICAgICAgICAgICAgICAgIF9jb3VudCsrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBfY291bnQ7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgfVxuICAgIFxufSwpO1xuLy8gKiogIFN0cmluZ1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KFN0cmluZy5wcm90b3R5cGUsIFwidXBUb1wiLCB7XG4gICAgZW51bWVyYWJsZSA6IGZhbHNlLFxuICAgIHZhbHVlKHNlYXJjaFN0cmluZzogc3RyaW5nLCBzZWFyY2hGcm9tRW5kID0gZmFsc2UpOiBzdHJpbmcge1xuICAgICAgICBsZXQgZW5kID0gc2VhcmNoRnJvbUVuZFxuICAgICAgICAgICAgPyB0aGlzLmxhc3RJbmRleE9mKHNlYXJjaFN0cmluZylcbiAgICAgICAgICAgIDogdGhpcy5pbmRleE9mKHNlYXJjaFN0cmluZyk7XG4gICAgICAgIGlmICggZW5kID09PSAtMSApXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYCR7dGhpcy52YWx1ZU9mKCl9LnVwVG8oJHtzZWFyY2hTdHJpbmd9LCR7c2VhcmNoRnJvbUVuZH0pIGluZGV4IGlzIC0xYCk7XG4gICAgICAgIHJldHVybiB0aGlzLnNsaWNlKDAsIGVuZCk7XG4gICAgfVxufSwpO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KFN0cmluZy5wcm90b3R5cGUsIFwiaW5cIiwge1xuICAgIGVudW1lcmFibGUgOiBmYWxzZSxcbiAgICB2YWx1ZShhcnI6IGFueVtdKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiBhcnIuaW5jbHVkZXModGhpcy52YWx1ZU9mKCkpO1xuICAgIH1cbn0sKTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShTdHJpbmcucHJvdG90eXBlLCBcImxvd2VyXCIsIHtcbiAgICBlbnVtZXJhYmxlIDogZmFsc2UsXG4gICAgdmFsdWUoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudG9Mb3dlckNhc2UoKTtcbiAgICB9XG59LCk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoU3RyaW5nLnByb3RvdHlwZSwgXCJ1cHBlclwiLCB7XG4gICAgZW51bWVyYWJsZSA6IGZhbHNlLFxuICAgIHZhbHVlKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLnRvVXBwZXJDYXNlKCk7XG4gICAgfVxufSwpO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KFN0cmluZy5wcm90b3R5cGUsIFwidGl0bGVcIiwge1xuICAgIGVudW1lcmFibGUgOiBmYWxzZSxcbiAgICB2YWx1ZSgpOiBzdHJpbmcge1xuICAgICAgICBcbiAgICAgICAgaWYgKCB0aGlzLmluY2x1ZGVzKCcgJykgKVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc3BsaXQoJyAnKS5tYXAoc3RyID0+IHN0ci50aXRsZSgpKS5qb2luKCcgJyk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJldHVybiB0aGlzWzBdLnVwcGVyKCkgKyB0aGlzLnNsaWNlKDEsIHRoaXMubGVuZ3RoKS5sb3dlcigpO1xuICAgICAgICBcbiAgICB9XG59LCk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoU3RyaW5nLnByb3RvdHlwZSwgXCJpc2RpZ2l0XCIsIHtcbiAgICBlbnVtZXJhYmxlIDogZmFsc2UsXG4gICAgdmFsdWUoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiAhaXNOYU4oTWF0aC5mbG9vcih0aGlzKSk7XG4gICAgfVxufSwpO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KFN0cmluZy5wcm90b3R5cGUsIFwicmVtb3ZlQWxsXCIsIHtcbiAgICBlbnVtZXJhYmxlIDogZmFsc2UsXG4gICAgXG4gICAgdmFsdWUocmVtb3ZlVmFsdWUsIC4uLnJlbW92ZVZhbHVlcykge1xuICAgICAgICBsZXQgdGVtcCA9IHRoaXM7XG4gICAgICAgIGZvciAoIGxldCB2YWx1ZSBvZiBbIHJlbW92ZVZhbHVlLCAuLi5yZW1vdmVWYWx1ZXMgXSApXG4gICAgICAgICAgICB0ZW1wID0gdGVtcC5yZXBsYWNlQWxsKHZhbHVlLCAnJyk7XG4gICAgICAgIHJldHVybiB0ZW1wO1xuICAgIH1cbn0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KFN0cmluZy5wcm90b3R5cGUsIFwicmVwbGFjZUFsbFwiLCB7XG4gICAgZW51bWVyYWJsZSA6IGZhbHNlLFxuICAgIFxuICAgIHZhbHVlKHNlYXJjaFZhbHVlOiAoc3RyaW5nIHwgbnVtYmVyIHwgUmVnRXhwKSB8IFRNYXA8c3RyaW5nPiwgcmVwbGFjZVZhbHVlPzogc3RyaW5nKSB7XG4gICAgICAgIGNvbnN0IHR5cGUgPSB0eXBlb2Ygc2VhcmNoVmFsdWU7XG4gICAgICAgIGlmICggdHlwZSA9PT0gJ3N0cmluZycgfHwgdHlwZSA9PT0gJ251bWJlcicgKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpc1xuICAgICAgICAgICAgICAgIC5zcGxpdChzZWFyY2hWYWx1ZSlcbiAgICAgICAgICAgICAgICAuam9pbihyZXBsYWNlVmFsdWUpO1xuICAgICAgICB9IGVsc2UgaWYgKCB0eXBlID09PSAnb2JqZWN0JyApIHtcbiAgICAgICAgICAgIGlmICggKDxSZWdFeHA+IHNlYXJjaFZhbHVlKS5jb21waWxlICkge1xuICAgICAgICAgICAgICAgIGxldCB0ZW1wID0gdGhpcztcbiAgICAgICAgICAgICAgICBsZXQgcmVwbGFjZWQgPSB0ZW1wLnJlcGxhY2Uoc2VhcmNoVmFsdWUsIHJlcGxhY2VWYWx1ZSk7XG4gICAgICAgICAgICAgICAgd2hpbGUgKCByZXBsYWNlZCAhPT0gdGVtcCApIHtcbiAgICAgICAgICAgICAgICAgICAgdGVtcCA9IHJlcGxhY2VkO1xuICAgICAgICAgICAgICAgICAgICByZXBsYWNlZCA9IHJlcGxhY2VkLnJlcGxhY2Uoc2VhcmNoVmFsdWUsIHJlcGxhY2VWYWx1ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiByZXBsYWNlZDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbGV0IHRlbXAgPSB0aGlzO1xuICAgICAgICAgICAgICAgIGZvciAoIGxldCBbIHN2LCBydiBdIG9mIE9iamVjdC5lbnRyaWVzKHNlYXJjaFZhbHVlKSApXG4gICAgICAgICAgICAgICAgICAgIHRlbXAgPSB0ZW1wLnJlcGxhY2VBbGwoc3YsIHJ2KTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICByZXR1cm4gdGVtcDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgcmVwbGFjZUFsbCBnb3QgYSBiYWQgdHlwZSwgc2VhcmNoVmFsdWU6ICR7c2VhcmNoVmFsdWV9LCB0eXBlOiAke3R5cGV9YCk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgIH1cbn0pO1xuLy8gKiogIE51bWJlclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KE51bWJlci5wcm90b3R5cGUsIFwiaHVtYW5cIiwge1xuICAgIGVudW1lcmFibGUgOiBmYWxzZSxcbiAgICB2YWx1ZShsZXR0ZXJzID0gZmFsc2UpIHtcbiAgICAgICAgY29uc3QgZmxvb3JlZCA9IE1hdGguZmxvb3IodGhpcyk7XG4gICAgICAgIHN3aXRjaCAoIGZsb29yZWQgKSB7XG4gICAgICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGxldHRlcnNcbiAgICAgICAgICAgICAgICAgICAgPyBcInplcm90aFwiXG4gICAgICAgICAgICAgICAgICAgIDogXCIwdGhcIjtcbiAgICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgICAgICByZXR1cm4gbGV0dGVyc1xuICAgICAgICAgICAgICAgICAgICA/IFwiZmlyc3RcIlxuICAgICAgICAgICAgICAgICAgICA6IFwiMXN0XCI7XG4gICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGxldHRlcnNcbiAgICAgICAgICAgICAgICAgICAgPyBcInNlY29uZFwiXG4gICAgICAgICAgICAgICAgICAgIDogXCIybmRcIjtcbiAgICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgICAgICByZXR1cm4gbGV0dGVyc1xuICAgICAgICAgICAgICAgICAgICA/IFwidGhpcmRcIlxuICAgICAgICAgICAgICAgICAgICA6IFwiM3JkXCI7XG4gICAgICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGxldHRlcnNcbiAgICAgICAgICAgICAgICAgICAgPyBcImZvdXJ0aFwiXG4gICAgICAgICAgICAgICAgICAgIDogXCI0dGhcIjtcbiAgICAgICAgICAgIGNhc2UgNTpcbiAgICAgICAgICAgICAgICByZXR1cm4gbGV0dGVyc1xuICAgICAgICAgICAgICAgICAgICA/IFwiZmlmdGhcIlxuICAgICAgICAgICAgICAgICAgICA6IFwiNXRoXCI7XG4gICAgICAgICAgICBjYXNlIDY6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGxldHRlcnNcbiAgICAgICAgICAgICAgICAgICAgPyBcInNpeHRoXCJcbiAgICAgICAgICAgICAgICAgICAgOiBcIjZ0aFwiO1xuICAgICAgICAgICAgY2FzZSA3OlxuICAgICAgICAgICAgICAgIHJldHVybiBsZXR0ZXJzXG4gICAgICAgICAgICAgICAgICAgID8gXCJzZXZlbnRoXCJcbiAgICAgICAgICAgICAgICAgICAgOiBcIjd0aFwiO1xuICAgICAgICAgICAgY2FzZSA4OlxuICAgICAgICAgICAgICAgIHJldHVybiBsZXR0ZXJzXG4gICAgICAgICAgICAgICAgICAgID8gXCJlaWdodGhcIlxuICAgICAgICAgICAgICAgICAgICA6IFwiOHRoXCI7XG4gICAgICAgICAgICBjYXNlIDk6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGxldHRlcnNcbiAgICAgICAgICAgICAgICAgICAgPyBcIm5pbnRoXCJcbiAgICAgICAgICAgICAgICAgICAgOiBcIjl0aFwiO1xuICAgICAgICAgICAgY2FzZSAxMDpcbiAgICAgICAgICAgICAgICByZXR1cm4gbGV0dGVyc1xuICAgICAgICAgICAgICAgICAgICA/IFwidGVudGhcIlxuICAgICAgICAgICAgICAgICAgICA6IFwiMTB0aFwiO1xuICAgICAgICAgICAgY2FzZSAxMTpcbiAgICAgICAgICAgICAgICByZXR1cm4gbGV0dGVyc1xuICAgICAgICAgICAgICAgICAgICA/IFwiZWxldmVudGhcIlxuICAgICAgICAgICAgICAgICAgICA6IFwiMTF0aFwiO1xuICAgICAgICAgICAgY2FzZSAxMjpcbiAgICAgICAgICAgICAgICByZXR1cm4gbGV0dGVyc1xuICAgICAgICAgICAgICAgICAgICA/IFwidHdlbHZldGhcIlxuICAgICAgICAgICAgICAgICAgICA6IFwiMTJ0aFwiO1xuICAgICAgICAgICAgY2FzZSAxMzpcbiAgICAgICAgICAgICAgICByZXR1cm4gbGV0dGVyc1xuICAgICAgICAgICAgICAgICAgICA/IFwidGhpcnRlZW50aFwiXG4gICAgICAgICAgICAgICAgICAgIDogXCIxM3RoXCI7XG4gICAgICAgICAgICBjYXNlIDE0OlxuICAgICAgICAgICAgICAgIHJldHVybiBsZXR0ZXJzXG4gICAgICAgICAgICAgICAgICAgID8gXCJmb3VydGVlbnRoXCJcbiAgICAgICAgICAgICAgICAgICAgOiBcIjE0dGhcIjtcbiAgICAgICAgICAgIGNhc2UgMTU6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGxldHRlcnNcbiAgICAgICAgICAgICAgICAgICAgPyBcImZpZnRlZW50aFwiXG4gICAgICAgICAgICAgICAgICAgIDogXCIxNXRoXCI7XG4gICAgICAgICAgICBjYXNlIDE2OlxuICAgICAgICAgICAgICAgIHJldHVybiBsZXR0ZXJzXG4gICAgICAgICAgICAgICAgICAgID8gXCJzaXh0ZWVudGhcIlxuICAgICAgICAgICAgICAgICAgICA6IFwiMTZ0aFwiO1xuICAgICAgICAgICAgY2FzZSAxNzpcbiAgICAgICAgICAgICAgICByZXR1cm4gbGV0dGVyc1xuICAgICAgICAgICAgICAgICAgICA/IFwic2V2ZW50ZWVudGhcIlxuICAgICAgICAgICAgICAgICAgICA6IFwiMTd0aFwiO1xuICAgICAgICAgICAgY2FzZSAxODpcbiAgICAgICAgICAgICAgICByZXR1cm4gbGV0dGVyc1xuICAgICAgICAgICAgICAgICAgICA/IFwiZWlnaHRlZW50aFwiXG4gICAgICAgICAgICAgICAgICAgIDogXCIxOHRoXCI7XG4gICAgICAgICAgICBjYXNlIDE5OlxuICAgICAgICAgICAgICAgIHJldHVybiBsZXR0ZXJzXG4gICAgICAgICAgICAgICAgICAgID8gXCJuaW50ZWVudGhcIlxuICAgICAgICAgICAgICAgICAgICA6IFwiMTl0aFwiO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBjb25zdCBzdHJpbmdlZCA9IGZsb29yZWQudG9TdHJpbmcoKTtcbiAgICAgICAgICAgICAgICBjb25zdCBsYXN0Q2hhciA9IHN0cmluZ2VkLnNsaWNlKC0xKTtcbiAgICAgICAgICAgICAgICBsZXQgc3VmZml4O1xuICAgICAgICAgICAgICAgIHN3aXRjaCAoIGxhc3RDaGFyICkge1xuICAgICAgICAgICAgICAgICAgICBjYXNlIFwiMVwiOlxuICAgICAgICAgICAgICAgICAgICAgICAgc3VmZml4ID0gXCJzdFwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCIyXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICBzdWZmaXggPSBcIm5kXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcIjNcIjpcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1ZmZpeCA9IFwicmRcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICAgICAgc3VmZml4ID0gXCJ0aFwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBgJHtmbG9vcmVkfSR7c3VmZml4fWA7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgfVxufSk7XG4vLyAqKiAgRGF0ZVxuT2JqZWN0LmRlZmluZVByb3BlcnR5KERhdGUucHJvdG90eXBlLCBcImh1bWFuXCIsIHtcbiAgICBlbnVtZXJhYmxlIDogZmFsc2UsIHZhbHVlKCkge1xuICAgICAgICBsZXQgZCA9IHRoaXMuZ2V0VVRDRGF0ZSgpO1xuICAgICAgICBkID0gZCA8IDEwID8gYDAke2R9YCA6IGQ7XG4gICAgICAgIGxldCBtID0gdGhpcy5nZXRNb250aCgpICsgMTtcbiAgICAgICAgbSA9IG0gPCAxMCA/IGAwJHttfWAgOiBtO1xuICAgICAgICBjb25zdCB5ID0gdGhpcy5nZXRGdWxsWWVhcigpO1xuICAgICAgICBjb25zdCB0ID0gdGhpcy50b1RpbWVTdHJpbmcoKS5zbGljZSgwLCA4KS5yZXBsYWNlQWxsKCc6JywgJy0nKTtcbiAgICAgICAgcmV0dXJuIGAke2R9XyR7bX1fJHt5fV8ke3R9YDtcbiAgICB9XG59KTtcblxuXG4vKm1vZHVsZS5leHBvcnRzID0ge1xuIFB5dGhvblNoZWxsXG4gfTsqL1xuXG5jb25zb2xlLmdyb3VwRW5kKCk7XG4iXX0=