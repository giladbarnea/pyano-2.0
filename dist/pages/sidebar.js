Object.defineProperty(exports, "__esModule", { value: true });
console.group('pages.sidebar.ts');
const Glob_1 = require("../Glob");
const bhe_1 = require("../bhe");
const Pages = require(".");
function select(targetId, { changeTitle }) {
    let html;
    for (let sidebarItem of Glob_1.default.Sidebar.children()) {
        if (sidebarItem.id() === `sidebar_${targetId}`) {
            html = sidebarItem.html();
            sidebarItem.addClass("selected");
        }
        else {
            sidebarItem.removeClass("selected");
        }
    }
    if (changeTitle) {
        Glob_1.default.Title.text(html.title());
    }
}
function build() {
    console.log('sidebar build');
    const sidebarItems = [];
    const sidebarDict = {
        new: "New",
        record: 'Record',
        file_tools: 'File Tools',
        settings: "Settings",
    };
    for (let [i, [eid, human]] of util.enumerate(util.enumerate(sidebarDict))) {
        const id = `sidebar_${eid}`;
        sidebarItems.push((bhe_1.span({ text: human, setid: id, cls: 'sidebar-item' }))
            .click(() => Pages.toPage(eid, true)));
    }
    Glob_1.default.Sidebar.append(...sidebarItems);
}
exports.default = { build, select };
console.groupEnd();
//# sourceMappingURL=sidebar.js.map