console.group('pages.sidebar.ts');
import Glob from "../Glob";
import { PageName } from "../MyStore";

import { enumerate, str } from "../util";
import { span } from "../bhe";
import * as Pages from ".";


function select(targetId: PageName, { changeTitle }) {
    let html;
    for ( let sidebarItem of Glob.Sidebar.children() ) {
        if ( sidebarItem.id() === `sidebar_${targetId}` ) {
            html = sidebarItem.html();
            sidebarItem.addClass("selected");
        } else {
            sidebarItem.removeClass("selected");
        }
    }
    if ( changeTitle ) {
        Glob.Title.html(html.title());
    }
}

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
            .click(() => {
                // _selectSidebarItem(eid, { changeTitle : true });
                return Pages.toPage(eid, true);
            })
        );
        
        
    }
    
    Glob.Sidebar.append(...sidebarItems);
}

export default { build, select }
console.groupEnd();
