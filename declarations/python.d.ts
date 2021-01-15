declare type Kind = 'on' | 'off';
interface IMsg {
    kind: Kind;
    note: number;
    time: number;
    time_delta?: number | null;
    last_onmsg_time?: number | null;
    velocity?: number | null;
}
declare type IPairs = Array<[IMsg, IMsg]>;
import { Options, PythonShell, PythonShellError } from 'python-shell';
declare class Python extends PythonShell {
    static readonly colorRegex: RegExp;
    private readonly json;
    constructor(scriptPath: string, options?: Options);
    static handleArguments(scriptPath: string, options?: Options): [string, Options];
    static run(scriptPath: string, options?: Options, callback?: (err?: PythonShellError, output?: any[]) => any): PythonShell;
    runAsync<T>(): Promise<TMap<T>>;
}
export { Python, IPairs, IMsg, Kind };
