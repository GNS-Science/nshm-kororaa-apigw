const { configure } = require('@vendia/serverless-express')
const { createYoga } = require('graphql-yoga');
const { buildSubschemaConfigs, buildGatewaySchema } = require('./lib/schema_builder');

const { config } = require('./gateway_config');

const subschemaConfigs = buildSubschemaConfigs(config);
const stitched_schema = buildGatewaySchema(subschemaConfigs);

const app = createYoga({
  graphiql: true,
  graphqlEndpoint: `/kororaa-app-api/graphql`,
  graphiql: { endpoint: `kororaa-app-api/graphql` },
  // landingPage: false,
  schema: stitched_schema,
})

module.exports.handler = configure({
  app,
  log: app.logger,
})