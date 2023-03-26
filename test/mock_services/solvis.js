const { createMockStore } = require('@graphql-tools/mock');

function resolve_node(store, id, ...rest) {
  let n = store.get('FilterInversionSolution', id)
  n.file_size = 677
  n.file_name = 'holas'
  return n
}

function setupResolvers(schema) {
  const store = createMockStore({ schema })
  return store => {
        return {
          QueryRoot: {
            node: (_, { id }) => resolve_node(store, id),
          }
        }
      }
}

module.exports = {
    mocks:{
        BigInt: () => 555e6,
        // String: () => 'Goodness me',
        JSONString: () => "JuicyJson"
      },
    resolvers: setupResolvers
}
