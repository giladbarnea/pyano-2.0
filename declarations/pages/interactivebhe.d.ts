export interface IInteractive {
    /**Load slow / heavy resources to memory and set them to `this. ...` attributes.
     * Logic that should've been in `constructor` if it didn't take a lot of time. */
    init?(hasToDoWithSubconfig: any): Promise<void>;
    /**Intro to the experiment. The first thing that the user experiences.
     * Can be skipped via `dev.skip_experiment_intro`*/
    intro(): Promise<void>;
    levelIntro(...args: any[]): Promise<void>;
    /**Private. Used internally by Animation and Video */
    play?(notes?: number, rate?: number): Promise<void>;
    record?(hasToDoWithLevel: any): Promise<void>;
}
