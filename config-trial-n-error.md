# ts files: at root
# tsconfig.json
## compilerOptions
```json
"module": "none",
"target": "es2017",
"moduleResolution": "node",
"declarationDir": --,
"noEmitHelpers": false,
"importHelpers": false,
"typeRoots": [
			"./declarations"
		]
"rootDirs": --,
"baseUrl": --,
"paths": --,
"lib": --,
```
## include
--

# package.json
```json
"main": "./main.js",
"type": "module",
```
# node
	node ./node_modules/.bin/electron .
	node --experimental-modules ./node_modules/.bin/electron .
	node --experimental-modules --es-module-specifier-resolution=node ./node_modules/.bin/electron .
	electron .

# index.html
```html
<script type="text/javascript">
	exports = {};
</script>
<script src="./exportfile.js" type="module"></script>
<script src="./importfile.js" type="module"></script>
<script src="./imports-electron.js" type="module"></script>
```

# main.ts
```js
preload : path.join(__dirname, 'preload.js'),
mainWindow.loadFile(path.join(__dirname, "./index.html"))
```

# importfile.ts
```js
import { sayHi } from "./exportfile.js";
```

# imports-electron.ts
```js
import { remote } from "electron";
```
