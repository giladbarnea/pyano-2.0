declare type jQuery = any;
declare function $fadeOut(jQuery: jQuery, ms: number): Promise<jQuery>;
declare function $fadeIn(jQuery: jQuery, ms: number): Promise<jQuery>;
declare function $fadeInMany(ms: number, ...jQueries: jQuery[]): Promise<jQuery[]>;
declare function $fadeOutMany(ms: number, ...jQueries: jQuery[]): Promise<jQuery[]>;
declare function concurrent<T>(...promises: Promise<T | void>[] | T[] | void[]): Promise<(void | T)[]>;
declare const _default: {
    $fadeIn: typeof $fadeIn;
    $fadeInMany: typeof $fadeInMany;
    $fadeOut: typeof $fadeOut;
    $fadeOutMany: typeof $fadeOutMany;
    concurrent: typeof concurrent;
};
export default _default;
//# sourceMappingURL=index.d.ts.map