const { buildSchema } = require('graphql');
const { stitchSchemas, handleRelaySubschemas } = require('@graphql-tools/stitch');
const { delegateToSchema } = require('@graphql-tools/delegate');
const { stitchingDirectives } = require('@graphql-tools/stitching-directives');

const makeRemoteExecutor = require('./make_remote_executor');
const readFileSync = require('./read_file_sync');
const { FilterRootFields, RenameRootFields } = require('@graphql-tools/wrap');
const { pruneSchema } = require('@graphql-tools/utils');

const { stitchingDirectivesTransformer } = stitchingDirectives();
const logger = require('../logger');

function buildTransforms(schemaName, settings) {

  let transforms = [];
  // Apply prefixing transforms (TODO this shouldn't be needed)
  if (settings.prefix) {
    logger.debug(`prefix schema: ${schemaName}`);
    transforms = transforms.concat([
      new RenameRootFields((_, fieldName) => `${settings.prefix}_${fieldName}`),
    ]);
  }

  // delete mutations field from all schema
  transforms = transforms.concat([
    new FilterRootFields((operation, fieldName) => {
      const exclude = operation === 'Mutation';
      logger.debug(
        `schema: ${schemaName} exclude: ${exclude} FilterRootFields() ${operation} ${fieldName}`,
      );
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
      typeDefs: `
        extend type SourceLogicTreeBranch {
          source_solution: SourceSolutionUnion
        }
      `,
      resolvers: {
        /* source_solution is expanded by the toshi subscema */
        SourceLogicTreeBranch: {
          source_solution: {
            selectionSet: '{ inversion_solution_id }',
            resolve: (parent, args, context, info) => {
              // console.log('DELEGATED resolve source_solution', parent.inversion_solution_id, args)
              // console.log( context )
              // console.log( info )

              if (parent.inversion_solution_id === null) return null;

              const res = delegateToSchema({
                schema: subschemasByName.toshi,
                operation: 'query',
                fieldName: 'node',
                args: {
                  id: parent.inversion_solution_id,
                },
                context,
                info,
              });
              return res;
            },
          },
        },
      }, // end resolvers
    }),
  );
}

module.exports = {
  buildSubschemaConfigs,
  buildGatewaySchema,
};
