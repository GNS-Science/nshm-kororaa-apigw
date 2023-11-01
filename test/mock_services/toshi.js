// const nodes = [
//   { __typename: 'ScaledInversionSolution',
//     id: 'U2NhbGVkSW52ZXJzaW9uU29sdXRpb246MTE4NTQ2',
//     meta: [
//         {
//           k: 'scale',
//           v: '0.28'
//         },
//         {
//           k: 'polygon_scale',
//           v: null
//         },
//         {
//           k: 'polygon_max_mag',
//           v: null
//         },
//         {
//           k: 'model_type',
//           v: 'SUBDUCTION'
//         }
//       ],
//       file_name: 'NZSHM22_ScaledInversionSolution-QXV0b21hdGlvblRhc2s6MTExMDA0.zip',
//       file_size: 235e6

//   },
//   { id: '2', name: 'widget' },
// ]

// function resolve_node(id, ...rest) {
//   console.log('resolve_node', id)
//   let n = nodes.find(n => n.id === id)
//   console.log('found', n)
//   return n
// }

// module.exports = {
//   resolvers: {
//     QueryRoot: {
//       node: (_, { id }) => resolve_node(id)
//     }
//   },
//   mocks: {
//     Int: () => 23,
//     // BigInt: () => 2355e6,
//     // ScaledInversionSolution: () => nodes[0],
//     //Node: (...rest) => (console.log(rest))
//   }
// };
const { createMockStore } = require('@graphql-tools/mock');

//
// store.set('ScaledInversionSolution', 'U2NhbGVkSW52ZXJzaW9uU29sdXRpb246MTE4NTQ2',
//    { id:'U2NhbGVkSW52ZXJzaW9uU29sdXRpb246MTE4NTQ2', file_size: 300, file_name: "abc.zip"} )

function resolveNode(store, id) {
  // console.log('toshi.resolveNode', id)
  const n = store.get('ScaledInversionSolution', id);
  // console.log('found', n )
  // CBC: this works...
  n.file_size = 677;
  n.file_name = 'holas';
  return n;
}

function setupResolvers(schema) {
  const store = createMockStore({ schema });
  store.set('ScaledInversionSolution', 'U2NhbGVkSW52ZXJzaW9uU29sdXRpb246MTE4NTQ2',
    { id:'U2NhbGVkSW52ZXJzaW9uU29sdXRpb246MTE4NTQ2', file_size: 300, file_name: 'abc.zip'} )

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
