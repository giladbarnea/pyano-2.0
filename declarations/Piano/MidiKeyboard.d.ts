/// <reference types="node" />
import { EventEmitter } from 'events';
import { IMsg } from "../MyPyShell";
export declare class MidiKeyboard extends EventEmitter {
    private connectedDevices;
    readonly ready: Promise<unknown>;
    readonly msgs: IMsg[];
    constructor();
    private _addListeners;
    private _removeListeners;
}
