---
title: Шпаргалка tmux 
permalink: /docs/tmux-cheatsheet/
---

Новая сессия:

```bash
tmux
```

Создать новую сессию с именем <myname>:

```bash
tmux new -s myname
```

Подключиться к уже существующей сессии:

```bash
tmux a  # (or at, or attach)
```

Подключиться к существующей сессии с именем <myname>:

    tmux a -t myname

Просмотреть запущенные сессии:

    tmux ls

завершить сессию:

    tmux kill-session -t myname

завершить все сессии:

    tmux ls | grep : | cut -d. -f1 | awk '{print substr($1, 0, length($1)-1)}' | xargs kill

В tmux нажмите на префикс `ctrl+b` (В моём случае префикс настроен на сочетание ctrl+a) а после:

## Просмотр клавиатурных сокращений

Для просмотра всех клавиатурных сокращений в tmux просто используйте сочетание клавиш `<prefix> ?` по умолчанию `CTRL-B ?`

## Сессии

```bash
<prefix> :new  # запуск новой сессии
<prefix> s  # просмотр запущенных сессий
<prefix> $  # переименовать сессию
```

## Окна (tabs)

```bash
<prefix> c  # создать окно
<prefix> w  # просмотреть запущенные окна
<prefix> n  # переключиться на следующее окно
<prefix> p  # переключиться на предыдущее окно
<prefix> f  # найти окно
<prefix> ,  # переименовать окно
<prefix> &  # заввершить работу окна
```

## Панели (splits) 

```text
<prefix> %  # вертикальное разделение
<prefix> "  # горизонтальное разделение
<prefix> o  # поменять активную панель
<prefix> q  # показать номера панелей (Если в момент демонстации номеров панелей нажать номер панели - переход в соответствующую панель)
<prefix> x  # завершить работу панели
<prefix> +  # Переместить активную панель в новое окно (Для выделения текста мышью) для восстановления повторить
<prefix> ␣  # пробел - переключение между режимами отображения (layouts)
<prefix> {  # (Переместить активную панель в лево)
<prefix> }  # (Переместить активную панель в право)
<prefix> z  # Развернуть активную панель
```

## Синхронизация панелей 

Вы можете сделать это, переключившись в соответствующее окно, введя свой префикс Tmux (обычно Ctrl-B или Ctrl-A), а затем двоеточие, чтобы вызвать командную строку Tmux, и набрав:

```bash
:setw synchronize-panes
```

Вы можете дополнительно добавить включение или выключение, чтобы указать, какое состояние вы хотите; в противном случае опция просто переключается. Этот параметр специфичен для одного окна, поэтому он не изменит способ работы других ваших сеансов или окон. Когда вы закончите, снова выключите его, повторив команду.

## Изменения размеров панелей

Вы также можете изменять размер панелей, если вам не нравятся размеры по умолчанию. Лично мне редко приходится это делать, хотя полезно знать, как это делается. Вот основной синтаксис для изменения размера панелей:

```bash
<prefix> Ctr+<стрелки> 
```
        
## Режим копирования:

Pressing PREFIX [ places us in Copy mode. We can then use our movement keys to move our cursor around the screen. By default, the arrow keys work. we set our configuration file to use Vim keys for moving between windows and resizing panes so we wouldn’t have to take our hands off the home row. tmux has a vi mode for working with the buffer as well. To enable it, add this line to .tmux.conf:

    setw -g mode-keys vi

With this option set, we can use h, j, k, and l to move around our buffer.

To get out of Copy mode, we just press the ENTER key. Moving around one character at a time isn’t very efficient. Since we enabled vi mode, we can also use some other visible shortcuts to move around the buffer.

For example, we can use "w" to jump to the next word and "b" to jump back one word. And we can use "f", followed by any character, to jump to that character on the same line, and "F" to jump backwards on the line.

       Function                vi             emacs
       Back to indentation     ^              M-m
       Clear selection         Escape         C-g
       Copy selection          Enter          M-w
       Cursor down             j              Down
       Cursor left             h              Left
       Cursor right            l              Right
       Cursor to bottom line   L
       Cursor to middle line   M              M-r
       Cursor to top line      H              M-R
       Cursor up               k              Up
       Delete entire line      d              C-u
       Delete to end of line   D              C-k
       End of line             $              C-e
       Goto line               :              g
       Half page down          C-d            M-Down
       Half page up            C-u            M-Up
       Next page               C-f            Page down
       Next word               w              M-f
       Paste buffer            p              C-y
       Previous page           C-b            Page up
       Previous word           b              M-b
       Quit mode               q              Escape
       Scroll down             C-Down or J    C-Down
       Scroll up               C-Up or K      C-Up
       Search again            n              n
       Search backward         ?              C-r
       Search forward          /              C-s
       Start of line           0              C-a
       Start selection         Space          C-Space
       Transpose chars                        C-t

## Разное

    d  detach
    t  big clock
    ?  list shortcuts
    :  prompt

## Опции конфигурации:

    # Mouse support - set to on if you want to use the mouse
    * setw -g mode-mouse off
    * set -g mouse-select-pane off
    * set -g mouse-resize-pane off
    * set -g mouse-select-window off

    # Set the default terminal mode to 256color mode
    set -g default-terminal "screen-256color"

    # enable activity alerts
    setw -g monitor-activity on
    set -g visual-activity on

    # Center the window list
    set -g status-justify centre

    # Maximize and restore a pane
    unbind Up bind Up new-window -d -n tmp \; swap-pane -s tmp.1 \; select-window -t tmp
    unbind Down
    bind Down last-window \; swap-pane -s tmp.1 \; kill-window -t tmp
