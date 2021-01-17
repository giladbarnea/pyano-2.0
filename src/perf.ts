interface ExPerformanceEntryList extends PerformanceEntryList {
    name: string;
    
    avg(): number;
}

function mark(markName: string) {
    window.performance.mark(markName);
}

function measure(startMark: string, endMark: string) {
    window.performance.measure(`${startMark} -> ${endMark}`, startMark, endMark);
}

function measureMany(...startEndPairs: string[][]) {
    for ( let [ start, end ] of startEndPairs )
        measure(start, end);
}

function getMeasures(startMark: string, endMark: string): ExPerformanceEntryList {
    const name = `${startMark} -> ${endMark}`;
    const measures = <ExPerformanceEntryList> window.performance.getEntriesByName(name, 'measure');
    
    
    measures.avg = () => {
        let _durations = measures.map(m => m.duration);
        let _sum = _durations.reduce((a, b) => a + b);
        return _sum / _durations.length;
    };
    measures.name = name;
    return measures;
}

function getManyMeasures(...startEndPairs: string[][]): ExPerformanceEntryList[] {
    const manyMeasures = [];
    for ( let [ start, end ] of startEndPairs )
        manyMeasures.push(getMeasures(start, end));
    return manyMeasures;
}

function timeit(fn, label) {
    console.time(label)
    fn()
    console.timeEnd(label)
}
/**@example
 for(...) {
   perf.mark('start');
   // do something
   perf.mark('end');
   perf.measure('start', 'end');
 }
 const measures = perf.getMeasures('start', 'end');
 console.log(measures.name, measures.avg());    // results in ms
 >>> start -> end 48.01234567891011127
 */
export default { mark, measure, measureMany, getManyMeasures, getMeasures, timeit }
