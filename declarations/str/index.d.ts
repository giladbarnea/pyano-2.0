declare class Str extends String {
    replaceAll(searchValues: TMap<any>): Str;
    replaceAll(searchValue: string | number, replaceValue: string): Str;
    upTo(searchString: string, searchFromEnd?: boolean): Str;
    lower(): Str;
}
export declare function str(value?: any): Str;
export {};
//# sourceMappingURL=index.d.ts.map