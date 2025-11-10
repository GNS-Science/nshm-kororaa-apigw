const { graphql } = require('graphql');
const { addMocksToSchema } = require('@graphql-tools/mock');
const { printSchemaWithDirectives } = require('@graphql-tools/utils');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const { stitchingDirectives } = require('@graphql-tools/stitching-directives');
const { buildSubschemaConfigs, buildGatewaySchema } = require('../lib/schema_builder');
const { config } = require('./gateway_test_config');

const { stitchingDirectivesValidator } = stitchingDirectives();

// Setup a mapping of test fixtures by service name
const fixturesByName = {
  toshi: require('./mock_services/toshi'),
  kororaa: require('./mock_services/kororaa'),
  solvis: require('./mock_services/solvis'),
  hazard: require('./mock_services/hazard'),
};

// Get the subschemas with a test configuration:
const subschemaConfigs = buildSubschemaConfigs(config);

// Reconfigure the subschema configurations for testing...
// makes all subschemas locally-executable,
// and sets them up with mocked fixture data to test with.
Object.entries(subschemaConfigs).forEach(([name, subschemaConfig]) => {
  const fixtures = fixturesByName[name] || {};

  const schema = makeExecutableSchema({
    schemaTransforms: [stitchingDirectivesValidator],
    typeDefs: printSchemaWithDirectives(subschemaConfig.schema),
  });

  subschemaConfig.schema = addMocksToSchema({
    schema,
    resolvers: fixtures.resolvers(schema),
    mocks: {
      String: () => `${name}-value`,
      ...(fixtures.mocks || {}),
    },
  });

  // remove all executors (run everything as a locally-executable schema)
  delete subschemaConfig.executor;
});

// Run the gateway builder using the mocked subservices
// this gives the complete stitched gateway talking to mocked services.
const mockedGateway = buildGatewaySchema(subschemaConfigs);

function queryMockedGateway(query, variables = {}) {
    return graphql({ schema: mockedGateway, source: query, variables: variables });
}

module.exports = {
  queryMockedGateway,
};
