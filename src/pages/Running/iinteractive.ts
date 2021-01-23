// import { VisualBHE } from "bhe/extra";


// ** Stages
export interface Stages {
    /**Intro to the experiment. The first thing that the user experiences.
     * Can be skipped via `dev.skip_experiment_intro`*/
    intro(): Promise<void>

    levelIntro(...args:any[]): Promise<void>
}

export interface IInteractive extends Stages {
    /**Load slow / heavy resources to memory and set them to `this. ...` attributes.
     * Logic that should've been in `constructor` if it didn't take a lot of time. */
    init(hasToDoWithSubconfig?: any): Promise<void> | void;

}

// ** Private methods used by Stages
/**Private. Used internally by Animation and Video */
export interface InteractiveIn extends IInteractive {
    record(hasToDoWithLevel: any): void | Promise<void>
}

export interface InteractiveOut extends IInteractive {

    play(notes?: number, rate?: number): Promise<void>

}

/*export abstract class Interactive<Generic extends HTMLElement = HTMLElement> {

    init?(arg: any): Promise<void>;


    abstract intro(): Promise<void>

    //
    abstract levelIntro(...args: any[]): Promise<void>

    record?(hasToDoWithLevel: any): Promise<void>

    play?(notes?: number, rate?: number): Promise<void>
}

export abstract class InteractiveBHE<Generic extends HTMLElement> extends VisualBHE<Generic> implements Interactive<Generic> {
    init(arg: any): Promise<void> {
        return Promise.resolve(undefined);
    }

    intro(): Promise<void> {
        return Promise.resolve(undefined);
    }

    levelIntro(args: any): Promise<void> {
        return Promise.resolve(undefined);
    }

    play(notes: number | undefined, rate: number | undefined): Promise<void> {
        return Promise.resolve(undefined);
    }

    record(hasToDoWithLevel: any): Promise<void> {
        return Promise.resolve(undefined);
    }

}*/

/*export interface IInteractive<Generic extends HTMLElement = HTMLElement> {
    // play(notes?: number, rate?: number): Promise<void>
    play?: any;
}

export interface Interactive extends _Interactive {
}*/

/*export abstract class InteractiveBHE<Generic extends HTMLElement = HTMLElement> extends VisualBHE<Generic> {
    protected constructor(options) {
        super(options);
    }

    /!**Load slow / heavy resources to memory and set them to `this. ...` attributes.
     * Logic that should've been in `constructor` if it didn't take a lot of time. *!/
    async init(arg: any): Promise<void> {
    }

    /!**Intro to the experiment. The first thing that the user experiences.
     * Can be skipped via `dev.skip_experiment_intro`*!/
    abstract intro(): Promise<void>

    abstract levelIntro(...args: any[]): Promise<void>
}*/
