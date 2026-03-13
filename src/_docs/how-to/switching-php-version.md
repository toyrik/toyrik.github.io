---
title: Переключение версии PHP в линукс
permalink: /docs/switching-php-version/
---
## Переключение версии PHP в линукс

Если у нас на компьютере установлено две или более версии PHP для быстрого
переключения между ними введём в терминале

```bach
sudo update-alternatives --config php
```

В результате на экран будет выведено меню приблизительно похожее на это:

```bach
There are 2 choices for the alternative php (providing /usr/bin/php).
 
  Selection    Path             Priority   Status
 
------------------------------------------------------------
* 0            /usr/bin/php.default   100       auto mode
  1            /usr/bin/php.default   100       manual mode
  2            /usr/bin/php7.2        72        manual mode
  3            /usr/bin/php7.3        73        manual mode
  4            /usr/bin/php7.4        74        manual mode
  
Press <enter> to keep the current choice[*], or type selection number:
```

  Для того что бы проверить активную версию нужно ввести следующую команду

```bach
php -v
```
