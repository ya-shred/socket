//var redis = require('socket.io-redis');
var config = require('config');
var io = require('socket.io').listen(config.get('socketPort'));
var api = require('../api/api');
var mongo = require('../mongodb/mongodb.js');

//io.adapter(redis({ host: settings.redisHost, port: settings.redisPort}));

console.log('Socket on ' + config.get('socketPort'));

var model = {
    start: function () {
        // Навешиваем обработчик на подключение нового клиента
        io.on('connection', function (socket) {
            console.log('new user');
            model.connect(socket);
        });
    },
    /**
     * Подключаем пользователя
     * @param {Socket} socket - сокет вновь подключенного пользователя
     * @returns {Promise}
     */
    connect: function (socket) {
        // Храним информацию о подключенном пользователе
        var userInfo = null;

        return model.checkUser(socket)
            // Пользователь проверен
            .then(function (user) {
                console.log('user checked');
                userInfo = user;
                socket.join('general'); // Сейчас подключаем к общему каналу, по которому сейчас идут сообщения
                // Подключаем пользователя к его каналам, информации о пользователях и отправляем ему эти данные
                return Promise.all([model.joinChannel(user, socket), model.joinUserInfo(user, socket)]);
            })
            .then(function () {
                // Сообщаем всем что пользователь подключился
                model.connected(userInfo);
                // Обработка всех поступающих от пользователя сообщений
                socket.on('message', function (message) {
                    console.log('got message', message);
                    // Процессим сообщение
                    api.processMessage(userInfo, message)
                        // Если обработка сообщения прошла успешна
                        .then(function (response) {
                            console.log('sending', response);
                            // Отправляем необходимые данные в комнату
                            if (response.message) {
                                io.to(response.channel).send(response.message);
                            }
                        })
                        // Если обработка прошла с ошибкой, отправляем сообщение об ошибке
                        .catch(function (errorMessage) {
                            socket.send(errorMessage);
                        });
                });
                socket.on('disconnect', function () {
                    model.disconnected(userInfo);
                    console.log('user disconnected');
                });
            })
            // Если что-то пошло не так, то отключаем пользователя
            .catch(function (error) {
                socket.send(error);
                socket.disconnect();
                model.disconnected(userInfo);
                console.log(error);
            });
    },
    /**
     * Ждём от пользователя сообщение с токеном для проверки личности
     * @returns {Promise}
     */
    checkUser: function (socket) {
        console.log('checkUser');
        return new Promise(function (resolve, reject) {
            socket.on('authenticate', function (message) {
                console.log('authenticate', message);
                socket.removeAllListeners('authenticate');
                api.processMessage(null, message)
                    .then(function (response) { // Проверка прошла
                        socket.send(response.message);
                        resolve(response.user);
                    })
                    .catch(function (error) { // Проверка не прошла
                        reject(error);
                    });
            });
        });
    },
    /**
     * Подключам пользователя к каналам сообщений
     * @param {User} user
     * @param {Socket} socket
     * @returns {Promise.<T>}
     */
    joinChannel: function (user, socket) {
        return mongo.getChannels(user)
            .then(function (channels) {
                channels.forEach(function (channel) {
                    socket.join('channel_' + channel.channelId);
                });
                console.log('send channelsList', channels);
                socket.send(api.channelsList(channels));
            });
    },
    /**
     * Подключаем пользователя к информации о других пользователях
     * @param user
     * @param socket
     * @returns {Promise.<T>}
     */
    joinUserInfo: function (user, socket) {
        return mongo.getUsers(user)
            .then(function (users) {
                users.forEach(function (user) {
                    socket.join('user_' + user.id);
                });
                console.log('send usersList', users);
                socket.send(api.usersList(users));
            });

    },
    /**
     * Сообщаем всем, что пользователь подключился
     * @param {User} user
     */
    connected: function (user) {
        console.log('connected', 'user_' + user.id);
        io.to('user_' + user.id).send(api.connected(user));
    },
    /**
     * Сообщаем всем, что пользователь вышел
     * @param {User} user
     */
    disconnected: function (user) {
        console.log('disconnected', 'user_' + user.id);
        io.to('user_' + user.id).send(api.disconnected(user));
    }
};

module.exports = model;
