var mongo = require('../mongodb/mongodb.js');

var model = {
    /**
     * Процессим сообщение от пользователя, делаем все необходимые действия
     * @param {User} user - информация об отправителе
     * @param {Message} message - сообщение отправителя
     */
    processMessage: function(user, message) {
        return new Promise(function(resolve, reject) {
            switch (message.type) {
                default:
                    reject('unknown command');
            }
        });
    }
};

module.exports = model;