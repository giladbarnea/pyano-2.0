# Run
    start[.sh] --help

By default, `start.sh` does:
```bash
ELECTRON_ENABLE_LOGGING=true
ELECTRON_ENABLE_STACK_DUMPING=true
node --experimental-modules --es-module-specifier-resolution=node --enable-source-maps ./node_modules/.bin/electron . --no-python "$@"
```

[Latest progress Notion page (Pyano > Journal)](https://www.notion.so/Journal-4cda875287874793b6adc5823edf617b)

Basic run command:
    
    start --no-screen-capture --devtools --edit-log --edit-big-conf &

## Compiling / Transpiling
    ./scripts/tsc.sh [--watch] [--help]
    scripts/sass_watch.sh

## git
    gd -- ':.js' ':!*.d.ts' ':!*package-lock.json'

## Debugging
in `launch.json`:
```json
"configurations": [
    {
        // * Main Process
        "name": "vscode-recipes | Electron: Main",
        "type": "node",
        "request": "launch",
        "protocol": "inspector",
        "runtimeExecutable": "${workspaceFolder}/node_modules/.bin/electron",
        "runtimeArgs": [
            ".",
            "--no-python",
            "--no-screen-capture",
            "--devtools"
        ],
        "env": {
            "ELECTRON_ENABLE_LOGGING": "true",
            "ELECTRON_ENABLE_STACK_DUMPING": "true"
        },
        "args": [
            "--remote-debugging-port=9223",
            "--experimental-modules",
            "--es-module-specifier-resolution=node",
            "--enable-source-maps"
        ],
        "showAsyncStacks": true,
        "smartStep": true,
        "windows": {
            "runtimeExecutable": "${workspaceFolder}/node_modules/.bin/electron.cmd"
        }
    },
    {
        // * Renderer Process (Run after "vscode-recipes | Electron: Main", )
        "name": "vscode-recipes | Electron: Renderer",
        "type": "chrome",
        "request": "attach",
        "port": 9223,
        "webRoot": "${workspaceFolder}",
        "timeout": 30000
    }
],
"compounds": [
    {
        // ** vscode-recipes: Main + Renderer
        "name": "vscode-recipes | Electron: All",
        "configurations": [
            "vscode-recipes | Electron: Main",
            "vscode-recipes | Electron: Renderer"
        ]
    }
]
```
## Venv
    . src/engine/env37/bin/activate
    . src/engine/env/bin/activate

## Pytest
```bash
pytest tests/python -l -vv -rA
pytest tests/python/test_Message.py -rA --maxfail=1 -l -k "create_tempo_shifted" | grep -P ".*\.py:\d*"
python tests/python/test_Message.py $(pwd)
https://docs.pytest.org/en/latest/usage.html#cmdline
```
tests/python/test_Message.py::TestMessage::test__get_relative_tempo_missing_msgs
    /home/gilad/Code/pyano-2.0
tests/python/test_Message.py
![](ignore/pytest-man-0.png)

## python scripts
    python src/engine/api/analyze_txt.py debug --mockfile=mock_0 --disable-tonode

## VMPK
    cd ~/Downloads && ./vmpk-0.7.2-linux-x86_64.AppImage
    Edit > Midi Connections > MIDI OUT == ALSA 

## PyVmMonitor
PyVmMonitor is used for performance profiling:
https://www.pyvmmonitor.com/

## Misc
    
