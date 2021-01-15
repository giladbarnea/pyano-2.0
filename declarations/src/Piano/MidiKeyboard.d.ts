/// <reference types="node" />
import { EventEmitter } from 'events';
import type { IMsg } from "../python";
export declare class MidiKeyboard extends EventEmitter {
    readonly ready: Promise<unknown>;
    readonly msgs: IMsg[];
    private connectedDevices;
    constructor();
    private _addListeners;
    private _removeListeners;
}
