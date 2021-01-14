---
title: Простейшая реализация Web Push уведомлений
permalink: /docs/webPush/
---

Push-уведомления - это наиболее используемый канал связи веб-приложений, позволяющий оставаться на связи со своими пользователями. Когда мы посещаем любой веб-сайт, мы видим уведомление о согласии, чтобы разрешить или заблокировать уведомление. Эти оповещения создаются веб-сайтами для получения согласия на отображение уведомлений с последними обновлениями, новостями и т. Д. Если мы даем разрешение на отображение уведомлений, то уведомления отправляются администратором веб-сайта для отображения пользователям веб-сайта. В настоящее время push-уведомления - это наиболее востребованная функция, реализованная на веб-сайтах. Так что, если вы разрабатываете веб-приложение и вам нужно реализовать функцию push-уведомлений, то вы попали в нужное место. В этом руководстве вы узнаете, как создать систему push-уведомлений с помощью PHP и MySQL.

В этом руководстве мы шаг за шагом рассмотрим живой пример создания уведомлений администратором с подробными сведениями о push. Как правило, чтобы увидеть push-уведомления, нужно войти в систему.

Итак, давайте реализуем систему push-уведомлений с PHP и MySQL. Основные файлы:

* `login.php`
* `index.php`
* `manage.php`
* `notification.js`
* `notification.php`
* `User.php`: Клас содержит в себе методы относящиеся к пользователям.
* `Notification.php`: Клас содержаит методы относящиеся к уведомлениям.

## Шаг 1: Подготовка базы данных

Сначала мы создадим таблицу базы данных MySQL `notification_user` для администратора и обычного пользователя для тестирования системы push-уведомлений.

```sql
CREATE TABLE `notification_user` (
  `id` int(11) NOT NULL,
  `username` varchar(100) NOT NULL,
  `password` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

ALTER TABLE `notification_user`
  ADD PRIMARY KEY (`id`);
  
ALTER TABLE `notification_user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
```

Добавим несколько пользовательских записей для тестирования.

```sql
INSERT INTO `notification_user` (`id`, `username`, `password`) VALUES
(1, 'test', '12345'),
(2, 'admin', '12345');
```

Также мы создадим таблицу `notifications` для хранения деталей уведомлений.

```sql
CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `title` varchar(250) NOT NULL,
  `message` text NOT NULL,
  `ntime` datetime DEFAULT NULL,
  `repeat` int(11) DEFAULT 1,
  `nloop` int(11) NOT NULL DEFAULT 1,
  `publish_date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `username` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`);
  
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
```

## Шаг 2: Форма аутентификации пользователя

Cоздадим файл login.php и спроектируем форму входа.

```html
<div class="container">
    <h2>User Login:</h2>
    <div class="row">
        <div class="col-sm-4">
            <form method="post">
                <div class="form-group">
                    <?php if ($message ) { ?>
                        <div class="alert alert-warning"><?php echo $message; ?></div>
                    <?php } ?>
                </div>
                <div class="form-group">
                    <label for="username">Username:</label>
                    <input type="username" class="form-control" name="username" required>
                </div>
                <div class="form-group">
                    <label for="password">Password:</label>
                    <input type="password" class="form-control" name="password" required>
                </div>  
                <button type="submit" name="login" class="btn btn-default">Login</button>
            </form><br>
        </div>
    </div>
</div>
```

Для обработки функциональности входа пользователя, вызовем метод `login()` из класса `User.php`. И сохраним имя пользователя в сеансе, чтобы использовать его при реализации функции push-уведомлений.

```php
session_start();
$message = '';
if (!empty($_POST['username']) && !empty($_POST['password'])) {

    include_once 'config/Database.php';
    include_once 'class/User.php';

    $database = new Database();
    $db = $database->getConnection();
    $user = new User($db);

    $user->username = $_POST['username'];
    $user->password = $_POST['password'];

    if($user->login()) {
        $_SESSION['username'] = $user->username;
        header("Location:index.php");
    } else {
        $message = "Invalid username or password!";
    }
}
```

Реализуем метод `login` в классе `User.php`.

```php
function login (){
    $stmt = $this->conn->prepare("
        SELECT id as userid, username, password 
        FROM ".$this->userTable." 
        WHERE username = ? AND password = ? ");
    $stmt->bind_param("ss", $this->username, $this->password);
    $stmt->execute();
    $result = $stmt->get_result();
    return $result;
}
```

## Шаг 3: Демонстрация учётной записи пользователя

Мы создадим файл `index.php` для отображения сведений о зарегистрированном пользователе. Также отобразим раздел уведомлений об управлении для пользователя с правами администратора.

```php
<div class="container">
    <h2>Пример: Реализация Web-push уведомлений с использованием PHP и MySQL</h2>
    <h3>Пользователь </h3>
    <?php if(isset($_SESSION['username']) && $_SESSION['username'] == 'admin') { ?>
        <a href="manage.php">Управление уведомлениями</a> | 
    <?php } ?>
    <?php if(isset($_SESSION['username']) && $_SESSION['username']) { ?>
        Авторизован как: <strong><?php echo $_SESSION['username']; ?></strong> | <a href="logout.php">Logout</a>
    <?php } else { ?>
        <a href="login.php">Login</a>
    <?php } ?>
    <hr> 
    <?php if (isset($_SESSION['username']) && $_SESSION['username']) { ?>
        <h4>
            Добро пожаловать!
        </h4>
        <?php if($_SESSION['username'] == 'admin') { ?>
        <div id="loggedIn">
            <h4>
                Вы авторизованы для управления уведомлениями 
            </h4>
        </div>
    <?php } }?>
    
</div>
```

## Шаг 4: Просмотр списка и управление уведомлениями

Мы создадим файл `manage.php` в реализуем функционал управления для администратора, чтобы создать новое уведомление с деталями и назначить пользователям отображение push-уведомлений. Мы вызовем метод `saveNotification ()` из класса `Notification.php`. На этой же странице мы можем вывести список созданных уведомлений.

```php
<div class="row">
    <div class="col-sm-6">
        <h3>Add New Notification:</h3>
        <form method="post"  action="<?php echo $_SERVER['PHP_SELF']; ?>">
            <table class="table borderless">
                <tr>
                    <td>Title</td>
                    <td><input type="text" name="title" class="form-control" required></td>
                </tr>
                <tr>
                    <td>Message</td>
                    <td><textarea name="message" cols="50" rows="4" class="form-control" required></textarea></td>
                </tr>
                <tr>
                    <td>Broadcast time</td>
                    <td><select name="ntime" class="form-control"><option>Now</option></select> </td>
                </tr>
                <tr>
                    <td>Loop (time)</td>
                    <td><select name="loops" class="form-control">
                    <?php 
                        for ($i=1; $i<=5 ; $i++) { ?>
                            <option value="<?php echo $i ?>"><?php echo $i ?></option>
                    <?php } ?>
                    </select></td>
                </tr>
                <tr>
                    <td>Loop Every (Minute)</td>
                    <td><select name="loop_every" class="form-control">
                    <?php 
                    for ($i=1; $i<=60 ; $i++) { ?>
                        <option value="<?php echo $i ?>"><?php echo $i ?></option>
                    <?php } ?>
                    </select> </td>
                </tr>
                <tr>
                    <td>For</td>
                    <td><select name="user" class="form-control">
                    <?php 
                    $allUser = $user->listAll(); 
                    while ($user = $allUser->fetch_assoc()) {
                    ?>
                    <option value="<?php echo $user['username'] ?>"><?php echo $user['username'] ?></option>
                    <?php } ?>
                    </select></td>
                </tr>
                <tr>
                    <td colspan=1></td>
                    <td colspan=1></td>
                </tr>
                <tr>
                    <td colspan=1></td>
                    <td><button name="submit" type="submit" class="btn btn-info">Add Message</button></td>
                </tr>
            </table>
        </form>
    </div>
    </div>
    <?php 
    if (isset($_POST['submit'])) { 
    if(isset($_POST['message']) and isset($_POST['ntime']) and isset($_POST['loops']) and isset($_POST['loop_every']) and isset($_POST['user'])) {
        $notification->title = $_POST['title'];
        $notification->message = $_POST['message'];
        $notification->ntime = date('Y-m-d H:i:s'); 
        $notification->repeat = $_POST['loops']; 
        $notification->nloop = $_POST['loop_every']; 
        $notification->username = $_POST['user'];
        if($notification->saveNotification()) {
            echo '* save new notification success';
        } else {
            echo 'error save data';
        }
    } else {
        echo '* completed the parameter above';
    }
    } 
    ?>
    <h3>Notifications List:</h3>
    <table class="table">
    <thead>
        <tr>
            <th>No</th>
            <th>Next Schedule</th>
            <th>Title</th>
            <th>Message</th>
            <th>Remains</th>
            <th>User</th>
        </tr>
    </thead>
    <tbody>
        <?php $notificationCount =1; 
        $notificationList = $notification->listNotification(); 
        while ($notif = $notificationList->fetch_assoc()) { 
        ?>
        <tr>
            <td><?php echo $notificationCount ?></td>
            <td><?php echo $notif['ntime'] ?></td>
            <td><?php echo $notif['title'] ?></td>
            <td><?php echo $notif['message'] ?></td>
            <td><?php echo $notif['nloop']; ?></td>
            <td><?php echo $notif['username'] ?></td>
        </tr>
        <?php $notificationCount++; } ?>
    </tbody>
</table>
```

Реализуем метод `saveNotification()` в классе `Notification.php`.

```php
function saveNotification(){
    $insertQuery = "
        INSERT INTO ".$this->notificationTable."( `title`, `message`, `ntime`, `repeat`, `nloop`, `username`)
        VALUES(?,?,?,?,?,?)";
    $stmt = $this->conn->prepare($insertQuery);
    $stmt->bind_param("sssiis",$this->title, $this->message, $this->ntime, $this->repeat, $this->nloop, $this->username);
    if($stmt->execute()){
        return true;
    }
    return false;
}
```

## Шаг 5: Обработка push-уведомлений

Мы создадим файл JavaScript `notification.js` и реализуем функцию `getNotification()` для получения уведомлений, через Ajax запрос к файлу `notification.php`. Функция также будет обрабатывать push-уведомления, проверяя разрешения и отображая их.

```js
function getNotification() {
    if (!Notification) {
        $('body').append('*Browser does not support Web Notification');
        return;
    }
    if (Notification.permission !== "granted") {
        Notification.requestPermission();
    } else {
        $.ajax({
            url : "notification.php",
            type: "POST",
            success: function(response, textStatus, jqXHR) {
                var response = jQuery.parseJSON(response);
                if(response.result == true) {
                    var notificationDetails = response.notif;
                    for (var i = notificationDetails.length - 1; i >= 0; i--) {
                        var notificationUrl = notificationDetails[i]['url'];
                        var notificationObj = new Notification(notificationDetails[i]['title'], {
                            icon: notificationDetails[i]['icon'],
                            body: notificationDetails[i]['message'],
                        });
                        notificationObj.onclick = function () {
                            window.open(notificationUrl); 
                            notificationObj.close();     
                        };
                        setTimeout(function(){
                            notificationObj.close();
                        }, 5000);
                    };
                } else {
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {}
        }); 
    }
}
```

## Шаг 6: Получение деталей уведомления

Cоздадим файл `notification.php` и получим сведения об уведомлениях пользователя, вызвав метод getNotificationByUser (), для отображения. Сведения уведомления были обновлены после отображения уведомления путем вызова метода `updateNotification()` из класса `Notification.php`. Сведения о уведомлении возвращаются в виде данных JSON.

```php
session_start(); 
include_once 'config/Database.php';
include_once 'class/Notification.php';
$database = new Database();
$db = $database->getConnection();
$notification = new Notification($db);
$array=array(); 
$rows=array(); 
$notification->username = $_SESSION['username'];
$result = $notification->getNotificationByUser(); 
$totalNotification = 0;
while ($userNotification = $result->fetch_assoc()) {
 $data['title'] = $userNotification['title'];
 $data['message'] = $userNotification['message'];
 $data['icon'] = 'https://webdamn.com/demo/build-push-notification-system-php-mysql-demo/avatar.png';
 $data['url'] = 'https://webdamn.com';
 $rows[] = $data;
 $nextime = date('Y-m-d H:i:s',strtotime(date('Y-m-d H:i:s'))+($userNotification['repeat']*60));
 $notification->nexttime = $nextime;
 $notification->id = $userNotification['id'];
 $notification->updateNotification();
 $totalNotification++;
}
$array['notif'] = $rows;
$array['count'] = $totalNotification;
$array['result'] = true;
echo json_encode($array);
```

Реализуем метод `getNotificationByUser()` в классе `Notification.php`.

```php
function updateNotification() {
    $updateQuery = "
        UPDATE ".$this->notificationTable." 
        SET ntime= ?, publish_date=CURRENT_TIMESTAMP(), nloop = nloop-1 
        WHERE id= ? ";
    $stmt = $this->conn->prepare($updateQuery);
    $stmt->bind_param("si", $this->nexttime, $this->id);
    if($stmt->execute()){
        return true;
    }
    return false;
}
```

Вы можете скачать репозиторий и ознакомится с кодом по [ссылке](https://github.com/toyrik/simpleWebPush).

---
Оригинал взят [отсюда](https://webdamn.com/build-push-notification-system-with-php-mysql/).
