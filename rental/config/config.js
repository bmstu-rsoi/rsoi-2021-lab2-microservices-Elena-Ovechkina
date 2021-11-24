const path = require('path');
const rootPath = path.normalize(__dirname + '/..');
const env = process.env.NODE_ENV || 'development';

const config = {
  development: {
    root: rootPath,
    app: {
      name: 'rental'
    },
    port: process.env.PORT || 3001,
    serverAddress: `http://localhost:${process.env.PORT || 3001}`,
    db: 'mongodb://localhost/rental-development'
  },

  test: {
    root: rootPath,
    app: {
      name: 'rental'
    },
    port: process.env.PORT || 3001,
    serverAddress: `http://localhost:${process.env.PORT || 3001}`,
    db: 'mongodb://localhost/rental-test'
  },
  ci: {
    root: rootPath,
    app: {
      name: 'rental'
    },
    port: process.env.PORT || 3001,
    serverAddress: `http://localhost:${process.env.PORT || 3001}`,
    db: 'mongodb+srv://programm:myprogramm@cluster0.o3zxo.mongodb.net/rental-ci-db?retryWrites=true&w=majority'
  },
  production: {
    root: rootPath,
    app: {
      name: 'rental'
    },
    port: process.env.PORT || 3001,
    db: 'mongodb+srv://programm:myprogramm@cluster0.o3zxo.mongodb.net/rental-db?retryWrites=true&w=majority'
  }
};

module.exports = config[env];
