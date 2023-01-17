require('dotenv').config()
const serverless = require('serverless-http');
const express = require("express");
const { createYoga } = require('graphql-yoga');
const { buildSubschemaConfigs, buildGatewaySchema } = require('./lib/schema_builder');
const { config } = require('./gateway_config');

const subschemaConfigs = buildSubschemaConfigs(config);
const stitched_schema = buildGatewaySchema(subschemaConfigs);

const yoga = createYoga({
   schema: stitched_schema,
   // graphqlEndpoint: `/graphql`,
   graphiql: { endpoint: `/${process.env.DEPLOYMENT_STAGE}/graphql` },
   // landingPage: false
})

const app = express();

app.use('/graphql', yoga);
// app.use('/kororaa-app-api/graphql', yoga);

app.get('/', function (req, res) {

  res.send('Hello World!')

})

// app.listen(process.env.PORT || 4002, () => {
//   console.log("Server started!");
// });

module.exports.handler = serverless(app);