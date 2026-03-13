---
title: Установка и настройка xdebug3
permalink: /docs/xdebug-setup/
---

Есть несколько вариантов установки xdebug основные описаны [здесь](https://xdebug.org/docs/install)

После установки нужно перезапустить сервер и можно переходить к настройке самого xdebug
для этого нужно отредактировать файл `xdebug.ini` который в линуксе находится скорее всего в папке текущей версии php `mods-avialable`. В моём случае установлены такие настройки.

```conf
[xdebug]
xdebug.mode=debug
xdebug.start_with_request=trigger
xdebug.discover_client_host = false
xdebug.client_host = 127.0.0.1
xdebug.client_port = 9000
```
