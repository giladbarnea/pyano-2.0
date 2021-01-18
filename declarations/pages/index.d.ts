import type { store } from "store";
import sidebar from "./sidebar";
declare function toPage(page: store.PageName, reload: boolean): Promise<any>;
export { sidebar, toPage };
