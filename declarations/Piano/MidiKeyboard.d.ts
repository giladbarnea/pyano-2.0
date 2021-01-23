/// <reference types="node" />
import { EventEmitter } from 'events';
import type { IMsg } from "python";
import { InteractiveIn, Stages } from 'pages/Running/iinteractive';
import { Level } from "level";
export declare class MidiKeyboard extends EventEmitter implements Omit<InteractiveIn, keyof Stages> {
    readonly msgs: IMsg[];
    private connectedDevices;
    /**`noteOnHandler` and `noteOffHandler` push to `this.msgs` only when `recording` is true */
    private recording;
    constructor();
    toString(): string;
    init(): Promise<void>;
    record(level: Level): void;
    stopRecord(): void;
    private _addListeners;
    private _removeListeners;
    private noteOnHandler;
    private noteOffHandler;
}
