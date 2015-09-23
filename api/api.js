var mongo = require('../mongodb/mongodb.js');
//var socketServer = require('../io/io.js');

var model = {
    handlers: {
        onAuthenticateMessage: function() {
            var user = { id: 'test' };
            return {
                user: user,
                message: {
                    type: 'authenticated',
                    data: {
                        user: user
                    }
                }
            }
        },
        onSendMessage: function(user, message) {
            return {
                channel: 'channel_' + user.id,
                message: {
                    type: 'new_message',
                    data: {
                        message: message,
                        user: user,
                        datetime: +new Date()
                    }
                }
            }
        },
        onErrorMessage: function() {
            return Promise.reject({
                type: 'status',
                data: {
                    status: 'error',
                    message: 'unknown command'
                }
            });
        }
    },
    /**
     * Процессим сообщение от пользователя, делаем все необходимые действия
     * @param {User} user - информация об отправителе
     * @param {Message} message - сообщение отправителя
     */
    processMessage: function (user, message) {
        var messageHandler = model.handlers[model.MESSAGE_HANDLERS[message.type]];
        if (!messageHandler) {
            return Promise.resolve(model.handlers[model.MESSAGE_HANDLERS['error']]());
        }

        return Promise.resolve(messageHandler(user, message)); // чтоб всегда гарантировать Promise на выходе
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

model.MESSAGE_HANDLERS = {
    authenticate: 'onAuthenticateMessage',
    error: 'onErrorMessage',
    send_message: 'onSendMessage'
};

module.exports = model;