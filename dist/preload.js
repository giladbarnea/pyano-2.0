// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener("DOMContentLoaded", function () {
    var replaceText = function (selector, text) {
        var element = document.getElementById(selector);
        if (element) {
            element.innerText = text;
        }
    };
    for (var _i = 0, _a = ["chrome", "node", "electron"]; _i < _a.length; _i++) {
        var type = _a[_i];
        replaceText(type + "-version", process.versions[type]);
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlbG9hZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9wcmVsb2FkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLGdFQUFnRTtBQUNoRSxpREFBaUQ7QUFDakQsTUFBTSxDQUFDLGdCQUFnQixDQUFDLGtCQUFrQixFQUFFO0lBQ3hDLElBQU0sV0FBVyxHQUFHLFVBQUMsUUFBZ0IsRUFBRSxJQUFZO1FBQy9DLElBQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDbEQsSUFBSSxPQUFPLEVBQUU7WUFDVCxPQUFPLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztTQUM1QjtJQUNMLENBQUMsQ0FBQztJQUVGLEtBQW1CLFVBQThCLEVBQTlCLE1BQUMsUUFBUSxFQUFFLE1BQU0sRUFBRSxVQUFVLENBQUMsRUFBOUIsY0FBOEIsRUFBOUIsSUFBOEIsRUFBRTtRQUE5QyxJQUFNLElBQUksU0FBQTtRQUNYLFdBQVcsQ0FBSSxJQUFJLGFBQVUsRUFBRyxPQUFPLENBQUMsUUFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0tBQ25FO0FBRUwsQ0FBQyxDQUFDLENBQUMifQ==