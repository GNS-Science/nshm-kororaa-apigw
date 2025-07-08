module.exports = {
  config: {
    services: {
      toshi: {
        url: 'http://localhost:4001/graphql',
        key: 'NADA',
        prefix: 'TOSHI',
      },
      kororaa: {
        url: 'http://localhost:4002/graphql',
        key: 'nonce',
        prefix: 'KORORAA',
      },
      solvis: {
        url: 'http://localhost:4003/graphql',
        key: 'scones',
        prefix: 'SOLVIS',
      },
      hazard: {
        url: 'http://localhost:4004/graphql',
        key: 'Noob',
        prefix: 'HAZARD',
      },
    },
  },
};
