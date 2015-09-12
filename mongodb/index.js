var MongoClient = require('mongodb').MongoClient
    , assert = require('assert');

// Connection URL
var url = 'mongodb://localhost:27017/myproject';
var db = null;
// Use connect method to connect to the Server
MongoClient.connect(url, function(err, dbLink) {
    assert.equal(null, err);
    console.log("Connected correctly to server");

    db = dbLink;
    db.collection('messages').remove();
});

model = {
    close: function() {
        console.log('close connection');
        db.close();
    },

    save: function(data) {
        return new Promise(function(resolve, reject) {
            // Get the documents collection
            var collection = db.collection('messages');
            // Insert some documents
            collection.insert([
                data
            ], function(err, result) {
                console.log('inserted in history', result);
                if (err) {
                    return reject(err);
                }

                resolve(result);
            });
        });
    },

    getAll: function() {
        return new Promise(function(resolve, reject) {
            // Get the documents collection
            var collection = db.collection('messages');
            // Find some documents
            collection.find({}).toArray(function(err, result) {
                console.log('request history', result);
                if (err) {
                    return reject(err);
                }

                resolve(result);
            });
        });
    }
};

module.exports = model;