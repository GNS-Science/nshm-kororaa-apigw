require('dotenv').config();
const { createYoga } = require('graphql-yoga');
const { buildSubschemaConfigs, buildGatewaySchema } = require('./lib/schema_builder');
const { config } = require('./gateway_config');
const logger = require('./logger');

const subschemaConfigs = buildSubschemaConfigs(config);
const stitchedSchema = buildGatewaySchema(subschemaConfigs);

const rootPath = `/${process.env.BASE_PATH}/graphql`; // must fit serverless.yml eg `/X/{any+}`

const yoga = createYoga({
  graphqlEndpoint: rootPath, // MUST MATCH path in serverlss.yml
  graphiql: {
    endpoint:
      process.env.IS_OFFLINE === 'true' ? `/${process.env.DEPLOYMENT_STAGE}${rootPath}` : rootPath,
  },
  landingPage: false,
  schema: stitchedSchema,
});

// Build a Fetch API request from an API Gateway REST (v1) proxy event.
function toRequestArgs(event) {
  const query = new URLSearchParams();
  for (const [key, values] of Object.entries(event.multiValueQueryStringParameters || {})) {
    for (const value of values) query.append(key, value);
  }

  const headers = new Headers();
  for (const [key, values] of Object.entries(event.multiValueHeaders || {})) {
    for (const value of values) headers.append(key, value);
  }

  const host = headers.get('host') || 'localhost';
  const body = event.body && event.isBase64Encoded ? Buffer.from(event.body, 'base64') : event.body;
  return [`https://${host}${event.path}?${query}`, { method: event.httpMethod, headers, body }];
}

module.exports.handler = async (event, lambdaContext) => {
  /** Immediate response for WarmUp plugin */
  if (event.source === 'serverless-plugin-warmup') {
    logger.info('WarmUp - Lambda is warm!');
    return 'Lambda is warm!';
  }

  try {
    const [url, init] = toRequestArgs(event);
    const response = await yoga.fetch(url, init, { event, lambdaContext });

    return {
      statusCode: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      body: await response.text(),
      isBase64Encoded: false,
    };
  } catch (err) {
    // Yoga turns GraphQL/backend errors into normal responses; this only catches crashes.
    logger.error({ err }, 'Unhandled error in handler');
    return {
      statusCode: 500,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ errors: [{ message: 'Internal server error' }] }),
      isBase64Encoded: false,
    };
  }
};
