import { PianoComponent, PianoComponentOptions } from './Component';
export declare class Pedal extends PianoComponent {
    private _downTime;
    private _currentSound;
    private _buffers;
    constructor(options: PianoComponentOptions);
    protected _internalLoad(): Promise<void>;
    private _squash;
    private _playSample;
    down(time: number): void;
    up(time: number): void;
    isDown(time: number): boolean;
}
//# sourceMappingURL=Pedal.d.ts.map