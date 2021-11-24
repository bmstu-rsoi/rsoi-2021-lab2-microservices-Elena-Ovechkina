const path = require('path');
const rootPath = path.normalize(__dirname + '/..');
const env = process.env.NODE_ENV || 'development';

const config = {
  development: {
    root: rootPath,
    serverAddress: 'http://localhost:3002',
    app: {
      name: 'car'
    },
    port: process.env.PORT || 3002,
    db: 'mongodb://localhost/car-development'
  },

  test: {
    root: rootPath,
    app: {
      name: 'car'
    },
    port: process.env.PORT || 3002,
    serverAddress: `http://localhost:${process.env.PORT || 3002}`,
    db: 'mongodb://localhost/car-test'
  },
  ci: {
    root: rootPath,
    app: {
      name: 'car'
    },
    serverAddress: `http://localhost:${process.env.PORT || 3002}`,
    port: process.env.PORT || 3002,
    db: 'mongodb+srv://programm:myprogramm@cluster0.o3zxo.mongodb.net/car-ci-db?retryWrites=true&w=majority'
  },
  production: {
    root: rootPath,
    app: {
      name: 'car'
    },
    port: process.env.PORT || 3002,
    db: 'mongodb+srv://programm:myprogramm@cluster0.o3zxo.mongodb.net/car-db?retryWrites=true&w=majority'
  }
};

module.exports = config[env];
