const { graphql } = require('graphql');
const { addMocksToSchema, createMockStore } = require('@graphql-tools/mock');
const { printSchemaWithDirectives } = require('@graphql-tools/utils');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const { stitchingDirectives } = require('@graphql-tools/stitching-directives');
const { stitchingDirectivesValidator } = stitchingDirectives();
const { buildSubschemaConfigs, buildGatewaySchema } = require('../lib/schema_builder');

// Setup a mapping of test fixtures by service name
const fixturesByName = {
  toshi: require('./mock_services/toshi'),
  reviews: require('./mock_services/reviews'),
  users: require('./mock_services/users'),
};

// Get the actual subschemas built for the production app:
const subschemaConfigs = buildSubschemaConfigs();

// Reconfigure the subschema configurations for testing...
// makes all subschemas locally-executable,
// and sets them up with mocked fixture data to test with.
Object.entries(subschemaConfigs).forEach(([name, subschemaConfig]) => {
  const fixtures = fixturesByName[name] || {};

  if (name === 'toshi') {

    // CBC: toshi shema needs the mockStore setup, otherwise resolvers fail
    // still haven't got store resolvers reliably returning complete objects :(
    const schema = makeExecutableSchema({
      schemaTransforms: [stitchingDirectivesValidator],
      typeDefs: printSchemaWithDirectives(subschemaConfig.schema)
    });

    const store = createMockStore({ schema })
    //
    // store.set('ScaledInversionSolution', 'U2NhbGVkSW52ZXJzaW9uU29sdXRpb246MTE4NTQ2',
    //    { id:'U2NhbGVkSW52ZXJzaW9uU29sdXRpb246MTE4NTQ2', file_size: 300, file_name: "abc.zip"} )

    function resolve_node(id, ...rest) {
      // console.log('resolve_node', id)
      let n = store.get('ScaledInversionSolution', id)
      // console.log('found', n )
      // CBC: this works...
      n.file_size = 677
      n.file_name = 'holas'

      return n
    }

    subschemaConfig.schema = addMocksToSchema({
      schema,
      resolvers: store => {
        return {
          QueryRoot: {
            node: (_, { id }) => resolve_node(id)
          }
        }
      },
      mocks: {
        BigInt: () => 555e6,
        String: () => 'Goodness me',
      },
  })

  } else {

    // build all of the base schemas into locally-executable test schemas
    // apply mock service resolvers to give them some simple record fixtures
    const schema = makeExecutableSchema({
      schemaTransforms: [stitchingDirectivesValidator],
      typeDefs: printSchemaWithDirectives(subschemaConfig.schema),
      resolvers: fixtures.resolvers,
    });

    // apply mocks to fill in missing values
    // anything without a resolver or fixture data
    // gets filled in with a predictable service-specific scalar
    subschemaConfig.schema = addMocksToSchema({
      preserveResolvers: true,
      schema,
      mocks: {
        String: () => `${name}-value`,
        ...(fixtures.mocks || {}),
      }
    });

  }
  // remove all executors (run everything as a locally-executable schema)
  delete subschemaConfig.executor;
});

// Run the gateway builder using the mocked subservices
// this gives the complete stitched gateway talking to mocked services.
const mockedGateway = buildGatewaySchema(subschemaConfigs);

function queryMockedGateway(query, variables={}) {
  return graphql(mockedGateway, query, {}, variables);
}

module.exports = {
  queryMockedGateway
};
