"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
console.group('Glob.ts');
const bhe_1 = require("./bhe");
const MyStore_1 = require("./MyStore");
const Store = new MyStore_1.MyStore(true);
let skipFade = false;
const MainContent = bhe_1.elem({ id: 'main_content' });
const Sidebar = bhe_1.elem({ id: 'sidebar' });
const Title = bhe_1.elem({ id: 'title' });
exports.default = { skipFade, MainContent, Sidebar, Title, Store };
console.groupEnd();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2xvYi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkdsb2IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxPQUFPLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ3pCLCtCQUE2QjtBQUM3Qix1Q0FBb0M7QUFFcEMsTUFBTSxLQUFLLEdBQUcsSUFBSSxpQkFBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2hDLElBQUksUUFBUSxHQUFHLEtBQUssQ0FBQztBQUNyQixNQUFNLFdBQVcsR0FBRyxVQUFJLENBQUMsRUFBRSxFQUFFLEVBQUcsY0FBYyxFQUFFLENBQUMsQ0FBQztBQUNsRCxNQUFNLE9BQU8sR0FBRyxVQUFJLENBQUMsRUFBRSxFQUFFLEVBQUcsU0FBUyxFQUFFLENBQUMsQ0FBQztBQUN6QyxNQUFNLEtBQUssR0FBRyxVQUFJLENBQUMsRUFBRSxFQUFFLEVBQUcsT0FBTyxFQUFFLENBQUMsQ0FBQztBQUNyQyxrQkFBZSxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsQ0FBQTtBQUMvRCxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zb2xlLmdyb3VwKCdHbG9iLnRzJyk7XG5pbXBvcnQgeyBlbGVtIH0gZnJvbSBcIi4vYmhlXCI7XG5pbXBvcnQgeyBNeVN0b3JlIH0gZnJvbSBcIi4vTXlTdG9yZVwiO1xuXG5jb25zdCBTdG9yZSA9IG5ldyBNeVN0b3JlKHRydWUpO1xubGV0IHNraXBGYWRlID0gZmFsc2U7XG5jb25zdCBNYWluQ29udGVudCA9IGVsZW0oeyBpZCA6ICdtYWluX2NvbnRlbnQnIH0pO1xuY29uc3QgU2lkZWJhciA9IGVsZW0oeyBpZCA6ICdzaWRlYmFyJyB9KTtcbmNvbnN0IFRpdGxlID0gZWxlbSh7IGlkIDogJ3RpdGxlJyB9KTtcbmV4cG9ydCBkZWZhdWx0IHsgc2tpcEZhZGUsIE1haW5Db250ZW50LCBTaWRlYmFyLCBUaXRsZSwgU3RvcmUgfVxuY29uc29sZS5ncm91cEVuZCgpO1xuIl19