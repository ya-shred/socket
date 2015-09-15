//var url = 'http://localhost:8008';
//// Создаем текст сообщений для событий
//var strings = {
//    'connected': '[sys][time]%time%[/time]: Вы успешно соединились к сервером как [user]%name%[/user].[/sys]',
//    'userJoined': '[sys][time]%time%[/time]: Пользователь [user]%name%[/user] присоединился к чату.[/sys]',
//    'messageSent': '[out][time]%time%[/time]: [user]%name%[/user]: %text%[/out]',
//    'messageReceived': '[in][time]%time%[/time]: [user]%name%[/user]: %text%[/in]',
//    'userSplit': '[sys][time]%time%[/time]: Пользователь [user]%name%[/user] покинул чат.[/sys]'
//};
//window.onload = function() {
//    var addMessage = function(msg) {
//        var el = document.querySelector('#log');
//        // Добавляем в лог сообщение, заменив время, имя и текст на полученные
//        el.innerHTML += strings[msg.event].replace(/\[([a-z]+)\]/g, '<span class="$1">').replace(/\[\/[a-z]+\]/g, '</span>').replace(/\%time\%/, msg.time).replace(/\%name\%/, msg.name).replace(/\%text\%/, unescape(msg.text).replace('<', '&lt;').replace('>', '&gt;')) + '<br>';
//
//        // Прокручиваем лог в конец
//        el.scrollTop = el.scrollHeight;
//    };
//
//    // Создаем соединение с сервером
//    var socket = io.connect(url);
//    socket.on('connect', function () {
//        console.log('connected');
//        socket.on('message', function (msg) {
//            console.log(msg);
////            if (msg.event === 'history') {
////                msg.messages.forEach(function(el, i) {
////                    addMessage(el);
////                });
////            } else {
////                addMessage(msg);
////            }
//        });
//        // При нажатии <Enter> или кнопки отправляем текст
//        document.querySelector('#input').onkeypress = function(e) {
//            if (e.which == '13') {
//                // Отправляем содержимое input'а, закодированное в escape-последовательность
//                socket.send(escape(document.querySelector('#input').value));
//                // Очищаем input
//                document.querySelector('#input').value = '';
//            }
//        };
//        document.querySelector('#send').onclick = function() {
//
//            socket.send(escape(document.querySelector('#input').value));
//            document.querySelector('#input').value = '';
//        };
//    });
//};