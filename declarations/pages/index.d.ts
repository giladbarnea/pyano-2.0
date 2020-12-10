/**import * as Pages from './pages'*/
import { store } from "../store.js";
import sidebar from "./sidebar";
declare function toPage(page: store.PageName, reload: boolean): Promise<any>;
export { sidebar, toPage };
