var request = require('request');
var config = require('config');

var model = {
    checkUser: function (userId) {
        return new Promise(function (resolve, reject) {
            request(config.get('backServ') + '/auth/session/' + userId, function (error, response, body) {
                console.log(error);
                console.log(response.statusCode);
                if (!error && response.statusCode === 200) {
                    return resolve(JSON.parse(body));
                }
                return reject('invalid authorization');
            });
        });
    }
};

module.exports = model;