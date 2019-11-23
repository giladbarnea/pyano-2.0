/**import Glob from './Glob'*/
console.group('Glob.ts');
import { elem } from "./bhe";
import { MyStore } from "./MyStore";

const Store = new MyStore(true);
let skipFade = false;
const MainContent = elem({ id : 'main_content' });
const Sidebar = elem({ id : 'sidebar' });
const Title = elem({ id : 'title' });
console.groupEnd();
export default { skipFade, MainContent, Sidebar, Title, Store }
