const { buildSchema } = require('graphql');
const { stitchSchemas } = require('@graphql-tools/stitch');
const { delegateToSchema } = require("@graphql-tools/delegate");
const { stitchingDirectives } = require('@graphql-tools/stitching-directives');
const { stitchingDirectivesTransformer } = stitchingDirectives();
const makeRemoteExecutor = require('./make_remote_executor');
const readFileSync = require('./read_file_sync');
const {
  RenameTypes,
  RenameRootFields,
} = require("@graphql-tools/wrap");


function buildSubschemaConfigs(config) {
  return Object.entries(config.services).reduce((memo, [name, settings]) => {
    const subschema = buildSchema(readFileSync(__dirname, `../remote_schemas/${name}.schema.graphql`))
    memo[name] = {
      schema: subschema,
      executor: makeRemoteExecutor(settings.url, settings.key),
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

    //Schema Extensions
    typeDefs: `
      extend type KORORAA_SourceLogicTreeBranch {
        source_solution: TOSHI_SourceSolutionUnion
      }
    `,
    resolvers: {
      KORORAA_SourceLogicTreeBranch: {
        source_solution: {
          selectionSet: `{ inversion_solution_id }`, //
          resolve: (parent, args, context, info) => {
            // console.log('DELEGATED resolve', parent.inversion_solution_id, args)
            // console.log( context )
            // console.log( info )

            if (parent.inversion_solution_id === null)  return null

            const res = delegateToSchema({
              schema: subschemasByName['toshi'],
              operation: "query",
              fieldName: "TOSHI_node",
              args: {
                  id: parent.inversion_solution_id,
              },
              context,
              info,
            });
            return res
          },
        },
      },
    }, //resolvers

  });
}

module.exports = {
  buildSubschemaConfigs,
  buildGatewaySchema,
};
