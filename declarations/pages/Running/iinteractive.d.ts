export interface Stages {
    /**Intro to the experiment. The first thing that the user experiences.
     * Can be skipped via `dev.skip_experiment_intro`*/
    intro(): Promise<void>;
    levelIntro(...args: any[]): Promise<void>;
}
export interface IInteractive extends Stages {
    /**Load slow / heavy resources to memory and set them to `this. ...` attributes.
     * Logic that should've been in `constructor` if it didn't take a lot of time. */
    init(hasToDoWithSubconfig?: any): Promise<void> | void;
}
/**Private. Used internally by Animation and Video */
export interface InteractiveIn extends IInteractive {
    record(hasToDoWithLevel: any): void | Promise<void>;
}
export interface InteractiveOut extends IInteractive {
    play(notes?: number, rate?: number): Promise<void>;
}
