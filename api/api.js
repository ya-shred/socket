var mongo = require('../mongodb/mongodb.js');
//var socketServer = require('../io/io.js');

var model = {
    /**
     * Процессим сообщение от пользователя, делаем все необходимые действия
     * @param {User} user - информация об отправителе
     * @param {Message} message - сообщение отправителя
     */
    processMessage: function (user, message) {
        return new Promise(function (resolve, reject) {
            switch (message.type) {
                case 'authenticate':
                    var user = {id: 'user'};
                    resolve({
                        user: user,
                        message: {
                            type: 'authenticated',
                            data: {
                                user: user
                            }
                        }
                    });
                    break;
                default:
                    reject({
                        type: 'status',
                        data: {
                            status: 'error',
                            message: 'unknown command'
                        }
                    });
            }
        });
    },
    /**
     * Сообщение, когда пользователь отключился
     * @param {User} user
     * @returns {Message}
     */
    disconnected: function (user) {
        return {
            type: 'user_disconnected',
            data: {
                userId: user.id
            }
        }
    },
    /**
     * Сообщение, когда пользователь подключился
     * @param {User} user
     * @returns {Message}
     */
    connected: function (user) {
        return {
            type: 'user_connected',
            data: {
                userId: user.id
            }
        }
    }
};

module.exports = model;