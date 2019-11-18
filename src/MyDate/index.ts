import { str } from "../str";

class MyDate extends Date {
    human() {
        let d = this.getUTCDate();
        d = d < 10 ? `0${d}` : d;
        let m = this.getMonth() + 1;
        m = m < 10 ? `0${m}` : m;
        const y = this.getFullYear();
        const t = str(this.toTimeString().slice(0, 8)).replaceAll(':', '-');
        return `${d}_${m}_${y}_${t}`;
    }
}

export function date(value: number | string | Date) {
    return new MyDate(value)
}
