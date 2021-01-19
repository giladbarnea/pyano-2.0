/// <reference types="node" />
import { EventEmitter } from 'events';
import type { IMsg } from "python";
import { InteractiveIn, Stages } from 'pages/interactivebhe';
import { Level } from "level";
export declare class MidiKeyboard extends EventEmitter implements Omit<InteractiveIn, keyof Stages> {
    readonly msgs: IMsg[];
    private connectedDevices;
    constructor();
    init(): Promise<void>;
    record(level: Level): Promise<void>;
    private _addListeners;
    private _removeListeners;
}
