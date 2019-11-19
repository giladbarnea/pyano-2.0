declare class Str extends String {
    replaceAll(searchValues: TMap<any>, replaceValue: string): this;
    replaceAll(searchValue: string | number, replaceValue: string): this;
    /**Non inclusive*/
    upTo(searchString: string, searchFromEnd?: boolean): string;
}
export declare function str(value?: any): Str;
export {};
//# sourceMappingURL=index.d.ts.map