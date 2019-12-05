"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bhe_1 = require("./bhe");
const MyStore_1 = require("./MyStore");
const MyAlert_1 = require("./MyAlert");
const util = require("./util");
const fs = require("fs");
console.group('Glob.ts');
const BigConfig = new MyStore_1.BigConfigCls(true);
let skipFade = false;
const MainContent = bhe_1.elem({ id: 'main_content' });
const Sidebar = bhe_1.visualbhe({ id: 'sidebar' });
const Title = bhe_1.visualbhe({ id: 'title' });
const Document = bhe_1.elem({ htmlElement: document });
const NavigationButtons = bhe_1.visualbhe({
    id: 'navigation_buttons', children: {
        exit: '.exit',
        minimize: '.minimize',
    }
});
NavigationButtons.exit.click(async () => {
    let options = {
        title: 'Are you sure you want to exit?',
        confirmButtonColor: '#dc3545',
    };
    if (DEBUG) {
        options = Object.assign(Object.assign({}, options), { input: "checkbox", inputValue: `delete`, onBeforeOpen: modal => {
                let el = bhe_1.elem({
                    htmlElement: modal,
                    children: { label: '.swal2-label', checkbox: '#swal2-checkbox' }
                });
                el.checkbox.css({ height: '22px', width: '22px' });
                el.label
                    .css({ fontSize: '22px' })
                    .html(`Delete this session's errors dir (${path.relative(ROOT_PATH_ABS, SESSION_PATH_ABS)})`);
            } });
    }
    let { value } = await MyAlert_1.default.big.warning(options);
    console.log({ value });
    let shouldExit = value !== undefined;
    if (DEBUG && value === 1) {
        fs.rmdirSync(SESSION_PATH_ABS, { recursive: true });
    }
    if (shouldExit)
        util.getCurrentWindow().close();
});
NavigationButtons.minimize.click(() => util.getCurrentWindow().minimize());
async function toggle(action, ...args) {
    const promises = [];
    for (let a of args) {
        switch (a) {
            case "Title":
                promises.push(Title[action]());
                break;
            case "NavigationButtons":
                promises.push(NavigationButtons[action]());
                break;
            case "Sidebar":
                promises.push(Sidebar[action]());
                break;
        }
    }
    return await Promise.all(promises);
}
async function hide(...args) {
    return await toggle("hide", ...args);
}
async function display(...args) {
    return await toggle("display", ...args);
}
console.groupEnd();
exports.default = { skipFade, MainContent, Sidebar, Title, BigConfig, Document, NavigationButtons, hide, display };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2xvYi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkdsb2IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwrQkFBc0U7QUFDdEUsdUNBQXlDO0FBQ3pDLHVDQUFnQztBQUNoQywrQkFBK0I7QUFDL0IseUJBQXdCO0FBR3hCLE9BQU8sQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUM7QUFFekIsTUFBTSxTQUFTLEdBQUcsSUFBSSxzQkFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3pDLElBQUksUUFBUSxHQUFHLEtBQUssQ0FBQztBQUNyQixNQUFNLFdBQVcsR0FBRyxVQUFJLENBQUMsRUFBRSxFQUFFLEVBQUcsY0FBYyxFQUFFLENBQUMsQ0FBQztBQUNsRCxNQUFNLE9BQU8sR0FBRyxlQUFTLENBQUMsRUFBRSxFQUFFLEVBQUcsU0FBUyxFQUFFLENBQUMsQ0FBQztBQUM5QyxNQUFNLEtBQUssR0FBRyxlQUFTLENBQUMsRUFBRSxFQUFFLEVBQUcsT0FBTyxFQUFFLENBQTJFLENBQUM7QUFFcEgsTUFBTSxRQUFRLEdBQUcsVUFBSSxDQUFDLEVBQUUsV0FBVyxFQUFHLFFBQVEsRUFBRSxDQUFDLENBQUM7QUFDbEQsTUFBTSxpQkFBaUIsR0FBRyxlQUFTLENBQUM7SUFDaEMsRUFBRSxFQUFHLG9CQUFvQixFQUFFLFFBQVEsRUFBRztRQUNsQyxJQUFJLEVBQUcsT0FBTztRQUNkLFFBQVEsRUFBRyxXQUFXO0tBRXpCO0NBQ0osQ0FBeUUsQ0FBQztBQUMzRSxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssSUFBSSxFQUFFO0lBQ3BDLElBQUksT0FBTyxHQUFHO1FBQ1YsS0FBSyxFQUFHLGdDQUFnQztRQUN4QyxrQkFBa0IsRUFBRyxTQUFTO0tBRWpDLENBQUM7SUFDRixJQUFLLEtBQUssRUFBRztRQUNULE9BQU8sbUNBQ0EsT0FBTyxLQUVWLEtBQUssRUFBRyxVQUFVLEVBQ2xCLFVBQVUsRUFBRyxRQUFRLEVBQ3JCLFlBQVksRUFBRyxLQUFLLENBQUMsRUFBRTtnQkFDbkIsSUFBSSxFQUFFLEdBQUcsVUFBSSxDQUFDO29CQUNWLFdBQVcsRUFBRyxLQUFLO29CQUNuQixRQUFRLEVBQUcsRUFBRSxLQUFLLEVBQUcsY0FBYyxFQUFFLFFBQVEsRUFBRyxpQkFBaUIsRUFBRTtpQkFDdEUsQ0FBQyxDQUFDO2dCQUdILEVBQUUsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUUsTUFBTSxFQUFHLE1BQU0sRUFBRSxLQUFLLEVBQUcsTUFBTSxFQUFFLENBQUMsQ0FBQztnQkFFckQsRUFBRSxDQUFDLEtBQUs7cUJBQ0wsR0FBRyxDQUFDLEVBQUUsUUFBUSxFQUFHLE1BQU0sRUFBRSxDQUFDO3FCQUMxQixJQUFJLENBQUMscUNBQXFDLElBQUksQ0FBQyxRQUFRLENBQUMsYUFBYSxFQUFFLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBRXBHLENBQUMsR0FDSixDQUFBO0tBQ0o7SUFLRCxJQUFJLEVBQUUsS0FBSyxFQUFFLEdBQUcsTUFBTSxpQkFBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDbkQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7SUFDdkIsSUFBSSxVQUFVLEdBQUcsS0FBSyxLQUFLLFNBQVMsQ0FBQztJQUNyQyxJQUFLLEtBQUssSUFBSSxLQUFLLEtBQUssQ0FBQyxFQUFHO1FBQ3hCLEVBQUUsQ0FBQyxTQUFTLENBQUMsZ0JBQWdCLEVBQUUsRUFBRSxTQUFTLEVBQUcsSUFBSSxFQUFFLENBQUMsQ0FBQTtLQUN2RDtJQUNELElBQUssVUFBVTtRQUNYLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDO0FBQ3hDLENBQUMsQ0FBQyxDQUFDO0FBQ0gsaUJBQWlCLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO0FBRTNFLEtBQUssVUFBVSxNQUFNLENBQUMsTUFBMEIsRUFBRSxHQUFHLElBQW1EO0lBQ3BHLE1BQU0sUUFBUSxHQUFHLEVBQUUsQ0FBQztJQUNwQixLQUFNLElBQUksQ0FBQyxJQUFJLElBQUksRUFBRztRQUNsQixRQUFTLENBQUMsRUFBRztZQUNULEtBQUssT0FBTztnQkFDUixRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQy9CLE1BQU07WUFDVixLQUFLLG1CQUFtQjtnQkFDcEIsUUFBUSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQzNDLE1BQU07WUFDVixLQUFLLFNBQVM7Z0JBQ1YsUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUNqQyxNQUFNO1NBQ2I7S0FDSjtJQUNELE9BQU8sTUFBTSxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ3ZDLENBQUM7QUFFRCxLQUFLLFVBQVUsSUFBSSxDQUFDLEdBQUcsSUFBbUQ7SUFDdEUsT0FBTyxNQUFNLE1BQU0sQ0FBQyxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztBQUN6QyxDQUFDO0FBRUQsS0FBSyxVQUFVLE9BQU8sQ0FBQyxHQUFHLElBQW1EO0lBQ3pFLE9BQU8sTUFBTSxNQUFNLENBQUMsU0FBUyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7QUFDNUMsQ0FBQztBQUVELE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztBQUNuQixrQkFBZSxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLGlCQUFpQixFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEJldHRlckhUTUxFbGVtZW50LCBlbGVtLCBWaXN1YWxCSEUsIHZpc3VhbGJoZSB9IGZyb20gXCIuL2JoZVwiO1xuaW1wb3J0IHsgQmlnQ29uZmlnQ2xzIH0gZnJvbSBcIi4vTXlTdG9yZVwiO1xuaW1wb3J0IE15QWxlcnQgZnJvbSBcIi4vTXlBbGVydFwiO1xuaW1wb3J0ICogYXMgdXRpbCBmcm9tIFwiLi91dGlsXCI7XG5pbXBvcnQgKiBhcyBmcyBmcm9tIFwiZnNcIlxuXG4vKippbXBvcnQgR2xvYiBmcm9tICcuL0dsb2InKi9cbmNvbnNvbGUuZ3JvdXAoJ0dsb2IudHMnKTtcblxuY29uc3QgQmlnQ29uZmlnID0gbmV3IEJpZ0NvbmZpZ0Nscyh0cnVlKTtcbmxldCBza2lwRmFkZSA9IGZhbHNlO1xuY29uc3QgTWFpbkNvbnRlbnQgPSBlbGVtKHsgaWQgOiAnbWFpbl9jb250ZW50JyB9KTtcbmNvbnN0IFNpZGViYXIgPSB2aXN1YWxiaGUoeyBpZCA6ICdzaWRlYmFyJyB9KTtcbmNvbnN0IFRpdGxlID0gdmlzdWFsYmhlKHsgaWQgOiAndGl0bGUnIH0pIGFzIFZpc3VhbEJIRSAmIHsgbGV2ZWxoMzogQmV0dGVySFRNTEVsZW1lbnQsIHRyaWFsaDM6IEJldHRlckhUTUxFbGVtZW50IH07XG4vLyBAdHMtaWdub3JlXG5jb25zdCBEb2N1bWVudCA9IGVsZW0oeyBodG1sRWxlbWVudCA6IGRvY3VtZW50IH0pO1xuY29uc3QgTmF2aWdhdGlvbkJ1dHRvbnMgPSB2aXN1YWxiaGUoe1xuICAgIGlkIDogJ25hdmlnYXRpb25fYnV0dG9ucycsIGNoaWxkcmVuIDoge1xuICAgICAgICBleGl0IDogJy5leGl0JyxcbiAgICAgICAgbWluaW1pemUgOiAnLm1pbmltaXplJyxcbiAgICAgICAgXG4gICAgfVxufSkgYXMgVmlzdWFsQkhFICYgeyBleGl0OiBCZXR0ZXJIVE1MRWxlbWVudCwgbWluaW1pemU6IEJldHRlckhUTUxFbGVtZW50IH07XG5OYXZpZ2F0aW9uQnV0dG9ucy5leGl0LmNsaWNrKGFzeW5jICgpID0+IHtcbiAgICBsZXQgb3B0aW9ucyA9IHtcbiAgICAgICAgdGl0bGUgOiAnQXJlIHlvdSBzdXJlIHlvdSB3YW50IHRvIGV4aXQ/JyxcbiAgICAgICAgY29uZmlybUJ1dHRvbkNvbG9yIDogJyNkYzM1NDUnLFxuICAgICAgICBcbiAgICB9O1xuICAgIGlmICggREVCVUcgKSB7XG4gICAgICAgIG9wdGlvbnMgPSB7XG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgaW5wdXQgOiBcImNoZWNrYm94XCIsXG4gICAgICAgICAgICBpbnB1dFZhbHVlIDogYGRlbGV0ZWAsXG4gICAgICAgICAgICBvbkJlZm9yZU9wZW4gOiBtb2RhbCA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IGVsID0gZWxlbSh7XG4gICAgICAgICAgICAgICAgICAgIGh0bWxFbGVtZW50IDogbW9kYWwsXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkcmVuIDogeyBsYWJlbCA6ICcuc3dhbDItbGFiZWwnLCBjaGVja2JveCA6ICcjc3dhbDItY2hlY2tib3gnIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICAgICAgZWwuY2hlY2tib3guY3NzKHsgaGVpZ2h0IDogJzIycHgnLCB3aWR0aCA6ICcyMnB4JyB9KTtcbiAgICAgICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICAgICAgZWwubGFiZWxcbiAgICAgICAgICAgICAgICAgIC5jc3MoeyBmb250U2l6ZSA6ICcyMnB4JyB9KVxuICAgICAgICAgICAgICAgICAgLmh0bWwoYERlbGV0ZSB0aGlzIHNlc3Npb24ncyBlcnJvcnMgZGlyICgke3BhdGgucmVsYXRpdmUoUk9PVF9QQVRIX0FCUywgU0VTU0lPTl9QQVRIX0FCUyl9KWApO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIC8vLy8gMDogZXhpdCBub3QgZGVsZXRlXG4gICAgLy8vLyAxOiBleGl0IHllcyBkZWxldGVcbiAgICAvLy8vIHVuZGVmaW5lZDogY2FuY2VsXG4gICAgbGV0IHsgdmFsdWUgfSA9IGF3YWl0IE15QWxlcnQuYmlnLndhcm5pbmcob3B0aW9ucyk7XG4gICAgY29uc29sZS5sb2coeyB2YWx1ZSB9KTtcbiAgICBsZXQgc2hvdWxkRXhpdCA9IHZhbHVlICE9PSB1bmRlZmluZWQ7XG4gICAgaWYgKCBERUJVRyAmJiB2YWx1ZSA9PT0gMSApIHtcbiAgICAgICAgZnMucm1kaXJTeW5jKFNFU1NJT05fUEFUSF9BQlMsIHsgcmVjdXJzaXZlIDogdHJ1ZSB9KVxuICAgIH1cbiAgICBpZiAoIHNob3VsZEV4aXQgKVxuICAgICAgICB1dGlsLmdldEN1cnJlbnRXaW5kb3coKS5jbG9zZSgpO1xufSk7XG5OYXZpZ2F0aW9uQnV0dG9ucy5taW5pbWl6ZS5jbGljaygoKSA9PiB1dGlsLmdldEN1cnJlbnRXaW5kb3coKS5taW5pbWl6ZSgpKTtcblxuYXN5bmMgZnVuY3Rpb24gdG9nZ2xlKGFjdGlvbjogXCJoaWRlXCIgfCBcImRpc3BsYXlcIiwgLi4uYXJnczogKFwiVGl0bGVcIiB8IFwiTmF2aWdhdGlvbkJ1dHRvbnNcIiB8IFwiU2lkZWJhclwiKVtdKTogUHJvbWlzZTx1bmtub3duW10+IHtcbiAgICBjb25zdCBwcm9taXNlcyA9IFtdO1xuICAgIGZvciAoIGxldCBhIG9mIGFyZ3MgKSB7XG4gICAgICAgIHN3aXRjaCAoIGEgKSB7XG4gICAgICAgICAgICBjYXNlIFwiVGl0bGVcIjpcbiAgICAgICAgICAgICAgICBwcm9taXNlcy5wdXNoKFRpdGxlW2FjdGlvbl0oKSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiTmF2aWdhdGlvbkJ1dHRvbnNcIjpcbiAgICAgICAgICAgICAgICBwcm9taXNlcy5wdXNoKE5hdmlnYXRpb25CdXR0b25zW2FjdGlvbl0oKSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFwiU2lkZWJhclwiOlxuICAgICAgICAgICAgICAgIHByb21pc2VzLnB1c2goU2lkZWJhclthY3Rpb25dKCkpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBhd2FpdCBQcm9taXNlLmFsbChwcm9taXNlcyk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGhpZGUoLi4uYXJnczogKFwiVGl0bGVcIiB8IFwiTmF2aWdhdGlvbkJ1dHRvbnNcIiB8IFwiU2lkZWJhclwiKVtdKTogUHJvbWlzZTx1bmtub3duW10+IHtcbiAgICByZXR1cm4gYXdhaXQgdG9nZ2xlKFwiaGlkZVwiLCAuLi5hcmdzKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gZGlzcGxheSguLi5hcmdzOiAoXCJUaXRsZVwiIHwgXCJOYXZpZ2F0aW9uQnV0dG9uc1wiIHwgXCJTaWRlYmFyXCIpW10pOiBQcm9taXNlPHVua25vd25bXT4ge1xuICAgIHJldHVybiBhd2FpdCB0b2dnbGUoXCJkaXNwbGF5XCIsIC4uLmFyZ3MpO1xufVxuXG5jb25zb2xlLmdyb3VwRW5kKCk7XG5leHBvcnQgZGVmYXVsdCB7IHNraXBGYWRlLCBNYWluQ29udGVudCwgU2lkZWJhciwgVGl0bGUsIEJpZ0NvbmZpZywgRG9jdW1lbnQsIE5hdmlnYXRpb25CdXR0b25zLCBoaWRlLCBkaXNwbGF5IH1cbiJdfQ==