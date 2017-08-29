# vsss-otter-nipple
Joystick-based controller for VSSS-Bot. Inspired by vsss-bot original design and made using NippleJS by Yoann Monet.
-----

Very Small Socket Size robot firmware for the ESP8266.

Setup
-----
Easy way: Clone this repo then run `toolchain-setup.sh` from `other_tools`.

**OR:**

1. Linux OS strongly suggested, just cause.
2. Get the toolchain from [my binaries](https://app.cear.ufpb.br/owncloud/index.php/s/LrvHW9WsqGsF3k1/download) or by compiling [esp-open-sdk](https://github.com/pfalcon/esp-open-sdk). Place the `xtensa-lx106-elf` and `esptool` folders under `/opt/espressif/`.
4. Get the SDK working by cloning (with `--recursive`) [esp-open-rtos](https://github.com/SuperHouse/esp-open-rtos) under `/opt/espressif/`. Once downloaded `cd` to `esp-open-rtos` and run `cppchk.sh --fix` to patch all headers for C++ compatibility.

Using
-----

1. If your ESP8266 is not yet configures for yout wireless network then:
  * Set your WiFi credentials in include/private_ssid_config.h.
  * Set `updateWirelessSettings = true` in `main.cpp`.
2. For initial flashing run
```bash
make clean
make html
make -j8
make test
```
3. After initial flashing you can update Over-The-Air.
```bash
make html
make -j8
ESPIP=192.168.1.999 make wiflash
```
4. Control the bot:
  * Via browser, by just navigating tho `ESPIP`.
  * Via protobuf-tcp on port 5556.
