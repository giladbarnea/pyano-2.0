import { elem } from "./bhe";
import { BigConfigCls } from "./MyStore";

/**import Glob from './Glob'*/
console.group('Glob.ts');

const BigConfig = new BigConfigCls(true);
let skipFade = false;
const MainContent = elem({ id : 'main_content' });
const Sidebar = elem({ id : 'sidebar' });
const Title = elem({ id : 'title' });
console.groupEnd();
export default { skipFade, MainContent, Sidebar, Title, BigConfig }
