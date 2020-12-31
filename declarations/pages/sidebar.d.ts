/**import sidebar from "../sidebar";
 * import * as Pages from "./pages"; Pages.sidebar.build()
 * */
import type { store } from "../store.js";
declare function select(targetId: store.PageName, { changeTitle }: {
    changeTitle: any;
}): void;
declare function build(): void;
declare const _default: {
    build: typeof build;
    select: typeof select;
};
export default _default;
