/**@param {jQuery} jQuery
 @param {number} ms
 @return {Promise<jQuery>}*/
declare function $fadeOut(jQuery: any, ms: any): Promise<unknown>;
/**@param {jQuery} jQuery
 @param {number} ms
 @reutrn {Promise<jQuery>}*/
declare function $fadeIn(jQuery: any, ms: any): Promise<unknown>;
/**@param {number} ms
 @param {...jQuery} jQueries
 @return {Promise<jQuery[]>}*/
declare function $fadeInMany(ms: any, ...jQueries: any[]): Promise<any[]>;
/**@param {number} ms
 @param {...jQuery} jQueries
 @return {Promise<jQuery[]>}*/
declare function $fadeOutMany(ms: any, ...jQueries: any[]): Promise<any[]>;
/**@template T
 * @param {Promise<T>|Promise<void>|T|void} promises
 * @return {Promise<T[]>}*/
declare function concurrent(...promises: any[]): Promise<any[]>;
/**@template T
 * @param {...function():Promise<T>|T|void} fns
 * @return {Promise<T[]>}*/
declare function waterfall(...fns: any[]): Promise<void>;
//# sourceMappingURL=index.d.ts.map