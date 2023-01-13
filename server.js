require('dotenv').config()
const express = require("express");
const { createYoga } = require('graphql-yoga');
const { buildSubschemaConfigs, buildGatewaySchema } = require('./lib/schema_builder');
const { config } = require('./gateway_config');

const subschemaConfigs = buildSubschemaConfigs(config);
const stitched_schema = buildGatewaySchema(subschemaConfigs);

const yoga = createYoga({
   schema: stitched_schema,
   graphiql: true,
})

const app = express();

app.use('/graphql', yoga);

app.listen(process.env.PORT || 4002, () => {
  console.log("Server started!");
});