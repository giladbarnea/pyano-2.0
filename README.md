npm run via-node-nopython
tsc -p . --watch
scripts/sass_watch.sh

. src/engine/env37/bin/activate
. src/engine/env/bin/activate

pytest tests/python -l -vv -rA
pytest tests/python/test_Message.py -rA --maxfail=1 -k "create_tempo_shifted"
python tests/python/test_Message.py $(pwd)
https://docs.pytest.org/en/latest/usage.html#cmdline

cd ~/Downloads && ./vmpk-0.7.2-linux-x86_64.AppImage
    Edit > Midi Connections > MIDI OUT == ALSA 

PyVmMonitor is used for performance profiling:
https://www.pyvmmonitor.com/
