#!/bin/bash
# Each line should not error
function shout(){
	local string="${1//. /.\n}"
	if [[ "$string" != "$1" ]]; then
		# has line breaks
		echo "\n\n\x1b[1;97m· · ·\n$string\n· · ·\x1b[0m\n"
	else
		echo "\n\n\x1b[1;97m· · ·  [ $string ]  · · ·\x1b[0m\n"
	fi
}
if ! python3.8 --version; then
    shout "python3.8 isn't installed"
    return 1
fi
if ! python3.8 -m pip -V; then
    shout "python3.8 pip isn't installed. follow instructions in this page:"
	echo "https://pip.pypa.io/en/stable/installing/#installing-with-get-pip-py"
    return 1
fi
# check bash version
bash_major_version="$(bash --version | cut -d $'\n' -f 1 | cut -d ' ' -f 4 | cut -d "." -f 1)"
if [[ ! "$bash_major_version" -ge 4 ]]; then
	shout "bash version is $bash_major_version, cross fingers everything works fine. wouldn't bet on it"
fi
if [[ ! $(python3.8 -m pip -V | cut -d " " -f 2 | cut -d "." -f 1) -ge 19 ]]; then
    shout "python3.8 pip version isn't high enough. run the following command then try again:"
    echo "python3.8 -m pip install -U setuptools wheel pip virtualenv"
    return 1
fi

if [[ ! "$(basename $PWD)" == pyano* ]]; then
	shout "doesn't look like you're in pyano root dir. cd there then run again"
	return 1
fi
if [[ ! -f .python_tools_up_to_date ]]; then
	shout "upgrading setuptools, wheel and virtualenv..."
	if ! python3.8 -m pip install -U setuptools wheel virtualenv; then
	    shout "updating setuptools, wheel, and virtualenv failed. if you got a permission problem, run the following then rerun file:"
		echo "python3.8 -m pip install --user -U setuptools wheel virtualenv && touch .python_tools_up_to_date"
	    return 1
	fi
	echo "this file exists to tell initial_setup.sh that upgrading setuptools, wheel, and virtualenv is not necessary" > .python_tools_up_to_date
fi
if [[ ! "$(git --version | cut -d " " -f 3 | cut -d "." -f 1)" -ge 2 ]]; then
	shout "git version should be 2 and up. run 'git --version' to check currently installed. upgrade git then run again"
	return 1
fi
shout "cding into src/engine, creating virtualenv and installing libs..."
cd src/engine || return 1
if [[ -e ./env ]]; then
	shout "src/engine/env already exists"
	return 1
fi
python3.8 -m virtualenv env || return 1
. env/bin/activate || return 1
if [[ ! "$(where pip | head -1)" == */src/engine/env/bin/pip ]]; then
	shout "virtual env not activated properly"
	return 1
fi
pip install -e . || return 1
pip install -e '.[dev]' || return 1

if ! pip list 2>/dev/null | grep pyano2; then
	shout "pyano2 was not installed properly, not found in pip list"
	return 1
fi
if ! pip list 2>/dev/null | grep pytest; then
	shout "pytest was not installed properly, not found in pip list"
	return 1
fi
shout "setup finished, looks ok"