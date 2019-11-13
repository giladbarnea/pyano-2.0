#!/usr/bin/env bash
. src/engine/env/bin/activate
#printf "$(pip list)"
python -m config "$(pwd)" "$CONFIG/pyano-2.0/config.json" "debug"
