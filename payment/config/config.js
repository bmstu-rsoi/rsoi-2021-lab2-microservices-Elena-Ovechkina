const path = require('path');
const rootPath = path.normalize(__dirname + '/..');
const env = process.env.NODE_ENV || 'development';

const config = {
  development: {
    root: rootPath,
    app: {
      name: 'payment'
    },
    port: process.env.PORT || 3003,
    serverAddress: `http://localhost:${process.env.PORT || 3003}`,
    db: 'mongodb://localhost/payment-development'
  },

  test: {
    root: rootPath,
    app: {
      name: 'payment'
    },
    port: process.env.PORT || 3003,
    serverAddress: `http://localhost:${process.env.PORT || 3003}`,
    db: 'mongodb://localhost/payment-test'
  },
  ci: {
    root: rootPath,
    app: {
      name: 'payment'
    },
    port: process.env.PORT || 3003,
    serverAddress: `http://localhost:${process.env.PORT || 3003}`,
    db: 'mongodb+srv://programm:myprogramm@cluster0.o3zxo.mongodb.net/payment-ci-db?retryWrites=true&w=majority'
  },
  production: {
    root: rootPath,
    app: {
      name: 'payment'
    },
    port: process.env.PORT || 3003,
    db: 'mongodb+srv://programm:myprogramm@cluster0.o3zxo.mongodb.net/payment-db?retryWrites=true&w=majority'
  }
};

module.exports = config[env];
