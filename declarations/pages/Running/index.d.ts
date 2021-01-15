declare function tryCatch<T>(fn: () => Promise<T>, when: string): Promise<T | false>;
/**require('./Running').load()
 * DONT import * as runningPage, this calls constructors etc*/
declare function load(reload: boolean): Promise<void>;
export { load, tryCatch };
