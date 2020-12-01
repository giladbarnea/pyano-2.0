# Run
    start[.sh] --help

By default, `start.sh` does:
    
    node --experimental-modules --es-module-specifier-resolution=node --enable-source-maps ./node_modules/.bin/electron . --no-python "$@"

[Latest progress Notion page (Pyano > Journal)](https://www.notion.so/Journal-4cda875287874793b6adc5823edf617b)

Basic run command:
    
    start --no-screen-capture --devtools --auto-edit-log &

## Compiling / Transpiling
    ./scripts/tsc.sh [--watch]
    scripts/sass_watch.sh

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
    
