import { Context, Gain, Param, ToneAudioNode, Unit } from 'tone';
interface PianoOptions {
    context: Context;
    velocities: number;
    minNote: number;
    maxNote: number;
    release: boolean;
    pedal: boolean;
    samples: string;
    volume: {
        pedal: number;
        strings: number;
        keybed: number;
        harmonics: number;
    };
}
export declare class Piano extends ToneAudioNode<PianoOptions> {
    readonly name = "Piano";
    readonly input: any;
    readonly output: Gain<"gain">;
    private _harmonics;
    private _keybed;
    private _pedal;
    private _strings;
    strings: Param<Unit.Decibels>;
    pedal: Param<Unit.Decibels>;
    harmonics: Param<Unit.Decibels>;
    keybed: Param<Unit.Decibels>;
    private _sustainedNotes;
    private _heldNotes;
    private _loaded;
    constructor(options?: Partial<PianoOptions>);
    static getDefaults(): PianoOptions;
    load(): Promise<void>;
    get loaded(): boolean;
    pedalDown(time?: Unit.Time): this;
    pedalUp(time?: Unit.Time): this;
    keyDown(note: string | number, time?: Unit.Time, velocity?: number): this;
    keyUp(note: string | number, time?: Unit.Time, velocity?: number): this;
    stopAll(): this;
}
export {};
//# sourceMappingURL=Piano.d.ts.map