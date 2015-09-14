//var redis = require('socket.io-redis');
var settings = require('../settings/settings');
var io = require('socket.io').listen(settings.socketPort);
var api = require('../api/api');
var mongo = require('../mongodb/mongodb.js');

//io.adapter(redis({ host: settings.redisHost, port: settings.redisPort}));

// Навешиваем обработчик на подключение нового клиента
io.on('connection', function (socket) {
    console.log('new user');
    model.connect(socket);
});

model = {
    /**
     * Подключаем пользователя
     * @param {Socket} socket - сокет вновь подключенного пользователя
     * @returns {Promise}
     */
    connect: function (socket) {
        // Храним информацию о подключенном пользователе
        var userInfo = null;

        return model.checkUser()
            // Пользователь проверен
            .then(function (user) {
                console.log('user checked');
                userInfo = user;
                // Получаем историю сообщений из монги
                return mongo.getHistory(user)
            })
            .then(function(history) {
                console.log('sending history', history);
                // Отправляем историю сообщений пользователю
                socket.send({type: 'history', data: history}); // TODO: Проверка что сообщение доставлено пользователю
                // Подписываем его на каналы, в соответствии с его историей сообщений
                history.forEach(function (el) {
                    // то что мы пробуем для каждого сообщения из истории добавить в комнату,
                    // не требует много ресурсов, т.к. комнаты - это массив и перед добавлением в комнату проверяется
                    // indexOf по имени комнаты
                    socket.join(el.channelId);
                });
                // Обработка всех поступающих от пользователя сообщений
                socket.on('message', function(message) {
                    // Процессим сообщение
                    api.processMessage(userInfo, message)
                        // Если обработка сообщения прошла успешна
                        .then(function(channel, message) {
                            // Отправляем необходимые данные в комнату
                            if (message) {
                                io.to(channel).emit(message);
                            }
                            // Говорим пользователю что его запрос обработан
                            socket.send({
                                type: 'status',
                                data: {
                                    status: 'ok'
                                }
                            });
                        })
                        // Если обработка прошла с ошибкой, отправляем сообщение об ошибке
                        .catch(function(errorMessage) {
                            socket.send({
                                type: 'status',
                                data: {
                                    status: 'error',
                                    message: errorMessage
                                }
                            });
                        });
                });
                socket.on('disconnect', function () {
                    model.disconnect(userInfo);
                    console.log('user disconnected');
                });
            })
            // Если что-то пошло не так, то отключаем пользователя
            .catch(function(error) {
                socket.disconnect();
                model.disconnect(userInfo);
                console.log(error);
            });
    },
    /**
     * Ждём от пользователя сообщение с токеном для проверки личности
     * @returns {Promise}
     */
    checkUser: function () {
        return new Promise(function (resolve, reject) {
            resolve({id: 'test user id'});
        });
    },
    /**
     * Сообщаем всем, что пользователь вышел
     * @param {User} user
     */
    disconnect: function(user) {

    }
};