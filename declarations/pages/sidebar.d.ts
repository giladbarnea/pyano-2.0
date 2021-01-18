import type { store } from "store";
declare function select(targetId: store.PageName, { changeTitle }: {
    changeTitle: any;
}): void;
declare function build(): void;
declare const _default: {
    build: typeof build;
    select: typeof select;
};
export default _default;
