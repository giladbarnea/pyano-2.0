/// <reference types="node" />
import { EventEmitter } from 'events';
export declare class MidiKeyboard extends EventEmitter {
    private connectedDevices;
    readonly ready: Promise<unknown>;
    constructor();
    private _addListeners;
    private _removeListeners;
}
//# sourceMappingURL=MidiKeyboard.d.ts.map