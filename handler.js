require('dotenv').config()
const { configure } = require('@vendia/serverless-express')
const { createYoga } = require('graphql-yoga');
const { buildSubschemaConfigs, buildGatewaySchema } = require('./lib/schema_builder');
const { config } = require('./gateway_config');
const express = require('express');
const serverlessExpress = require('@vendia/serverless-express');
const logger = require('./logger');

const subschemaConfigs = buildSubschemaConfigs(config);
const stitchedSchema = buildGatewaySchema(subschemaConfigs);

const rootPath = `/${process.env.BASE_PATH}/graphql` // must fit serverless.yml eg `/X/{any+}`

const yoga = createYoga({
  graphqlEndpoint: rootPath, // MUST MATCH path in serverlss.yml
  graphiql: {
    endpoint:
      process.env.IS_OFFLINE === 'true' ? `/${process.env.DEPLOYMENT_STAGE}${rootPath}` : rootPath,
  },
  landingPage: false,
  schema: stitchedSchema,
});

const app = express()
  // .use(cors())
  .use(`/${process.env.BASE_PATH}/graphql`, yoga);

const serverlessExpressHandler = serverlessExpress({
  app,
  log: logger,
});

module.exports.handler = async (event, context) => {
  /** Immediate response for WarmUp plugin */
  if (event.source === 'serverless-plugin-warmup') {
    logger.info('WarmUp - Lambda is warm!');
    return 'Lambda is warm!';
  }

  // ... function logic
  return serverlessExpressHandler(event, context);
};