/**Thrown when either too much or not enough arguments were passed. Prints what was expected and what was actually passed.*/
declare class BadArgumentsAmountError extends Error {
    /**@param expectedArgsNum - Being a number and not array, it implies function requires an exact number of args*/
    constructor(expectedArgsNum: number, passedArgs: object, details?: string);
    /**@param expectedArgsNum - Being a 2-tuple and not a number, implies function requires between this and that number of args*/
    constructor(expectedArgsNum: [number, number], passedArgs: object, details?: string);
    static getArgNamesValues(argsWithValues: object): string;
    static getArgsWithValues(passedArgs: object): object;
}
//# sourceMappingURL=exceptions.d.ts.map