
import type { store } from "store";

import Glob from "Glob";


import { span } from "bhe";
import * as Pages from ".";


function select(targetId: store.PageName, { changeTitle }) {
    let html;
    for (let sidebarItem of Glob.Sidebar.children()) {
        if (sidebarItem.id() === `sidebar_${targetId}`) {
            html = sidebarItem.html();
            sidebarItem.addClass("selected");
        } else {
            sidebarItem.removeClass("selected");
        }
    }
    if (changeTitle) {
        Glob.Title.text(html.title());
    }
}

function build() {
    console.debug('sidebar build');
    const sidebarItems = [];
    const sidebarMap = {
        new: "New",
        record: 'Record',
        file_tools: 'File Tools',
        settings: "Settings",
    };
    for (let [i, [eid, human]] of util.enumerate(util.enumerate(sidebarMap))) {

        const id = `sidebar_${eid}`;
        sidebarItems.push((span({ text: human, setid: id, cls: 'sidebar-item' }))
            .click(() => Pages.toPage(eid as store.PageName, true))
        );


    }

    Glob.Sidebar.append(...sidebarItems);
}

export default { build, select }
