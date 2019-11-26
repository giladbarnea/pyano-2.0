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
        Glob_1.default.Title.html(html.title());
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
        sidebarItems.push((bhe_1.span({ text: human }))
            .id(id)
            .addClass(`sidebar-item`)
            .click(() => Pages.toPage(eid, true)));
    }
    Glob_1.default.Sidebar.append(...sidebarItems);
}
exports.default = { build, select };
console.groupEnd();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2lkZWJhci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInNpZGViYXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFHQSxPQUFPLENBQUMsS0FBSyxDQUFDLGtCQUFrQixDQUFDLENBQUM7QUFDbEMsa0NBQTJCO0FBRzNCLGtDQUF5QztBQUN6QyxnQ0FBOEI7QUFDOUIsMkJBQTJCO0FBRzNCLFNBQVMsTUFBTSxDQUFDLFFBQWtCLEVBQUUsRUFBRSxXQUFXLEVBQUU7SUFDL0MsSUFBSSxJQUFJLENBQUM7SUFDVCxLQUFNLElBQUksV0FBVyxJQUFJLGNBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLEVBQUc7UUFDL0MsSUFBSyxXQUFXLENBQUMsRUFBRSxFQUFFLEtBQUssV0FBVyxRQUFRLEVBQUUsRUFBRztZQUM5QyxJQUFJLEdBQUcsV0FBVyxDQUFDLElBQUksRUFBRSxDQUFDO1lBQzFCLFdBQVcsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUM7U0FDcEM7YUFBTTtZQUNILFdBQVcsQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7U0FDdkM7S0FDSjtJQUNELElBQUssV0FBVyxFQUFHO1FBQ2YsY0FBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7S0FDakM7QUFDTCxDQUFDO0FBRUQsU0FBUyxLQUFLO0lBQ1YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsQ0FBQztJQUM3QixNQUFNLFlBQVksR0FBRyxFQUFFLENBQUM7SUFDeEIsTUFBTSxXQUFXLEdBQUc7UUFDaEIsR0FBRyxFQUFHLEtBQUs7UUFDWCxNQUFNLEVBQUcsUUFBUTtRQUNqQixVQUFVLEVBQUcsWUFBWTtRQUN6QixRQUFRLEVBQUcsVUFBVTtLQUN4QixDQUFDO0lBQ0YsS0FBTSxJQUFJLENBQUUsQ0FBQyxFQUFFLENBQUUsR0FBRyxFQUFFLEtBQUssQ0FBRSxDQUFFLElBQUksZ0JBQVMsQ0FBQyxnQkFBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDLEVBQUc7UUFFbkUsTUFBTSxFQUFFLEdBQUcsV0FBVyxHQUFHLEVBQUUsQ0FBQztRQUM1QixZQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsVUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFHLEtBQUssRUFBRSxDQUFDLENBQUM7YUFDckMsRUFBRSxDQUFDLEVBQUUsQ0FBQzthQUNOLFFBQVEsQ0FBQyxjQUFjLENBQUM7YUFDeEIsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQ3hDLENBQUM7S0FHTDtJQUVELGNBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEdBQUcsWUFBWSxDQUFDLENBQUM7QUFDekMsQ0FBQztBQUVELGtCQUFlLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxDQUFBO0FBQ2hDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKmltcG9ydCBzaWRlYmFyIGZyb20gXCIuLi9zaWRlYmFyXCI7XG4gKiBpbXBvcnQgKiBhcyBQYWdlcyBmcm9tIFwiLi9wYWdlc1wiOyBQYWdlcy5zaWRlYmFyLmJ1aWxkKClcbiAqICovXG5jb25zb2xlLmdyb3VwKCdwYWdlcy5zaWRlYmFyLnRzJyk7XG5pbXBvcnQgR2xvYiBmcm9tIFwiLi4vR2xvYlwiO1xuaW1wb3J0IHsgUGFnZU5hbWUgfSBmcm9tIFwiLi4vTXlTdG9yZVwiO1xuXG5pbXBvcnQgeyBlbnVtZXJhdGUsIHN0ciB9IGZyb20gXCIuLi91dGlsXCI7XG5pbXBvcnQgeyBzcGFuIH0gZnJvbSBcIi4uL2JoZVwiO1xuaW1wb3J0ICogYXMgUGFnZXMgZnJvbSBcIi5cIjtcblxuXG5mdW5jdGlvbiBzZWxlY3QodGFyZ2V0SWQ6IFBhZ2VOYW1lLCB7IGNoYW5nZVRpdGxlIH0pIHtcbiAgICBsZXQgaHRtbDtcbiAgICBmb3IgKCBsZXQgc2lkZWJhckl0ZW0gb2YgR2xvYi5TaWRlYmFyLmNoaWxkcmVuKCkgKSB7XG4gICAgICAgIGlmICggc2lkZWJhckl0ZW0uaWQoKSA9PT0gYHNpZGViYXJfJHt0YXJnZXRJZH1gICkge1xuICAgICAgICAgICAgaHRtbCA9IHNpZGViYXJJdGVtLmh0bWwoKTtcbiAgICAgICAgICAgIHNpZGViYXJJdGVtLmFkZENsYXNzKFwic2VsZWN0ZWRcIik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzaWRlYmFySXRlbS5yZW1vdmVDbGFzcyhcInNlbGVjdGVkXCIpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmICggY2hhbmdlVGl0bGUgKSB7XG4gICAgICAgIEdsb2IuVGl0bGUuaHRtbChodG1sLnRpdGxlKCkpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gYnVpbGQoKSB7XG4gICAgY29uc29sZS5sb2coJ3NpZGViYXIgYnVpbGQnKTtcbiAgICBjb25zdCBzaWRlYmFySXRlbXMgPSBbXTtcbiAgICBjb25zdCBzaWRlYmFyRGljdCA9IHtcbiAgICAgICAgbmV3IDogXCJOZXdcIixcbiAgICAgICAgcmVjb3JkIDogJ1JlY29yZCcsXG4gICAgICAgIGZpbGVfdG9vbHMgOiAnRmlsZSBUb29scycsXG4gICAgICAgIHNldHRpbmdzIDogXCJTZXR0aW5nc1wiLFxuICAgIH07XG4gICAgZm9yICggbGV0IFsgaSwgWyBlaWQsIGh1bWFuIF0gXSBvZiBlbnVtZXJhdGUoZW51bWVyYXRlKHNpZGViYXJEaWN0KSkgKSB7XG4gICAgICAgIFxuICAgICAgICBjb25zdCBpZCA9IGBzaWRlYmFyXyR7ZWlkfWA7XG4gICAgICAgIHNpZGViYXJJdGVtcy5wdXNoKChzcGFuKHsgdGV4dCA6IGh1bWFuIH0pKVxuICAgICAgICAgICAgLmlkKGlkKVxuICAgICAgICAgICAgLmFkZENsYXNzKGBzaWRlYmFyLWl0ZW1gKVxuICAgICAgICAgICAgLmNsaWNrKCgpID0+IFBhZ2VzLnRvUGFnZShlaWQsIHRydWUpKVxuICAgICAgICApO1xuICAgICAgICBcbiAgICAgICAgXG4gICAgfVxuICAgIFxuICAgIEdsb2IuU2lkZWJhci5hcHBlbmQoLi4uc2lkZWJhckl0ZW1zKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgeyBidWlsZCwgc2VsZWN0IH1cbmNvbnNvbGUuZ3JvdXBFbmQoKTtcbiJdfQ==