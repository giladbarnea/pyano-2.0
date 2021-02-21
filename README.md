# Running pyano
    start[.sh] --help

By default, `start.sh` does:
```bash
ELECTRON_ENABLE_LOGGING=true
ELECTRON_ENABLE_STACK_DUMPING=true
node --experimental-modules --es-module-specifier-resolution=node --enable-source-maps ./node_modules/.bin/electron . --no-python "$@"
```

[Latest progress Notion page (Pyano > Journal)](https://www.notion.so/Journal-4cda875287874793b6adc5823edf617b)

run examples:
```bash
# Shows DevTools, edits current session's log and big conf file (config.json) with vscode
start --no-screen-capture --devtools --edit-log --edit-big-conf

# Opens pyano in full screen, deletes all past log files, disables various default behaviors such as
# logging to file, and "nice" error handling mechanisms like taking screenshots and shoving popups in yer face describing the error  
start --no-screen-capture --devtools --no-screenshots-on-error --clear-logs --no-console-log-to-file --fullscreen --no-swal-on-error
```
# Node stuff
### Compiling / Transpiling

```bash
# JS → TS:
./scripts/tsc.sh [--watch] [--help] 
# CSS → SASS:
scripts/sass_watch.sh
```
### git
[GitKraken](https://www.gitkraken.com/) is a recommended git GUI
#### git diff

```bash
# How to ignore irrelevant info like whitespace:
git diff --diff-algorithm=patience --find-copies-harder --ignore-cr-at-eol --ignore-space-at-eol --ignore-space-change --ignore-all-space --ignore-blank-lines
# How to ignore irrelevant files (note the single quotes, colons and '--')
git diff [ARGS...] -- ':*.js' ':!*.d.ts' ':!*package-lock.json'
```

### Debugging
in `launch.json`:
```json5
{
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
}
```

# Engine (python stuff)
### Initial setup
Run `bash initial_setup.sh` in root dir

### pytest usage examples
https://docs.pytest.org/en/latest/usage.html#cmdline
```bash
# in src/engine:
pytest -k test__real_world
pytest tests/python -l -vv -rA
pytest tests/python/test_Message.py -rA --maxfail=1 -l -k "create_tempo_shifted" | grep -P ".*\.py:\d*"
python tests/python/test_Message.py $(pwd)
tests/python/test_Message.py::TestMessage::test__get_relative_tempo_missing_msgs
```
![](ignore/pytest-man-0.png)

### python scripts
    python src/engine/api/analyze_txt.py debug --mockfile=mock_0 --disable-tonode

### VMPK
    cd ~/Downloads && ./vmpk-0.7.2-linux-x86_64.AppImage
    Edit > Midi Connections > MIDI OUT == ALSA 

### PyVmMonitor
PyVmMonitor is used for performance profiling:
https://www.pyvmmonitor.com/

### Misc
    
