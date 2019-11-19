declare type TDict<T> = Dict<T> & {
    [P in keyof T]: T[P];
};
declare class Dict<T> {
    constructor(obj: T);
    items(): [string, T[keyof T]][];
    keys(): string[];
    values(): string[];
}
export declare function dict<T>(obj: T): TDict<T>;
export {};
//# sourceMappingURL=index.d.ts.map