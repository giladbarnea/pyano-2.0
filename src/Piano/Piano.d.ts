import { Context, Gain, Param, ToneAudioNode, Unit } from 'tone';

export interface PianoOptions {
    /**
     * The audio context. Defaults to the global Tone audio context
     */
    context: Context;
    /**
     * The number of velocity steps to load
     */
    velocities: number;
    /**
     * The lowest note to load
     */
    minNote: number;
    /**
     * The highest note to load
     */
    maxNote: number;
    /**
     * If it should include a 'release' sounds composed of a keyclick and string harmonic
     */
    release: boolean;
    /**
     * If the piano should include a 'pedal' sound.
     */
    pedal: boolean;
    /**
     * The directory of the salamander grand piano samples
     */
    samples: string;
    /**
     * Volume levelts for each of the components (in decibels)
     */
    volume: {
        pedal: number;
        strings: number;
        keybed: number;
        harmonics: number;
    };
}

/**
 *  The Piano
 */
export declare class Piano extends ToneAudioNode<PianoOptions> {
    readonly name = "Piano";
    readonly input: any;
    readonly output: Gain<number>;
    /**
     * The string harmonics
     */
    private _harmonics;
    /**
     * The keybed release sound
     */
    private _keybed;
    /**
     * The pedal
     */
    private _pedal;
    /**
     * The strings
     */
    private _strings;
    /**
     * The volume level of the strings output. This is the main piano sound.
     */
    strings: Param<Unit.Decibels>;
    /**
     * The volume output of the pedal up and down sounds
     */
    pedal: Param<Unit.Decibels>;
    /**
     * The volume of the string harmonics
     */
    harmonics: Param<Unit.Decibels>;
    /**
     * The volume of the keybed click sound
     */
    keybed: Param<Unit.Decibels>;
    /**
     * The sustained notes
     */
    private _sustainedNotes;
    /**
     * The currently held notes
     */
    private _heldNotes;
    /**
     * If it's loaded or not
     */
    private _loaded;
    
    constructor(options?: Partial<PianoOptions>);
    
    static getDefaults(): PianoOptions;
    
    /**
     *  Load all the samples
     */
    load(): Promise<void>;
    
    /**
     * If all the samples are loaded or not
     */
    get loaded(): boolean;
    
    /**
     *  Put the pedal down at the given time. Causes subsequent
     *  notes and currently held notes to sustain.
     *  @param time  The time the pedal should go down
     */
    pedalDown(time?: Unit.Time): this;
    
    /**
     *  Put the pedal up. Dampens sustained notes
     *  @param time  The time the pedal should go up
     */
    pedalUp(time?: Unit.Time): this;
    
    /**
     *  Play a note.
     *  @param note      The note to play. If it is a number, it is assumed to be MIDI
     *  @param velocity  The velocity to play the note
     *  @param time      The time of the event
     */
    keyDown(note: string | number, time?: Unit.Time, velocity?: number): this;
    
    /**
     *  Release a held note.
     */
    keyUp(note: string | number, time?: Unit.Time, velocity?: number): this;
    
    stopAll(): this;
}

export {};
//# sourceMappingURL=Piano.d.ts.map
