import { Div, Button } from "../../../bhe";
declare class LevelsDiv extends Div {
    addLevelBtn: Button;
    removeLevelBtn: Button;
    constructor({ id }: {
        id: any;
    });
    addLevel(): void;
    private removeLevel;
}
declare const levelsDiv: LevelsDiv;
export default levelsDiv;
//# sourceMappingURL=levels.d.ts.map