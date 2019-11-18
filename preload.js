// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener("DOMContentLoaded", () => {
    const replaceText = (selector, text) => {
        const element = document.getElementById(selector);
        if (element) {
            element.innerText = text;
        }
    };
    for (const type of ["chrome", "node", "electron"]) {
        replaceText(`${type}-version`, process.versions[type]);
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlbG9hZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInByZWxvYWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsZ0VBQWdFO0FBQ2hFLGlEQUFpRDtBQUNqRCxNQUFNLENBQUMsZ0JBQWdCLENBQUMsa0JBQWtCLEVBQUUsR0FBRyxFQUFFO0lBQzdDLE1BQU0sV0FBVyxHQUFHLENBQUMsUUFBZ0IsRUFBRSxJQUFZLEVBQUUsRUFBRTtRQUNuRCxNQUFNLE9BQU8sR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ2xELElBQUksT0FBTyxFQUFFO1lBQ1QsT0FBTyxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7U0FDNUI7SUFDTCxDQUFDLENBQUM7SUFFRixLQUFLLE1BQU0sSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFLE1BQU0sRUFBRSxVQUFVLENBQUMsRUFBRTtRQUMvQyxXQUFXLENBQUMsR0FBRyxJQUFJLFVBQVUsRUFBRyxPQUFPLENBQUMsUUFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0tBQ25FO0FBRUwsQ0FBQyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBBbGwgb2YgdGhlIE5vZGUuanMgQVBJcyBhcmUgYXZhaWxhYmxlIGluIHRoZSBwcmVsb2FkIHByb2Nlc3MuXG4vLyBJdCBoYXMgdGhlIHNhbWUgc2FuZGJveCBhcyBhIENocm9tZSBleHRlbnNpb24uXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIiwgKCkgPT4ge1xuICAgIGNvbnN0IHJlcGxhY2VUZXh0ID0gKHNlbGVjdG9yOiBzdHJpbmcsIHRleHQ6IHN0cmluZykgPT4ge1xuICAgICAgICBjb25zdCBlbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoc2VsZWN0b3IpO1xuICAgICAgICBpZiAoZWxlbWVudCkge1xuICAgICAgICAgICAgZWxlbWVudC5pbm5lclRleHQgPSB0ZXh0O1xuICAgICAgICB9XG4gICAgfTtcbiAgICBcbiAgICBmb3IgKGNvbnN0IHR5cGUgb2YgW1wiY2hyb21lXCIsIFwibm9kZVwiLCBcImVsZWN0cm9uXCJdKSB7XG4gICAgICAgIHJlcGxhY2VUZXh0KGAke3R5cGV9LXZlcnNpb25gLCAocHJvY2Vzcy52ZXJzaW9ucyBhcyBhbnkpW3R5cGVdKTtcbiAgICB9XG4gICAgXG59KTtcblxuXG4iXX0=