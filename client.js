window.io = require('socket.io-client');
/**
 * Клиентская библиотека для работы с сокет сервером.
 */

// TEST: Для тестирования библиотеки
window.socketUserId = 'test';

/**
 * Вспомогательная функция для загрузки стороннего скрипта
 * @param url - url скрипта
 * @returns {Promise}
 */
//var loadScript = function (url) {
//    // Adding the script tag to the head as suggested before
//    var head = document.getElementsByTagName('head')[0];
//    var script = document.createElement('script');
//    script.type = 'text/javascript';
//    script.src = url;
//
//    var res = new Promise(function (resolve, reject) {
//        // Then bind the event to the callback function.
//        // There are several events for cross browser compatibility.
//        script.onreadystatechange = resolve;
//        script.onload = resolve;
//    });
//
//    // Fire the loading
//    head.appendChild(script);
//
//    return res;
//};

//var socketClientUrl = "http://localhost:8008/socket.io/socket.io.js";
var socketServerUrl = 'http://localhost:8008';
var socket = null;

/**
 * Модель для формирования сообщений
 */
var api = {
    authenticate: function (userId) {
        return {
            type: 'authenticate',
            data: {
                userId: userId
            }
        }
    },
    send_message: function(params) {
        if (!params.channel) {
            return { error: 'Не указан канал отправки' };
        }
        if (!params.message) {
            return { error: 'Пустое сообщение недопустимо' };
        }
        return {
            type: 'send_message',
            data: {
                channel: params.channel,
                text: params.message
            }
        }
    }
};

/**
 * Модель для работы с сокетным сервером
 */
var model = {
    /**
     * Загрузка клиентской библиотеки для работы с socket.io
     * Запуск аутентификации после загрузки
     * @private
     */
    _init: function () {
        model.inited = new Promise(function (resolve, reject) {
            return model._connect()
                .then(function () {
                    /**
                     * TEST: Для тестирования. Выводим в консоль всё что приходит
                     */
                    model.listen(function (message) {
                        console.log(message);
                    });
                    resolve();
                })
                .catch(function (error) {
                    reject(error);
                });
        });
    },
    /**
     * Информация о пользователе
     */
    userInfo: null,
    /**
     * Когда библиотека проинициализирована, промис в inited резолвится
     */
    inited: null,
    /**
     * Аутентификация пользователя на сокетном сервере по userId из window.socketUserId
     * @private
     */
    _authenticate: function () {
        var userId = window.socketUserId;
        return new Promise(function (resolve, reject) {
            if (userId) {
                socket.on('authenticate', function (user) {
                    console.log('authenticated', user);
                    model.userInfo = user;
                    socket.removeAllListeners('authenticate');
                    resolve(user);
                });
                socket.emit('authenticate', api.authenticate(userId));
            } else {
                reject('Нет авторизационного ключа');
            }
        });
    },
    /**
     * Подключение к сокетному серверу. При каждом подключении отправлять авторизационный ключ
     * @returns {Promise}
     * @private
     */
    _connect: function () {
        socket = io.connect(socketServerUrl);
        return new Promise(function (resolve, reject) {
            socket.on('connect', function () {
                console.log('connected');
                model._authenticate()
                    .then(function () {
                            resolve();
                        }, function (error) {
                            reject(error);
                        })
            });
        });
    },
    /**
     * Слушаем входящие сообщения от сокетного сервера
     * @param {Function} callback - вызывается на входящее сообщение
     */
    listen: function (callback) {
        socket.on('message', function (message) {
            callback(message);
        });
    },
    /**
     * Интерфейс для отправки команд
     */
    send: function(params) {
        if (params.type && api[params.type]) {
            var message = api[params.type](params);
            if (message.error) {
                return message.error;
            } else {
                socket.send(message);
            }
        } else {
            return 'Неизвестная команда';
        }
    }
};

model._init();

window.socketClient = model;