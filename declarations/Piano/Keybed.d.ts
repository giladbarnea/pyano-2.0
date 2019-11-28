import { PianoComponent, PianoComponentOptions } from './Component';
interface KeybedOptions extends PianoComponentOptions {
    minNote: number;
    maxNote: number;
}
export declare class Keybed extends PianoComponent {
    private _buffers;
    private _urls;
    constructor(options: KeybedOptions);
    protected _internalLoad(): Promise<void>;
    start(note: number, time: number, velocity: number): void;
}
export {};
//# sourceMappingURL=Keybed.d.ts.map