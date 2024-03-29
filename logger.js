const pino = require('pino');

const logLevel = process.env.PINO_LOG_LEVEL || 'debug';

console.log(`Logging level: ${logLevel}`); // eslint-disable-line no-console

module.exports = pino({
  level: logLevel,
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() };
    },
  },
});
