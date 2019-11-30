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
});
console.groupEnd();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5pdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImluaXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwrQkFBZ0Q7QUFFaEQsT0FBTyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUN6QiwrQkFBK0I7QUFHL0IsMkNBQXFDO0FBRXJDLGlDQUFpQztBQUNqQyx1Q0FBK0I7QUFDL0IsaUNBQTBCO0FBRzFCLElBQUksQ0FBQyxTQUFTLENBQUMsa0JBQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUU7SUFDN0IsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUd0QixNQUFNLFNBQVMsR0FBRyxjQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQztJQUMzQyxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksRUFBRSxTQUFTLENBQUMsQ0FBQztJQUNyQyxLQUFLLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUMvQixNQUFNLGlCQUFpQixHQUFHLFVBQUksQ0FBQztRQUMzQixFQUFFLEVBQUcsb0JBQW9CLEVBQUUsUUFBUSxFQUFHO1lBQ2xDLElBQUksRUFBRyxPQUFPO1lBQ2QsUUFBUSxFQUFHLFdBQVc7U0FFekI7S0FDSixDQUFpRixDQUFDO0lBQ25GLGlCQUFpQixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxJQUFJLEVBQUU7UUFDcEMsSUFBSSxFQUFFLEtBQUssRUFBRyxVQUFVLEVBQUUsR0FBRyxNQUFNLGlCQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQztZQUNuRCxLQUFLLEVBQUcsZ0NBQWdDO1lBQ3hDLGtCQUFrQixFQUFHLFNBQVM7U0FDakMsQ0FBQyxDQUFDO1FBQ0gsSUFBSyxVQUFVO1lBQ1gsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDeEMsQ0FBQyxDQUFDLENBQUM7SUFDSCxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7QUFHL0UsQ0FBQyxDQUFDLENBQUM7QUFPSCxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBCZXR0ZXJIVE1MRWxlbWVudCwgZWxlbSB9IGZyb20gXCIuL2JoZVwiO1xuXG5jb25zb2xlLmdyb3VwKCdpbml0LnRzJyk7XG5pbXBvcnQgKiBhcyB1dGlsIGZyb20gXCIuL3V0aWxcIjtcblxuXG5pbXBvcnQgeyBpc0RvbmUgfSBmcm9tIFwiLi9NeVB5U2hlbGxcIjtcblxuaW1wb3J0ICogYXMgUGFnZXMgZnJvbSBcIi4vcGFnZXNcIjtcbmltcG9ydCBNeUFsZXJ0IGZyb20gJy4vTXlBbGVydCdcbmltcG9ydCBHbG9iIGZyb20gJy4vR2xvYic7XG5cblxudXRpbC53YWl0VW50aWwoaXNEb25lKS50aGVuKCgpID0+IHtcbiAgICBQYWdlcy5zaWRlYmFyLmJ1aWxkKCk7XG4gICAgXG4gICAgXG4gICAgY29uc3QgbGFzdF9wYWdlID0gR2xvYi5CaWdDb25maWcubGFzdF9wYWdlO1xuICAgIGNvbnNvbGUubG9nKCdsYXN0X3BhZ2U6JywgbGFzdF9wYWdlKTtcbiAgICBQYWdlcy50b1BhZ2UobGFzdF9wYWdlLCBmYWxzZSk7XG4gICAgY29uc3QgbmF2aWdhdGlvbkJ1dHRvbnMgPSBlbGVtKHtcbiAgICAgICAgaWQgOiAnbmF2aWdhdGlvbl9idXR0b25zJywgY2hpbGRyZW4gOiB7XG4gICAgICAgICAgICBleGl0IDogJy5leGl0JyxcbiAgICAgICAgICAgIG1pbmltaXplIDogJy5taW5pbWl6ZScsXG4gICAgICAgICAgICBcbiAgICAgICAgfVxuICAgIH0pIGFzIEJldHRlckhUTUxFbGVtZW50ICYgeyBleGl0OiBCZXR0ZXJIVE1MRWxlbWVudCwgbWluaW1pemU6IEJldHRlckhUTUxFbGVtZW50IH07XG4gICAgbmF2aWdhdGlvbkJ1dHRvbnMuZXhpdC5jbGljayhhc3luYyAoKSA9PiB7XG4gICAgICAgIGxldCB7IHZhbHVlIDogc2hvdWxkRXhpdCB9ID0gYXdhaXQgTXlBbGVydC5iaWcud2FybmluZyh7XG4gICAgICAgICAgICB0aXRsZSA6ICdBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gZXhpdD8nLFxuICAgICAgICAgICAgY29uZmlybUJ1dHRvbkNvbG9yIDogJyNkYzM1NDUnLFxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKCBzaG91bGRFeGl0IClcbiAgICAgICAgICAgIHV0aWwuZ2V0Q3VycmVudFdpbmRvdygpLmNsb3NlKCk7XG4gICAgfSk7XG4gICAgbmF2aWdhdGlvbkJ1dHRvbnMubWluaW1pemUuY2xpY2soKCkgPT4gdXRpbC5nZXRDdXJyZW50V2luZG93KCkubWluaW1pemUoKSk7XG4gICAgXG4gICAgXG59KTtcblxuXG4vKlxuIFxuIFxuIC8qKi9cbmNvbnNvbGUuZ3JvdXBFbmQoKTtcbiJdfQ==