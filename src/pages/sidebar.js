"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
console.group('pages.sidebar.ts');
const Glob_1 = require("../Glob");
const util_1 = require("../util");
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
    for (let [i, [eid, human]] of util_1.enumerate(util_1.enumerate(sidebarDict))) {
        const id = `sidebar_${eid}`;
        sidebarItems.push((bhe_1.span({ text: human, setid: id, cls: 'sidebar-item' }))
            .click(() => Pages.toPage(eid, true)));
    }
    Glob_1.default.Sidebar.append(...sidebarItems);
}
exports.default = { build, select };
console.groupEnd();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2lkZWJhci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInNpZGViYXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFHQSxPQUFPLENBQUMsS0FBSyxDQUFDLGtCQUFrQixDQUFDLENBQUM7QUFDbEMsa0NBQTJCO0FBRzNCLGtDQUFvQztBQUNwQyxnQ0FBOEI7QUFDOUIsMkJBQTJCO0FBRzNCLFNBQVMsTUFBTSxDQUFDLFFBQWtCLEVBQUUsRUFBRSxXQUFXLEVBQUU7SUFDL0MsSUFBSSxJQUFJLENBQUM7SUFDVCxLQUFLLElBQUksV0FBVyxJQUFJLGNBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLEVBQUU7UUFDN0MsSUFBSSxXQUFXLENBQUMsRUFBRSxFQUFFLEtBQUssV0FBVyxRQUFRLEVBQUUsRUFBRTtZQUM1QyxJQUFJLEdBQUcsV0FBVyxDQUFDLElBQUksRUFBRSxDQUFDO1lBQzFCLFdBQVcsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUM7U0FDcEM7YUFBTTtZQUNILFdBQVcsQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7U0FDdkM7S0FDSjtJQUNELElBQUksV0FBVyxFQUFFO1FBQ2IsY0FBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7S0FDakM7QUFDTCxDQUFDO0FBRUQsU0FBUyxLQUFLO0lBQ1YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsQ0FBQztJQUM3QixNQUFNLFlBQVksR0FBRyxFQUFFLENBQUM7SUFDeEIsTUFBTSxXQUFXLEdBQUc7UUFDaEIsR0FBRyxFQUFFLEtBQUs7UUFDVixNQUFNLEVBQUUsUUFBUTtRQUNoQixVQUFVLEVBQUUsWUFBWTtRQUN4QixRQUFRLEVBQUUsVUFBVTtLQUN2QixDQUFDO0lBQ0YsS0FBSyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDLElBQUksZ0JBQVMsQ0FBQyxnQkFBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDLEVBQUU7UUFFN0QsTUFBTSxFQUFFLEdBQUcsV0FBVyxHQUFHLEVBQUUsQ0FBQztRQUM1QixZQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsVUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxjQUFjLEVBQUUsQ0FBQyxDQUFDO2FBQ3BFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUN4QyxDQUFDO0tBR0w7SUFFRCxjQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxHQUFHLFlBQVksQ0FBQyxDQUFDO0FBQ3pDLENBQUM7QUFFRCxrQkFBZSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsQ0FBQTtBQUNoQyxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKippbXBvcnQgc2lkZWJhciBmcm9tIFwiLi4vc2lkZWJhclwiO1xuICogaW1wb3J0ICogYXMgUGFnZXMgZnJvbSBcIi4vcGFnZXNcIjsgUGFnZXMuc2lkZWJhci5idWlsZCgpXG4gKiAqL1xuY29uc29sZS5ncm91cCgncGFnZXMuc2lkZWJhci50cycpO1xuaW1wb3J0IEdsb2IgZnJvbSBcIi4uL0dsb2JcIjtcbmltcG9ydCB7IFBhZ2VOYW1lIH0gZnJvbSBcIi4uL015U3RvcmVcIjtcblxuaW1wb3J0IHsgZW51bWVyYXRlIH0gZnJvbSBcIi4uL3V0aWxcIjtcbmltcG9ydCB7IHNwYW4gfSBmcm9tIFwiLi4vYmhlXCI7XG5pbXBvcnQgKiBhcyBQYWdlcyBmcm9tIFwiLlwiO1xuXG5cbmZ1bmN0aW9uIHNlbGVjdCh0YXJnZXRJZDogUGFnZU5hbWUsIHsgY2hhbmdlVGl0bGUgfSkge1xuICAgIGxldCBodG1sO1xuICAgIGZvciAobGV0IHNpZGViYXJJdGVtIG9mIEdsb2IuU2lkZWJhci5jaGlsZHJlbigpKSB7XG4gICAgICAgIGlmIChzaWRlYmFySXRlbS5pZCgpID09PSBgc2lkZWJhcl8ke3RhcmdldElkfWApIHtcbiAgICAgICAgICAgIGh0bWwgPSBzaWRlYmFySXRlbS5odG1sKCk7XG4gICAgICAgICAgICBzaWRlYmFySXRlbS5hZGRDbGFzcyhcInNlbGVjdGVkXCIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2lkZWJhckl0ZW0ucmVtb3ZlQ2xhc3MoXCJzZWxlY3RlZFwiKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAoY2hhbmdlVGl0bGUpIHtcbiAgICAgICAgR2xvYi5UaXRsZS50ZXh0KGh0bWwudGl0bGUoKSk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBidWlsZCgpIHtcbiAgICBjb25zb2xlLmxvZygnc2lkZWJhciBidWlsZCcpO1xuICAgIGNvbnN0IHNpZGViYXJJdGVtcyA9IFtdO1xuICAgIGNvbnN0IHNpZGViYXJEaWN0ID0ge1xuICAgICAgICBuZXc6IFwiTmV3XCIsXG4gICAgICAgIHJlY29yZDogJ1JlY29yZCcsXG4gICAgICAgIGZpbGVfdG9vbHM6ICdGaWxlIFRvb2xzJyxcbiAgICAgICAgc2V0dGluZ3M6IFwiU2V0dGluZ3NcIixcbiAgICB9O1xuICAgIGZvciAobGV0IFtpLCBbZWlkLCBodW1hbl1dIG9mIGVudW1lcmF0ZShlbnVtZXJhdGUoc2lkZWJhckRpY3QpKSkge1xuXG4gICAgICAgIGNvbnN0IGlkID0gYHNpZGViYXJfJHtlaWR9YDtcbiAgICAgICAgc2lkZWJhckl0ZW1zLnB1c2goKHNwYW4oeyB0ZXh0OiBodW1hbiwgc2V0aWQ6IGlkLCBjbHM6ICdzaWRlYmFyLWl0ZW0nIH0pKVxuICAgICAgICAgICAgLmNsaWNrKCgpID0+IFBhZ2VzLnRvUGFnZShlaWQsIHRydWUpKVxuICAgICAgICApO1xuXG5cbiAgICB9XG5cbiAgICBHbG9iLlNpZGViYXIuYXBwZW5kKC4uLnNpZGViYXJJdGVtcyk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IHsgYnVpbGQsIHNlbGVjdCB9XG5jb25zb2xlLmdyb3VwRW5kKCk7XG4iXX0=