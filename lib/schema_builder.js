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


function buildTransforms(settings) {
  if (settings.prefix === null) {
    return []
  }
  return [
    new RenameRootFields((_, fieldName) => `${settings.prefix}_${fieldName}`),
    new RenameTypes((name) => `${settings.prefix}_${name}`),
  ]
}

function buildSubschemaConfigs(config) {
  return Object.entries(config.services).reduce((memo, [name, settings]) => {
    const subschema = buildSchema(readFileSync(__dirname, `../remote_schemas/${name}.schema.graphql`))
    memo[name] = {
      schema: subschema,
      executor: makeRemoteExecutor(settings.url, settings.key),
      batch: true,
      transforms: buildTransforms(settings)
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
      extend type SourceLogicTreeBranch {
        source_solution: SourceSolutionUnion
      }
      ## extend type Query {
      ##    TOSHI_node(id: ID!): Node
      ##    ##  K_node(id: ID!): Node
      ## }
    `,
    resolvers: {
      /*
          Any node queries are directed to Toshi subschema
          NB Kororaa currentyly has a node root field, but it's not used either deprecate or access.
      */
      Query: {
        node: {
          selectionSet: `{ id }`,
          resolve: (parent, args, context, info) => {
            console.log('DELEGATED resolve node', args.id)
            const res = delegateToSchema({
              schema: subschemasByName['toshi'],
              operation: "query",
              fieldName: "node",
              args: {
                id: args.id,
              },
              context,
              info,
            });
            return res
          }
        }
      },
      // /* explicit TOSHI_node queries */
      // Query: {
      //   TOSHI_node: {
      //     selectionSet: `{ id }`,
      //     resolve: (parent, args, context, info) => {
      //       console.log('DELEGATED resolve TOSHI_node', args.id)
      //       const res = delegateToSchema({
      //         schema: subschemasByName['toshi'],
      //         operation: "query",
      //         fieldName: "node",
      //         args: {
      //           id: args.id,
      //         },
      //         context,
      //         info,
      //       });
      //       return res
      //     }
      //   }
      // },
      /* source_solution is expanded by the toshi subscema */
      SourceLogicTreeBranch: {
        source_solution: {
          selectionSet: `{ inversion_solution_id }`, //
          resolve: (parent, args, context, info) => {
            // console.log('DELEGATED resolve source_solution', parent.inversion_solution_id, args)
            // console.log( context )
            // console.log( info )

            if (parent.inversion_solution_id === null)  return null

            const res = delegateToSchema({
              schema: subschemasByName['toshi'],
              operation: "query",
              fieldName: "node",
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
