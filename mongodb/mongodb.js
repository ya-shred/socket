var MongoClient = require('mongodb').MongoClient;
var config = require('config');

// Connection URL
var url = config.get('dbConnectionUrl');
var db = null;
// Use connect method to connect to the Server
MongoClient.connect(url, function (err, dbLink) {
    console.log("Connected correctly to server");

    db = dbLink;
    db.collection('messages').remove();
});

model = {
    close: function () {
        console.log('close connection');
        db.close();
    },

    save: function (data) {
        return new Promise(function (resolve, reject) {
            // Get the documents collection
            var collection = db.collection('messages');
            // Insert some documents
            collection.insert([
                data
            ], function (err, result) {
                console.log('inserted in history', result);
                if (err) {
                    return reject(err);
                }

                resolve(result);
            });
        });
    },

    getAll: function () {
        return new Promise(function (resolve, reject) {
            // Get the documents collection
            var collection = db.collection('messages');
            // Find some documents
            collection.find({}).toArray(function (err, result) {
                console.log('request history', result);
                if (err) {
                    return reject(err);
                }

                resolve(result);
            });
        });
    },

    getHistory: function (user) {
        return new Promise(function (resolve, reject) {
            resolve([{channel: 'test', message: 'test'}]);
        });
    },

    getChannels: function (user) {
        return new Promise(function (resolve, reject) {
            resolve([{channelId: 'test'}]);
        });
    },

    getUsers: function (user) {
        return new Promise(function (resolve, reject) {
            resolve([{id: 'user', message: 'test'}]);
        });
    }
};

module.exports = model;