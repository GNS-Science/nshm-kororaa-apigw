const { createMockStore } = require('@graphql-tools/mock');

function resolveNode(store, id) {
  const n = store.get('HOLE', id);
  n.file_size = 677;
  n.file_name = 'holas';
  return n;
}

function setupResolvers(schema) {
  const store = createMockStore({ schema });
  return () => {
    return {
      QueryRoot: {
        node: (_, { id }) => resolveNode(store, id),
      },
    };
  };
}

module.exports = {
  mocks: {
    BigInt: () => 555e6,
    // String: () => 'Goodness me',
  },
  resolvers: setupResolvers,
};
