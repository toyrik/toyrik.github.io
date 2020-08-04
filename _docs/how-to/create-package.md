---
title: Создание и тестирование пакета composer локально
permalink: /docs/create-package/
---

Когда мы создаём новый пакет для composer, то перед загрузкой в packagist
хорошо бы его протестировать.

Итак у нас есть новенький пакет с соответствующим composer.json в корне:

```json
{
    "name": "name of the package",
    "description": "short description",
    "autoload": {
        "psr-4": {
            "Vendor\\SomeApp": "/src"
        }
    },
    "minimum-stability": "dev"
}
```

В данном файле происходит загрузка из `src` директории, которая для примера
имеет описанный класс `Hello` в пространстве имён `Vendor\SomeApp`
соответствующий пути json файла:

```php
<?php
namespace Vendor\SomeApp;

class Hello
{
    public function hello()
    {
        echo 'Hello world!';
    }
}
```

Теперь, чтобы использовать  пространство имён нужно импортировать его и вызвать соответствующий класс.

```php
<?php
require 'vendor/autoload.php';

use Vendor\SomeApp\Hello;

$hello = new Hello();
$hello->hello();
```

Это начальный процесс создания пакета, но для его фактического тестирования необходимо приложение.

Для этого мы создадим папку для запуска инсталлятора в родительской директории, что бы и папка приложения, и папка пакета находились на одном уровне.

Далее создадим ещё один json файл. Добавим в него необходимое `vendor/name` в ключ `require`. Что бы всё заработало, добавим массив в ключ `repositories` и передадим локальный путь к нашему пакету. Это даст composer загрузить пакет из локальной системы, а не из Packagist.

```json
{
    "require": {
        "vendor/someapp": "@dev"
    },
    "repositories": [
        {
           "type": "path",
           "url": "../SomeApp",
            "options": {
                "symlink":true
            }
        }        
    ]
}
```

Что бы иметь возможность оперативно проверить последующие правки без необходимости всякий раз выполнять команду `composer update`, мы добавили дополнительную опцию `"symlink":true`. Теперь вместо полного копирования в папку `vendor`, будет лишь создан симлинк на локальный путь к пакету.

Для установки локального пакета через composer выполняем:

```bash
composer require vendor/someapp @dev
```

После этого пакет будет связан с приложением посредством symlink и мы можем приступать к испытаниям.
