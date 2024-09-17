const path = require('path');

module.exports = {
    entry: {
        'firebase-messaging-sw': './firebase-messaging-sw.js',
    },
    output: {
        path: path.resolve(__dirname, 'public'),
        filename: '[name].js',
    },
};
