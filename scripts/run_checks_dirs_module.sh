#!/usr/bin/env bash
. src/engine/env/bin/activate
python -m checks.dirs $(pwd) debug
