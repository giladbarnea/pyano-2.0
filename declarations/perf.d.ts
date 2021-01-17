interface ExPerformanceEntryList extends PerformanceEntryList {
    name: string;
    avg(): number;
}
declare function mark(markName: string): void;
declare function measure(startMark: string, endMark: string): void;
declare function measureMany(...startEndPairs: string[][]): void;
declare function getMeasures(startMark: string, endMark: string): ExPerformanceEntryList;
declare function getManyMeasures(...startEndPairs: string[][]): ExPerformanceEntryList[];
declare function timeit(fn: any, label: any): void;
declare const _default: {
    mark: typeof mark;
    measure: typeof measure;
    measureMany: typeof measureMany;
    getManyMeasures: typeof getManyMeasures;
    getMeasures: typeof getMeasures;
    timeit: typeof timeit;
};
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
export default _default;
