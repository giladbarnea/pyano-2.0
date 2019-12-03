declare type Kind = 'on' | 'off';
interface IMsg {
    kind: Kind;
    note: number;
    time: number;
    time_delta: number | null;
    last_onmsg_time: number | null;
    velocity: number | null;
}
declare type IPairs = Array<[IMsg, IMsg]>;
import { Options, PythonShell, PythonShellError } from 'python-shell';
declare class MyPyShell extends PythonShell {
    static readonly colorRegex: RegExp;
    private readonly json;
    constructor(scriptPath: string, options?: Options);
    static handleArguments(scriptPath: string, options?: Options): [string, Options];
    runAsync<T>(): Promise<TMap<T>>;
    static run(scriptPath: string, options?: Options, callback?: (err?: PythonShellError, output?: any[]) => any): PythonShell;
}
declare function isDone(): boolean;
export { isDone, MyPyShell, IPairs, IMsg, Kind };
//# sourceMappingURL=index.d.ts.map