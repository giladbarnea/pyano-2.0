// import { PythonShell } from "python-shell";

console.group('imports-electron.ts');
// import Renderer from "./renderer";
import { remote } from "electron";
import { MyStoreFn } from "./MyStore";
import Alert from "./MyAlert";
import { elem } from "./bhe";


// import Swal from 'sweetalert2'

console.log('remote', remote);
console.log('Store', Store);
console.log('PythonShell', PythonShell);
const BodyElem = elem({ htmlElement : document.body });
BodyElem.append(elem({ tag : 'h1', text : 'hi' }));
MyStoreFn();
Alert.alertFn();

console.groupEnd();
// console.log('PS: ', pythonShell);
// remote.globalShortcut.register('CommandOrControl+Y', openDevTools);
