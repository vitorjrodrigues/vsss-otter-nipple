#! /bin/bash

requires() {
	[ -z "$(which "$1")" ] && {
		echo "$1 required but not available. On Ubuntu install the $2 package."
		exit 1
	}
}

requires git    git
requires curl   curl
requires xzcat  xz-utils
requires make   make
requires python "python and python-serial"

[ "$UID" -ne 0 -a ! -w "/opt/espressif/" ] && {
	echo "Please run as root or grant write permissions to /opt/espressif/ directory."
	exit 1
}

# Give up immediately on error, so they don't escalate
set -e

SCRIPT=$(realpath "$0")
SCRIPTDIR=$(dirname "$SCRIPT")

mkdir -p /opt/espressif
cd /opt/espressif

# Download and extract toolchain
curl 'https://app.cear.ufpb.br/owncloud/index.php/s/LrvHW9WsqGsF3k1/download' \
| xzcat | tar -xv

# Download the SDK
git clone --recursive 'https://github.com/SuperHouse/esp-open-rtos'
cd /opt/espressif/esp-open-rtos

# Patch headers for C++ compatibility
"$SCRIPTDIR/cppchk.sh" --fix
