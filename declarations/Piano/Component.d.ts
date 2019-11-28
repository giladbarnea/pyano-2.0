import { Context, Param, ToneAudioNode, Unit, Volume } from 'tone';
export interface PianoComponentOptions {
    context: Context;
    volume: Unit.Decibels;
    enabled: boolean;
    samples: string;
}
export interface UrlsMap {
    [note: string]: string;
}
export declare abstract class PianoComponent extends ToneAudioNode {
    readonly name = "PianoComponent";
    readonly input: any;
    readonly output: Volume;
    protected _enabled: boolean;
    readonly volume: Param<Unit.Decibels>;
    private _loaded;
    readonly samples: string;
    constructor(options: PianoComponentOptions);
    protected abstract _internalLoad(): Promise<void>;
    get loaded(): boolean;
    load(): Promise<void>;
}
//# sourceMappingURL=Component.d.ts.map