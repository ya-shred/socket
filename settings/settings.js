var model = {
    socketPort: '8008'
};

switch (process.env.NODE_ENV) {
    case 'development':
        model.socketUrl = '';
        model.redisHost = 'localhost';
        model.redisPort = '6379';
        console.log('start as development');
        break;
    case 'production':
        console.log('start as production');
        break;
}

module.exports = model;