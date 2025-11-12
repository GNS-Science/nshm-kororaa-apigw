const { buildSchema } = require('graphql');
const { stitchSchemas, handleRelaySubschemas } = require('@graphql-tools/stitch');
const { stitchingDirectives } = require('@graphql-tools/stitching-directives');

const makeRemoteExecutor = require('./make_remote_executor');
const readFileSync = require('./read_file_sync');
const { FilterRootFields, RenameRootFields } = require('@graphql-tools/wrap');
const { pruneSchema } = require('@graphql-tools/utils');

const { stitchingDirectivesTransformer } = stitchingDirectives();
const logger = require('../logger');

function buildTransforms(schemaName, settings) {
  let transforms = [];
  // Apply prefixing transforms
  if (settings.prefix) {
    logger.debug(`prefix schema: ${schemaName}`);
    transforms = transforms.concat([
      new RenameRootFields((_, fieldName) => `${settings.prefix}_${fieldName}`),
    ]);
  }

  // delete old kororaa hazard resolvers ()
  const hazardResolvers = [
    'KORORAA_gridded_location',
    'KORORAA_hazard_curves',
    'KORORAA_gridded_hazard',
  ];
  transforms = transforms.concat([
    new FilterRootFields((operation, fieldName) => {
      const exclude =
        (schemaName === 'kororaa') &
        (operation === 'Query') &
        (hazardResolvers.includes(fieldName) === true);
      if (hazardResolvers.includes(fieldName) === true) {
        logger.debug(
          `schema: ${schemaName} exclude: ${exclude} FilterRootFields() ${operation} ${fieldName}`,
        );
      }
      return !exclude;
    }),
  ]);

  // delete mutations field from all schema
  transforms = transforms.concat([
    new FilterRootFields((operation) => {
      const exclude = operation === 'Mutation';
      // logger.debug(
      //   `schema: ${schemaName} exclude: ${exclude} FilterRootFields() ${operation} ${fieldName}`,
      // );
      return !exclude;
    }),
  ]);

  return transforms;
}

function buildSubschemaConfigs(config) {
  return Object.entries(config.services).reduce((memo, [name, settings]) => {
    const subschema = buildSchema(
      readFileSync(__dirname, `../remote_schemas/${name}.schema.graphql`),
    );
    memo[name] = {
      schema: subschema,
      executor: makeRemoteExecutor(settings.url, settings.key),
      batch: true,
      transforms: buildTransforms(name, settings),
    };
    return memo;
  }, {});
}

function getTypeNameFromGlobalID(id) {
  return atob(id).split(':')[0];
}

function buildGatewaySchema(subschemasByName) {
  return pruneSchema(
    stitchSchemas({
      subschemaConfigTransforms: [stitchingDirectivesTransformer],
      subschemas: handleRelaySubschemas(Object.values(subschemasByName), (id) =>
        getTypeNameFromGlobalID(id),
      ),
      // Schema Extensions
      typeDefs: ``,
      resolvers: {}, // end resolvers
    }),
  );
}

module.exports = {
  buildSubschemaConfigs,
  buildGatewaySchema,
};
