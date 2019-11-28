import { PianoComponent, PianoComponentOptions } from './Component';
interface StringsOptions extends PianoComponentOptions {
    minNote: number;
    maxNote: number;
    velocities: number;
}
export declare class PianoStrings extends PianoComponent {
    private _strings;
    private _activeNotes;
    constructor(options: StringsOptions);
    private scale;
    triggerAttack(note: number, time: number, velocity: number): void;
    triggerRelease(note: number, time: number): void;
    protected _internalLoad(): Promise<void>;
}
export {};
//# sourceMappingURL=Strings.d.ts.map