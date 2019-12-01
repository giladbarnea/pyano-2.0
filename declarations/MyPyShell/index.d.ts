import { Options, PythonShell, PythonShellError } from 'python-shell';
declare class MyPyShell extends PythonShell {
    static readonly colorRegex: RegExp;
    constructor(scriptPath: string, options?: Options);
    static handleArguments(scriptPath: string, options?: Options): [string, Options];
    runAsync(): Promise<string[]>;
    static run(scriptPath: string, options?: Options, callback?: (err?: PythonShellError, output?: any[]) => any): PythonShell;
}
declare function isDone(): boolean;
export { isDone, MyPyShell };
//# sourceMappingURL=index.d.ts.map