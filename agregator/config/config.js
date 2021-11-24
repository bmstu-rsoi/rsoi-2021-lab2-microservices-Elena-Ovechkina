const path = require('path');
const rootPath = path.normalize(__dirname + '/..');
const env = process.env.NODE_ENV || 'development';

const config = {
  development: {
    root: rootPath,
    app: {
      name: 'agregator'
    },
    port: process.env.PORT || 3000,
    serverAddress: "http://localhost:3000",
    services: {
      cars: 'http://localhost:3002',
      rental: 'http://localhost:3001',
      payment:'http://localhost:3003'
    },
    db: 'mongodb://localhost/agregator-development'
  },

  test: {
    root: rootPath,
    app: {
      name: 'agregator'
    },
    services: {
      cars: 'http://localhost:3002',
      rental: 'http://localhost:3001',
      payment:'http://localhost:3003'
    },
    port: process.env.PORT || 3000,
    serverAddress: "http://localhost:3000",
    db: 'mongodb://localhost/agregator-test'
  },

  ci: {
    root: rootPath,
    app: {
      name: 'agregator'
    },
    services: {
      cars: 'http://localhost:3002',
      rental: 'http://localhost:3001',
      payment:'http://localhost:3003'
    },
    port: process.env.PORT || 3000,
    serverAddress: "http://localhost:3000",
    db: 'mongodb+srv://programm:myprogramm@cluster0.o3zxo.mongodb.net/agregator-db?retryWrites=true&w=majority'
  },

  production: {
    root: rootPath,
    app: {
      name: 'agregator'
    },
    services: {
      cars: 'https://car-service-l.herokuapp.com/',
      rental: 'http://localhost:3001',
      payment:'http://localhost:3003'
    },
    port: process.env.PORT || 3000,
    serverAddress: "http://localhost:3000",
    db: 'mongodb+srv://programm:myprogramm@cluster0.o3zxo.mongodb.net/agregator-db?retryWrites=true&w=majority'
  }
};

module.exports = config[env];