const { buildSchema } = require('graphql');
const { stitchSchemas } = require('@graphql-tools/stitch');
const { stitchingDirectives } = require('@graphql-tools/stitching-directives');
const { stitchingDirectivesTransformer } = stitchingDirectives();
const makeRemoteExecutor = require('./make_remote_executor');
const readFileSync = require('./read_file_sync');
const config = require('../config.json');
const {
  wrapSchema,
  // introspectSchema,
  RenameTypes,
  RenameRootFields,
} = require("@graphql-tools/wrap");

function buildSubschemaConfigs() {
  return Object.entries(config.services).reduce((memo, [name, settings]) => {

    const subschema = buildSchema(readFileSync(__dirname, `../remote_schemas/${name}.schema.graphql`))

    memo[name] = {
      schema: subschema,
      executor: makeRemoteExecutor(settings.url),
      batch: true,
      transforms: [
        new RenameRootFields((_, fieldName) => `${settings.prefix}_${fieldName}`),
        new RenameTypes((name) => `${settings.prefix}_${name}`),
      ]
    }

    return memo;
  }, {});
}

function buildGatewaySchema(subschemasByName) {
  return stitchSchemas({
    subschemaConfigTransforms: [stitchingDirectivesTransformer],
    subschemas: Object.values(subschemasByName),
  });
}

module.exports = {
  buildSubschemaConfigs,
  buildGatewaySchema,
};
