import * as fs from "fs";

/**import Glob from './Glob'*/
console.group('Glob.ts');
import { elem } from "./bhe";
import { BigConfigCls } from "./MyStore";
import { bool } from "./util";
import * as path from "path";

const BigConfig = new BigConfigCls(true);
let skipFade = false;
const MainContent = elem({ id : 'main_content' });
const Sidebar = elem({ id : 'sidebar' });
const Title = elem({ id : 'title' });
function getTruthFilesWhere({extension}:{extension?:string} = {extension:undefined}): string[] {
        if ( extension ) {
            if ( extension.startsWith('.') )
                extension = extension.slice(1);
            if ( ![ 'txt', 'mid', 'mp4' ].includes(extension) ) {
                console.warn(`truthFilesList("${extension}"), must be either ['txt','mid','mp4'] or not at all. setting to undefined`);
                extension = undefined;
            }
        }
        
        // const truthsDirPath = this.truthsDirPath();
        
        let truthFiles = [ ...new Set(fs.readdirSync(TRUTHS_PATH_ABS)) ];
        if ( bool(extension) )
            return truthFiles.filter(f => path.extname(f) === `.${extension}`);
        return truthFiles;
    }
console.groupEnd();
export default { skipFade, MainContent, Sidebar, Title, BigConfig,getTruthFilesWhere }
