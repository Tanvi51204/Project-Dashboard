const { Sequelize } = require('sequelize');

// Create a new Sequelize instance
const sequelize = new Sequelize('Authentication', 'postgres', '1234', {
  host: 'localhost',
  dialect: 'postgres',
  logging: false, // Disable logging; default: console.log
});

// Test the connection
sequelize.authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

module.exports = sequelize;
