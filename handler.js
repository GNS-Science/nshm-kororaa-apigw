require('dotenv').config()
const { configure } = require('@vendia/serverless-express')
const { createYoga } = require('graphql-yoga');
const { buildSubschemaConfigs, buildGatewaySchema } = require('./lib/schema_builder');

const { config } = require('./gateway_config');

const subschemaConfigs = buildSubschemaConfigs(config);
const stitched_schema = buildGatewaySchema(subschemaConfigs);

const rootPath = `/${process.env.BASE_PATH}/graphql` // must fit serverless.yml eg `/X/{any+}`

// const graphqlEndpoint = (process.env.IS_OFFLINE === "true" ? `/${process.env.DEPLOYMENT_STAGE}${rootPath}`  :  rootPath)

// console.log('graphqlEndpoint', graphqlEndpoint)

const app = createYoga({
  graphiql: true,
  graphqlEndpoint: rootPath, // MUST MATCH path in serverlss.yml
  graphiql: { endpoint: (process.env.IS_OFFLINE === "true" ? `/${process.env.DEPLOYMENT_STAGE}${rootPath}`  :  rootPath)},
  landingPage: false,
  schema: stitched_schema,
})

module.exports.handler = configure({
  app,
  log: app.logger,
})