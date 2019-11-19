declare class BadArgumentsAmountError extends Error {
    constructor(expectedArgsNum: number, passedArgs: object, details?: string);
    constructor(expectedArgsNum: [number, number], passedArgs: object, details?: string);
    static getArgNamesValues(argsWithValues: object): string;
    static getArgsWithValues(passedArgs: object): object;
}
//# sourceMappingURL=exceptions.d.ts.map