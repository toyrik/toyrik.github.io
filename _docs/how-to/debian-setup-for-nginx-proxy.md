---
title: Настройка сервера с nginx
permalink: /docs/debian-setup-for-nginx-proxy/
---
## Настройка серверного набора приложений  (NGINX, Apache, MariaDB (MySQL), PHP, PHP-FPM (fastCGI), FTP, PHPMyAdmin, Memcached, Postfix на Debian подобной системе)

Пользуясь данной инструкцией можно настроить веб-сервер для решения задач по размещению сайтов, порталов или веб-приложений. Данная инструкция подходит для операционных систем основанных на deb- пакетах

* [Настройка системы](#настройка-системы)
* [Установка NGINX](#установка-nginx)
* [Установка PHP и PHP-FPM](#установка-php-и-php-fpm)
* [Установка СУБД](#установка-субд)
* [Установка phpMyAdmin](#установка-phpmyadmin)
* [Установка Memcached](#установка-memcached)
* [Установка и настройка FTP-сервера](#установка-и-настройка-ftp-сервера)
* [Apache](#apache)
* [Postfix](#postfix)
* [Тонкая настройка](#тонкая-настройка)
* [Создание хоста](#создание-хоста)

---

## Настройка системы

Обновляем список доступных пакетов и сами пакеты

```bash
sudo apt-get update && apt-get upgrade
```

Установка SSH:

```bash
sudo apt-get install -y vim mosh tmux htop git curl wget unzip zip gcc   build-essential make
```

настройка SSH:

```bash
sudo vim /etc/ssh/sshd_config
```

```conf
AllowUsers www
PermitRootLogin no
PasswordAuthentication no
```

Перезапускаем SSH, меняем пароль своего пользователя:

```bash
sudo service ssh restart
sudo passwd $user
```

Установка ZSH

```bash
sudo apt-get install -y zsh
  
sh -c "$(curl -fsSL https://raw.githubusercontent.com/robbyrussell/oh-my-zsh/master/tools/install.sh)"
```

Настройка синхронизации веремени:

```bash
sudo apt-get install ntpdate
cp /usr/share/zoneinfo/Europe/Moscow /etc/localtime
ntpdate ru.pool.ntp.org
```

Для автоматической сихронизации настраиваем Cron:

```bash
crontab -e
```

```bash
0 0 * * * /usr/sbin/ntpdate ru.pool.ntp.org
```

## Установка NGINX

Устанавливаем NGINX:

```bash
sudo apt-get install nginx
```

Для того что бы избежать ошибки: **could not build server_names_hash, you should increase server_names_hash_bucket_size: 32**, которая может возникнуть при большом количестве виртуальных серверов или если один из них будет иметь длинное название, в файле `/etc/nginx/nginx.conf` нужно снять комментарий со строчки:

```conf
http {
    ...
    server_names_hash_bucket_size 64;
    ....
}
```

Добавляем в автозагрузку и Запускаем:

```bash
sudo systemctl enable nginx
sudo systemctl start nginx
```

Проверим работу веб-сервера. Открываем браузер и вводим в адресной строке `http://<IP-адрес сервера>`. В итоге мы должны увидеть стартовую страницу «Welcome to nginx!»

Если страница не загрузилась, нужно проверить состояние сервера:

```bash
sudo systemctl status nginx
```

## Установка PHP и PHP-FPM

Устанавливаем PHP:

```bash
sudo apt-get install php
```

Для проверки версии нужно набрать в терминале:

```bash
php -v
```

Устанавливаем PHP-FPM и наиболее популярные модули которые могут пригодится в дальнейшем:

```bash
sudo apt-get install php-fpm php-cli php-mysql php-gd php-ldap php-odbc php-pdo php-opcache php-pear php-xml php-xmlrpc php-mbstring php-snmp php-soap php-zip php-json php-intl
```

Добавляем в автозагрузку и Запускаем:

```bash
sudo systemctl enable php7.4-fpm
sudo systemctl start php7.4-fpm
```

### Настройка связки NGINX + PHP

Открываем файл настройки виртуального домена по умолчанию:

```bash
sudo vim /etc/nginx/sites-enabled/default
```

В секции **location** меняем параметр **index** на следующее значение:

```conf
location / {
        index index.php index.html index.htm;
    }
```

А внутри секции **server** добавим следующее:

```conf
location ~ \.php$ {
            set $root_path /var/www/html;
            fastcgi_pass unix:/run/php/php7.4-fpm.sock;
            fastcgi_index index.php;
            fastcgi_param SCRIPT_FILENAME $root_path$fastcgi_script_name;
            include fastcgi_params;
            fastcgi_param DOCUMENT_ROOT $root_path;
        }
```

В результате должно получится что то вроде этого:

```conf
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    root /var/www/html;
    index index.html index.htm index.nginx-debian.html;
    server_name _;

    location / {
        index index.php index.html index.htm;
    }

    location ~ \.php$ {
        set $root_path /var/www/html;
        fastcgi_pass unix:/run/php/php7.4-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_param DOCUMENT_ROOT $root_path;
    }
}
```

Проверяем правильность настройки nginx:

```bash
sudo nginx -t
```

И перезапускаем его:

```bash
sudo systemctl restart nginx
```

Открываем конфигурационный файл PHP-FPM:

```bash
sudo vim /etc/php/7.4/fpm/pool.d/www.conf
```

Проверяем, что путь до сокетного файла такой же, как мы задали в настройках NGINX:

```conf
listen = /run/php/php7.4-fpm.sock
```

Иначе меняем его и перезапускаем сервис:

```bash
sudo systemctl restart php7.4-fpm
```

Теперь заходим в каталог хранения настроенного сайта:

```bash
cd /var/www/html
```

Создаем index.php со следующим содержимым:

```bash
sudo vi index.php
```

```php
<?php 
phpinfo();
```

Открываем браузере и переходим по адресу `http://<IP-адрес сервера>`. Мы должны увидеть сводную информацию по PHP и его настройкам.

## Установка СУБД

В данном случае мы установим MariaDB. Установка выполняется следующей командой:

```bash
sudo apt-get install mariadb-server
```

Разрешаем автозапуск и запускаем СУБД:

```bash
sudo systemctl enable mariadb
sudo systemctl start mariadb
```

Вход под учётной записью `root`можно осуществить выполнив в терминале команду:

```bash
sudo mariadb -u root
```

Чтобы создать базу данных и пользователя и дать ему привилегии для новой базы данных:

```bash
sudo mariadb -u root
```

```sql
CREATE DATABASE new_db_name DEFAULT CHARACTER SET utf8 DEFAULT COLLATE utf8_general_ci;
GRANT ALL PRIVILEGES ON new_db_name.* TO new_db_user@localhost IDENTIFIED BY 'password' WITH GRANT OPTION;
```

После перезагружаем php-fpm:

```bash
sudo systemctl restart php7.4-fpm
```

И открываем наш сайт в браузере. В phpinfo появится новая секция MySQL.

## Установка phpMyAdmin

Для установки phpMyAdmin вводим следующую команду:

```bash
sudo apt-get install phpmyadmin
```

Теперь создадим для него отдельный виртуальный домен в NGINX:

```bash
sudo vim /etc/nginx/sites-enabled/phpmyadmin.conf
```

И добавим в него следующее содержимое:

```conf
server {
        listen       80;
        server_name  phpmyadmin.local;
        set $root_path /usr/share/phpmyadmin;

        root $root_path;

        location / {
                index index.php;
        }

        location ~ \.php$ {
                fastcgi_pass unix:/run/php/php7.4-fpm.sock;
                fastcgi_index index.php;
                fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
                include fastcgi_params;
                fastcgi_param DOCUMENT_ROOT $root_path;
        }
}
```

После перезапускаем NGINX:

```bash
sudo systemctl reload nginx
```

И открываем в браузере наш домен, в данном примере, `http://phpmyadmin.local`. Откроется форма для авторизации.

## Установка Memcached

Для начала, выполняем установку пакетов:

```bash
sudo apt-get install memcached php-memcached
```

После разрешаем автозапуск и запускаем сервис кэширования:

```bash
sudo systemctl enable memcached
sudo systemctl enable memcached
```

Перезапускаем php-fpm:

```bash
sudo systemctl restart php7.2-fpm
```

Для проверки, что модуль memcached появился в PHP, открываем наш сайт в браузере — в phpinfo должна появиться новая секция.

## Установка и настройка FTP-сервера

Мы настроим ProFTPd, так как он позволит использовать виртуальных пользователей с uid пользователя www-data.

Для его установки вводим следующую команду:

```bash
sudo apt-get install proftpd
```

Смотрим uid пользователя www-data:

```bash
id www-data
```

Создаем виртуального пользователя:

```bash
ftpasswd --passwd --file=/etc/proftpd/ftpd.passwd --name=ftpwww --uid=33 --gid=33 --home=/var/www --shell=/usr/sbin/nologin
```

> где **/etc/proftpd/ftpd.passwd** *— путь до файла, в котором хранятся пользователи;
>
> **ftpwww** — имя пользователя (логин);
>
> **uid** и **gid** — идентификаторы пользователя и группы системной учетной записи (www-data);
>
> **/var/www** — домашний каталог пользователя;
>
> **/usr/sbin/nologin** — оболочка, запрещающая локальный вход пользователя в систему.*

Открываем основной конфигурационный файл:

```bash
vi /etc/proftpd/proftpd.conf
```

Снимаем комментарий или редактируем опцию:

```conf
DefaultRoot                     ~
```

Это делается для того чтобы корневой директорией для пользователя была домашняя директория. Это нужно, чтобы FTP-пользователи не могли выйти за пределы дозволенного и видеть на сервере сайты друг друга.

Создаем дополнительный конфигурационный файл для proftpd:

```bash
sudo vim /etc/proftpd/conf.d/custom.conf
```

Со следующим содержимым:

```conf
UseIPv6 off
IdentLookups off
PassivePorts 40900 40999

RequireValidShell off
AuthUserFile /etc/proftpd/ftpd.passwd
AuthPAM off
LoadModule mod_auth_file.c
AuthOrder mod_auth_file.c
```

> где **40900 - 40999** — диапазон динамических портов для пассивного режима

Разрешаем автозапуск FTP-серверу и запускаем его:

```bash
sudo systemctl enable proftpd
sudo systemctl restart proftpd
```

Пробуем подключиться к серверу, использую любые FTP-клиенты, например, FileZilla, Total Commander или тот же браузер.

## Apache

Для поддержки файла .htaccess, который используется многими сайтами, необходимо установить и настроить веб-сервер Apache.

Устанавливаем apache и модуль для php:

```bash
sudo apt-get install apache2 libapache2-mod-php
```

Заходим в настройки портов:

```bash
sudo vim /etc/apache2/ports.conf
```

И редактируем следующее:

```conf
Listen 8080

#<IfModule ssl_module>
#       Listen 443
#</IfModule>

#<IfModule mod_gnutls.c>
#       Listen 443
#</IfModule>
```

> мы настроили прослушивание на порту **8080**, так как на 80 уже работает NGINX. Также мы закомментировали прослушивание по **443**, так как и он будет слушаться NGINX.

Открываем основной конфигурационный файл для apache:

```bash
sudo vim /etc/apache2/apache2.conf
```

Рядом с опциями Directory дописываем:

```conf
<Directory /var/www/*/www>
    AllowOverride All
    Options Indexes ExecCGI FollowSymLinks
    Require all granted
</Directory>
```

> где:
>
> **Directory** указывает на путь, для которого мы хотим задать настройки;
>
> **AllowOverride** позволит переопределить все настройки с помощью файла .htaccess;
>
> **Options** задает некоторые настройки:
>
> **Indexes** разрешает списки каталогов,
>
> **ExecCGI** разрешает запуск cgi скриптов,
>
> **Require all granted** предоставляет всем доступ к сайтам в данном каталоге.

Ниже допишем:

```conf
<IfModule setenvif_module>
    SetEnvIf X-Forwarded-Proto https HTTPS=on
</IfModule>
```

> этой настройкой мы при получении заголовка **X-Forwarded-Proto** со значением **https** задаем переменную **$_SERVER['HTTPS']** равную **on**. Данная настройки критична для функционирования некоторых CMS.

Запрещаем mpm_event:

```bash
sudo a2dismod mpm_event
```

> по умолчанию, apache2 может быть установлен с модулем мультипроцессовой обработки **mpm_event**. Данный модуль не поддерживает php 7 и выше.

Разрешаем модуль мультипроцессовой обработки mpm_prefork:

```bash
sudo a2enmod mpm_prefork
```

Разрешаем модуль php:

```bash
sudo a2enmod php7.4
```

Разрешаем модуль setenvif:

```bash
sudo a2enmod setenvif
```

Разрешаем автозапуск и запускаем службу:

```bash
sudo systemctl enable apache2
sudo systemctl start apache2
```

Открываем браузер и вводим в адресную строку `http://<IP-адрес сервера>:8080`. Мы должны увидеть привычную страницу где в разделе **Server API** мы должны увидеть **Apache**.

### NGINX + Apache

для того что бы настроить взаимодействие nginx + apache откроем конфигурационный файл nginx для сайта:

```bash
sudo vim /etc/nginx/sites-enable/default
```

Находим настоенный location для php-fpm:

```conf
...
        location ~ \.php$ {
            set $root_path /var/www/html;
            fastcgi_pass unix:/run/php/php7.4-fpm.sock;
            fastcgi_index index.php;
            fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
            include fastcgi_params;
            fastcgi_param DOCUMENT_ROOT $root_path;
        }
...
```

который меняем на:

```conf
...
        location ~ \.php$ {
            proxy_pass http://127.0.0.1:8080;
            proxy_redirect     off;
            proxy_set_header   Host             $host;
            proxy_set_header   X-Forwarded-Proto $scheme;
            proxy_set_header   X-Real-IP        $remote_addr;
            proxy_set_header   X-Forwarded-For  $proxy_add_x_forwarded_for;
        }
...
```

Проверяем и перезапускаем nginx:

```bash
sudo nginx -t
sudo systemctl restart nginx
```

Пробуем открыть в браузере ``http://localhost`` - должна открыться та же страница, что при проверке Apache (с добавлением 8080): т.е. в разделе **Server API** мы должны увидеть **Apache**.

### Apache Real IP

Запросы на apache приходят от NGINX, и они воспринимаются первым как от IP-адреса 127.0.0.1. На практике, это может привести к проблемам, так как некоторым сайтам необходимы реальные адреса посетителей. Для решения проблемы будем использовать модуль remoteip.

Создаем конфигурационный файл со следующим содержимым:

```bash
sudo vim /etc/apache2/mods-available/remoteip.conf
```

```conf
<IfModule remoteip_module>
  RemoteIPHeader X-Forwarded-For
  RemoteIPTrustedProxy 127.0.0.1/8
</IfModule>
```

Активируем модуль:

```bash
sudo a2enmod remoteip
```

Перезапускаем apache:

```bash
sudo systemctl restart apache2
```

Для проверки настройки открываем браузер и вводим в адресную строку `http://localhost`, где откроется наша страница phpinfo. В разделе **Apache Environment** мы должны увидеть внешний адрес компьютера, с которого обращаемся к серверу в опции **REMOTE_ADDR**.

## Postfix

В качестве агента MTA мы будем использовать удобный в настройке и надежный Postfix.

### Установка, настройка и запуск

Устанавливаем пакет postfix:

```bash
sudo apt-get install postfix
```

Вносим некоторые изменения в настройки:

```bash
sudo vim /etc/postfix/main.cf
```

```conf
myorigin = $mydomain
smtp_generic_maps = hash:/etc/postfix/generic_map
```

> **mydomain** — домен сервера;
>
> **myorigin** — имя домена, которое будет подставляться всем отправляемым сообщениям без явного указания оного;
>
> **smtp_generic_maps** указывает на карту с общими правилами пересылки.

Открываем карту пересылки:

```bash
sudo vim /etc/postfix/generic_map
```

И добавляем:

```conf
@mysite.local    no-reply@mysite.local
```

> данной настройкой мы будем подставлять всем отправляемым письмам без поля FROM адрес no-reply@mysite.local.

Создаем карту:

```bash
sudo postmap /etc/postfix/generic_map
```

Включаем автозапуск почтового сервера и запускаем его службу:

```bash
systemctl enable postfix
systemctl start postfix
```

### Корректная отправка

Для того, чтобы сервер мог отправлять сообщения на внешние ящики, необходимо корректно настроить в DNS, как минимум, записи A и PTR.

Для добавления А-записи, необходимо в настройках панели управления нашим доменом создать запись типа. Ее имя и IP-адрес должны соответствовать имени и адресу нашего сервера.

Для создания PTR-записи необходимо написать письмо Интернет-провайдеру, к которому подключен наш сервер. Если наш сервер арендуется у хостинговой компании, необходимо либо написать данное письмо данной хостинговой компании, либо данная возможность может быть предоставлена в панели управления хостинговыми услугами.

## Тонкая настройка

### PHP

Откроем на редактирование следующий файл:

```bash
sudo vim /etc/php/7.2/apache2/php.ini
```

И изменим следующие значения:

```conf
post_max_size = 1G
...
upload_max_filesize = 512M
...
short_open_tag = On
...
date.timezone = "Europe/Moscow"
```

> где **post_max_size** — максимальный объем отправляемых на сервер данных;
>
> **upload_max_filesize** — максимально допустимый размер одного загружаемого файла;
>
> **short_open_tag** — разрешение использования короткого способа открытия php (<?);
>  
> **date.timezone** — временная зона, которая будет использоваться веб-сервером, если ее не переопределить настройками в коде php или в файле .htaccess.

Теже настройки применяем для php-fpm:

```bash
sudo vim /etc/php/7.2/fpm/php.ini
```

```conf
post_max_size = 1G
...
upload_max_filesize = 512M
...
short_open_tag = On
...
date.timezone = "Europe/Moscow"
```

Перезапустим php-fpm и apache:

```bash
sudo systemctl restart php7.2-fpm
sudo systemctl restart apache2
```

### NGINX

Откроем на редактирование следующий файл:

```bash
sudo vim /etc/nginx/nginx.conf
```

И внутри секции http добавим:

```conf
client_max_body_size 512M;
```

После перезапускаем nginx:

```bash
sudo systemctl restart nginx
```

## Создание хоста

Для создания виртуального домена зададим переменную, значение которой будет домен сайта:

```bash
TMP_SITE=mysite.local
```

\* где **mysite.local** заменить на имя домена, для которого создаем первый сайт. Нам будет намного удобнее копировать и вставлять команды с переменной (не придется править после копипасты).

### Добавление виртуального домена

Создаем новый файл виртуального домена NGINX:

```bash
sudo vim /etc/nginx/sites-enabled/$TMP_SITE.conf
```

\* обязательно на конце должен быть ``.conf``, так как только такие файлы веб-сервер подгружает в конфигурацию.

И добавляем следующее содержимое.

Для HTTP:

```conf
server {
    listen       80;
    server_name  mysite.local www.mysite.local;
    set $root_path /var/www/mysite.local/www;

    access_log /var/www/mysite.local/log/nginx/access_log;
    error_log /var/www/mysite.local/log/nginx/error_log;
    
    gzip  on;
    gzip_disable "msie6";
    gzip_min_length 1000;
    gzip_vary on;
    gzip_proxied    expired no-cache no-store private auth;
    gzip_types      text/plain text/css application/json application/x-javascript text/xml application/xml application/xml+rss text/javascript application/javascript;

    root   $root_path;

    location / {
        proxy_pass http://127.0.0.1:8080/;
        proxy_redirect     off;
        proxy_set_header   Host             $host;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_set_header   X-Real-IP        $remote_addr;
        proxy_set_header   X-Forwarded-For  $proxy_add_x_forwarded_for;
    }
    
    location ~* ^.+\.(jpg|jpeg|gif|png|css|zip|tgz|gz|rar|bz2|doc|docx|xls|xlsx|exe|pdf|ppt|tar|wav|bmp|rtf|js)$ {
            expires modified +1w;
    }
}
```

> где **mysite.local** — домен, для которого создается виртуальный домен;
> **/var/www/mysite** — каталог, в котором будет размещаться сайт.
>
> все запросы будут переводиться на локальный сервер, порт 8080, на котором работает apache, кроме обращений к статическим файла (jpg, png, css и так далее).
>
> обратите внимание на выделения полужирным — здесь нужно подставить свои данные.

Для HTTPS:

```conf
server {
    listen 80;
    server_name mysite.local www.mysite.local;
    return 301 https://$host$request_uri;
}

server {
    listen       443 ssl;
    ssl on;
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/cert.key;

    server_name  mysite.local www.mysite.local;
    set $root_path /var/www/mysite.local/www;

    access_log /var/www/mysite.local/log/nginx/access_log;
    error_log /var/www/mysite.local/log/nginx/error_log;
    
    gzip  on;
    gzip_disable "msie6";
    gzip_min_length 1000;
    gzip_vary on;
    gzip_proxied    expired no-cache no-store private auth;
    gzip_types      text/plain text/css application/json application/x-javascript text/xml application/xml application/xml+rss text/javascript application/javascript;

    root   $root_path;

    location / {
        proxy_pass http://127.0.0.1:8080/;
        proxy_redirect     off;
        proxy_set_header   Host             $host:$server_port;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_set_header   X-Real-IP        $remote_addr;
        proxy_set_header   X-Forwarded-For  $proxy_add_x_forwarded_for;
    }
    
    location ~* ^.+\.(jpg|jpeg|gif|png|css|zip|tgz|gz|rar|bz2|doc|docx|xls|xlsx|exe|pdf|ppt|tar|wav|bmp|rtf|js)$ {
            expires modified +1w;
    }
}
```

>в первой секции server мы перенаправляем все запросы по незащищенному http на https.
>
>ssl_certificate и ssl_certificate_key — пути к публичному и приватному ключам соответственно.

Теперь создадим виртуальный домен в Apache:

```bash
sudo vi /etc/apache2/sites-enabled/$TMP_SITE.conf
```

```conf
<VirtualHost *:8080>
    Define root_domain mysite.local
    Define root_path /var/www/mysite.local

    ServerName ${root_domain}
    ServerAlias www.${root_domain}
    DocumentRoot ${root_path}/www

    ErrorLog     ${root_path}/log/apache/error_log
    TransferLog  ${root_path}/log/apache/access_log

    php_admin_value upload_tmp_dir ${root_path}/tmp
    php_admin_value doc_root ${root_path}
    php_admin_value open_basedir    ${root_path}:/usr/local/share/smarty:/usr/local/share/pear
    php_admin_value session.save_path 0;0660;${root_path}/tmp
</VirtualHost>
```

Создадим каталоги для сайта:

```bash
mkdir -p /var/www/$TMP_SITE/{www,tmp}
mkdir -p /var/www/$TMP_SITE/log/{nginx,apache}
```

Создаем индексный файл со следующим содержимым:

```bash
vi /var/www/$TMP_SITE/www/index.php
```

```php
<?php echo "<h1>Hello from mysite</h1>"; ?>
```

Задим права на папки:

```bash
chown -R www-data:www-data /var/www/$TMP_SITE
chmod -R 775 /var/www/$TMP_SITE
```

Проверяем корректность настроек конфигурационных файлов:

```bash
nginx -t
apachectl configtest
```

Перезапускаем веб-сервер:

```bash
systemctl reload nginx
systemctl reload apache2
```

Откроем сайт в браузере по нашему домену mysite.local (он должен быть прописан в DNS или можно его задать в локальном файле hosts того компьютера, с которого мы открываем сайт в браузере). Мы должны увидеть фразу «Hello from site1».

### Создание пользователя FTP

Для возможности подключения к сайту по FTP, создадим отдельного пользователя:

```bash
ftpasswd --passwd --file=/etc/proftpd/ftpd.passwd --name=mysite.local --uid=33 --gid=33 --home=/var/www/$TMP_SITE --shell=/usr/sbin/nologin
```

>тут мы создадим пользователя mysite.local, который будет иметь доступ к каталогу /var/www/$TMP_SITE.
