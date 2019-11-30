interface ExPerformanceEntryList extends PerformanceEntryList {
    name: string;
    avg(): number;
}
declare function mark(markName: string): void;
declare function measure(startMark: string, endMark: string): void;
declare function measureMany(...startEndPairs: string[][]): void;
declare function getMeasures(startMark: string, endMark: string): ExPerformanceEntryList;
declare function getManyMeasures(...startEndPairs: string[][]): ExPerformanceEntryList[];
declare const _default: {
    mark: typeof mark;
    measure: typeof measure;
    measureMany: typeof measureMany;
    getManyMeasures: typeof getManyMeasures;
    getMeasures: typeof getMeasures;
};
export default _default;
//# sourceMappingURL=perf.d.ts.map