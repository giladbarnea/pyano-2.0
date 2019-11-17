#!/usr/bin/env bash
. src/engine/env/bin/activate
python -m checks.config "$(pwd)" "$CONFIG/pyano-2.0/config.json" "debug"
