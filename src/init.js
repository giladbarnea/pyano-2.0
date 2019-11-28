"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bhe_1 = require("./bhe");
console.group('init.ts');
const util = require("./util");
const MyPyShell_1 = require("./MyPyShell");
const Pages = require("./pages");
const MyAlert_1 = require("./MyAlert");
const Glob_1 = require("./Glob");
util.waitUntil(MyPyShell_1.isDone).then(() => {
    console.group('init.ts MyPyShell done');
    Pages.sidebar.build();
    const last_page = Glob_1.default.BigConfig.last_page;
    console.log('last_page:', last_page);
    Pages.toPage(last_page, false);
    const navigationButtons = bhe_1.elem({
        id: 'navigation_buttons', children: {
            exit: '.exit',
            minimize: '.minimize',
        }
    });
    navigationButtons.exit.click(async () => {
        let { value: shouldExit } = await MyAlert_1.default.big.warning({
            title: 'Are you sure you want to exit?',
            confirmButtonColor: '#dc3545',
        });
        if (shouldExit)
            util.getCurrentWindow().close();
    });
    navigationButtons.minimize.click(() => util.getCurrentWindow().minimize());
    console.groupEnd();
});
console.groupEnd();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5pdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImluaXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwrQkFBZ0Q7QUFFaEQsT0FBTyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUN6QiwrQkFBK0I7QUFHL0IsMkNBQXFDO0FBRXJDLGlDQUFpQztBQUNqQyx1Q0FBK0I7QUFDL0IsaUNBQTBCO0FBRzFCLElBQUksQ0FBQyxTQUFTLENBQUMsa0JBQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUU7SUFDN0IsT0FBTyxDQUFDLEtBQUssQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO0lBQ3hDLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUM7SUFHdEIsTUFBTSxTQUFTLEdBQUcsY0FBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUM7SUFDM0MsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUUsU0FBUyxDQUFDLENBQUM7SUFDckMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDL0IsTUFBTSxpQkFBaUIsR0FBRyxVQUFJLENBQUM7UUFDM0IsRUFBRSxFQUFHLG9CQUFvQixFQUFFLFFBQVEsRUFBRztZQUNsQyxJQUFJLEVBQUcsT0FBTztZQUNkLFFBQVEsRUFBRyxXQUFXO1NBRXpCO0tBQ0osQ0FBaUYsQ0FBQztJQUNuRixpQkFBaUIsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssSUFBSSxFQUFFO1FBQ3BDLElBQUksRUFBRSxLQUFLLEVBQUcsVUFBVSxFQUFFLEdBQUcsTUFBTSxpQkFBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUM7WUFDbkQsS0FBSyxFQUFHLGdDQUFnQztZQUN4QyxrQkFBa0IsRUFBRyxTQUFTO1NBQ2pDLENBQUMsQ0FBQztRQUNILElBQUssVUFBVTtZQUNYLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDO0lBQ3hDLENBQUMsQ0FBQyxDQUFDO0lBQ0gsaUJBQWlCLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO0lBRzNFLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztBQUN2QixDQUFDLENBQUMsQ0FBQztBQU9ILE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEJldHRlckhUTUxFbGVtZW50LCBlbGVtIH0gZnJvbSBcIi4vYmhlXCI7XG5cbmNvbnNvbGUuZ3JvdXAoJ2luaXQudHMnKTtcbmltcG9ydCAqIGFzIHV0aWwgZnJvbSBcIi4vdXRpbFwiO1xuXG5cbmltcG9ydCB7IGlzRG9uZSB9IGZyb20gXCIuL015UHlTaGVsbFwiO1xuXG5pbXBvcnQgKiBhcyBQYWdlcyBmcm9tIFwiLi9wYWdlc1wiO1xuaW1wb3J0IE15QWxlcnQgZnJvbSAnLi9NeUFsZXJ0J1xuaW1wb3J0IEdsb2IgZnJvbSAnLi9HbG9iJztcblxuXG51dGlsLndhaXRVbnRpbChpc0RvbmUpLnRoZW4oKCkgPT4ge1xuICAgIGNvbnNvbGUuZ3JvdXAoJ2luaXQudHMgTXlQeVNoZWxsIGRvbmUnKTtcbiAgICBQYWdlcy5zaWRlYmFyLmJ1aWxkKCk7XG4gICAgXG4gICAgXG4gICAgY29uc3QgbGFzdF9wYWdlID0gR2xvYi5CaWdDb25maWcubGFzdF9wYWdlO1xuICAgIGNvbnNvbGUubG9nKCdsYXN0X3BhZ2U6JywgbGFzdF9wYWdlKTtcbiAgICBQYWdlcy50b1BhZ2UobGFzdF9wYWdlLCBmYWxzZSk7XG4gICAgY29uc3QgbmF2aWdhdGlvbkJ1dHRvbnMgPSBlbGVtKHtcbiAgICAgICAgaWQgOiAnbmF2aWdhdGlvbl9idXR0b25zJywgY2hpbGRyZW4gOiB7XG4gICAgICAgICAgICBleGl0IDogJy5leGl0JyxcbiAgICAgICAgICAgIG1pbmltaXplIDogJy5taW5pbWl6ZScsXG4gICAgICAgICAgICBcbiAgICAgICAgfVxuICAgIH0pIGFzIEJldHRlckhUTUxFbGVtZW50ICYgeyBleGl0OiBCZXR0ZXJIVE1MRWxlbWVudCwgbWluaW1pemU6IEJldHRlckhUTUxFbGVtZW50IH07XG4gICAgbmF2aWdhdGlvbkJ1dHRvbnMuZXhpdC5jbGljayhhc3luYyAoKSA9PiB7XG4gICAgICAgIGxldCB7IHZhbHVlIDogc2hvdWxkRXhpdCB9ID0gYXdhaXQgTXlBbGVydC5iaWcud2FybmluZyh7XG4gICAgICAgICAgICB0aXRsZSA6ICdBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gZXhpdD8nLFxuICAgICAgICAgICAgY29uZmlybUJ1dHRvbkNvbG9yIDogJyNkYzM1NDUnLFxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKCBzaG91bGRFeGl0IClcbiAgICAgICAgICAgIHV0aWwuZ2V0Q3VycmVudFdpbmRvdygpLmNsb3NlKCk7XG4gICAgfSk7XG4gICAgbmF2aWdhdGlvbkJ1dHRvbnMubWluaW1pemUuY2xpY2soKCkgPT4gdXRpbC5nZXRDdXJyZW50V2luZG93KCkubWluaW1pemUoKSk7XG4gICAgXG4gICAgXG4gICAgY29uc29sZS5ncm91cEVuZCgpO1xufSk7XG5cblxuLypcbiBcbiBcbiAvKiovXG5jb25zb2xlLmdyb3VwRW5kKCk7XG4iXX0=