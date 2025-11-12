module.exports = {
  config: {
    services: {
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
