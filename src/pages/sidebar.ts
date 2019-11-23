console.group('pages.sidebar.ts');
import Glob from "../Glob";

import { enumerate, str } from "../util";
import { span } from "../bhe";
import { toPage } from ".";


function build() {
    console.log('sidebar build');
    const sidebarItems = [];
    const sidebarDict = {
        new : "New",
        record : 'Record',
        file_tools : 'File Tools',
        settings : "Settings",
    };
    for ( let [ i, [ eid, human ] ] of enumerate(enumerate(sidebarDict)) ) {
        
        const gridRow = str(i + 1);
        const id = `sidebar_${eid}`;
        sidebarItems.push((span({ text : human }))
            .id(id)
            .addClass(`sidebar-item`)
            .css({ gridRow : `${gridRow}/${gridRow}` })
            .click(() => toPage(eid, true))
        );
        
        
    }
    
    Glob.Sidebar.append(...sidebarItems);
}

export default { build }
console.groupEnd();