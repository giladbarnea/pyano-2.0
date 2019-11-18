// import { PythonShell } from "python-shell";
console.group('imports-electron.ts');
// import Renderer from "./renderer";
import { remote } from "electron";


console.log('remote', remote);
console.log('Store', Store);
console.log('PythonShell', PythonShell);

// console.log('Renderer', Renderer);
// console.log("Renderer", Renderer);
console.groupEnd();
// console.log('PS: ', pythonShell);
// remote.globalShortcut.register('CommandOrControl+Y', openDevTools);
