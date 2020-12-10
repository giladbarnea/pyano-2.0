declare function tryCatch(fn: () => Promise<void>, when: string): Promise<void>;
/**require('./Running').load()
 * DONT import * as runningPage, this calls constructors etc*/
declare function load(reload: boolean): Promise<any>;
export { load, tryCatch };
