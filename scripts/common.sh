#!/usr/bin/env bash
function vex() {
	local description
	local cmd
	if [[ -z "$2" ]]; then
		description="'$1'"
		cmd="$1"
	else
		description="$1"
		cmd="${@:2}"
	fi

	if eval "$cmd"; then
		log.info "$description: success"
		return 0
	else
		log.warn "$description: fail"
		return 1
	fi
}

function common.clean_dist_of_unnecessary_files() {
	if [[ -n "$1" && "$1" == "-q" ]]; then
		rm -r dist/**/*__pycache__ &>/dev/null
		rm -r dist/**/*pyano2.egg-info &>/dev/null
		rm -r dist/**/*.zip &>/dev/null
		rm -rf dist/engine/mock &>/dev/null
		# * remove dist/**/*.ts files
		find . -type f -regextype posix-extended -regex "\./dist/.*[^.]*\.ts$" | while read -r tsfile; do
			rm "$tsfile" &>/dev/null
		done
	else
		vex "rm -r dist/**/*__pycache__"
		vex "rm -r dist/**/*pyano2.egg-info"
		vex "rm -r dist/**/*.zip"
		vex "rm -rf dist/engine/mock"
		# * remove dist/**/*.ts files
		find . -type f -regextype posix-extended -regex "\./dist/.*[^.]*\.ts$" | while read -r tsfile; do
			vex "rm $tsfile"
		done
	fi

}
function common.kill_tsc_procs() {
	for proc in $(pgrep -f ".*tsc -p.*"); do
		vex "kill $proc"
	done
}
function common.kill_watch_procs() {
	for proc in $(pgrep -f '.*\bwatch .*'); do
		vex "kill $proc"
	done
}
function vsleep() {
	log.info "sleeping $1 seconds..."
	sleep "$1"
	log.info "done sleeping $1 seconds"

}
