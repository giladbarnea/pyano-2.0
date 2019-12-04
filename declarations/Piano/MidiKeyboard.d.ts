/// <reference types="node" />
import { EventEmitter } from 'events';
import { IMsg } from "../MyPyShell";
export declare class MidiKeyboard extends EventEmitter {
    private connectedDevices;
    readonly ready: Promise<unknown>;
    readonly notes: IMsg[];
    constructor();
    private _addListeners;
    private _removeListeners;
}
//# sourceMappingURL=MidiKeyboard.d.ts.map