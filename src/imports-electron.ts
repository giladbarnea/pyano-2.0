// import { PythonShell } from "python-shell";
console.group('imports-electron.ts');
// import Renderer from "./renderer";
import { remote } from "electron";
import { MyStoreFn } from "./MyStore";
import Alert from "./Alert";


// import Swal from 'sweetalert2'

console.log('remote', remote);
console.log('Store', Store);
console.log('PythonShell', PythonShell);

MyStoreFn();
Alert.alertFn();
Alert.small._question({});
// console.log('Renderer', Renderer);
// console.log("Renderer", Renderer);

console.groupEnd();
// console.log('PS: ', pythonShell);
// remote.globalShortcut.register('CommandOrControl+Y', openDevTools);
