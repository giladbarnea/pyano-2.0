declare type Kind = 'on' | 'off';
interface IMsg {
    kind: Kind;
    note: number;
    time: number;
    time_delta?: number | null;
    last_onmsg_time?: number | null;
    velocity?: number | null;
}
declare type OnOffPairs = [onmsg: IMsg, offmsg: IMsg][];
import { PythonShell, PythonShellError } from 'python-shell';
import type { Options } from "python-shell";
declare class Python extends PythonShell {
    static readonly colorRegex: RegExp;
    private readonly json;
    constructor(scriptPath: string, options?: Options);
    static parseArguments(scriptPath: string, options?: Options): [scriptPath: string, options: Options];
    static run(scriptPath: string, options?: Options, callback?: (err?: PythonShellError, output?: any[]) => any): PythonShell;
    toString(): string;
    runAsync<T>(): Promise<TMap<T>>;
}
export { Python, OnOffPairs, IMsg, Kind };
