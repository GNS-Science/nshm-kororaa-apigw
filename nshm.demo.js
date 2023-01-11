require('dotenv').config()
const express = require("express");
const { createYoga } = require('graphql-yoga');
const { print } = require("graphql");
const { rawRequest } = require("graphql-request");
const {
  wrapSchema,
  introspectSchema,
  RenameTypes,
  RenameRootFields,
} = require("@graphql-tools/wrap");
const { stitchSchemas, handleRelaySubschemas } = require("@graphql-tools/stitch");
const { delegateToSchema } = require("@graphql-tools/delegate");
const { makeExecutableSchema } = require('@graphql-tools/schema');

const TOSHI_API = process.env.NZSHM_TOSHI_GRAPHQL_ENDPOINT
const TOSHI_TOKEN = process.env.NZSHM_TOSHI_GRAPHQL_API_KEY;
const KORORAA_API = process.env.NZSHM_KORORAA_GRAPHQL_ENDPOINT;
const KORORAA_TOKEN = process.env.NZSHM_KORORAA_GRAPHQL_API_KEY;

// console.log(KORORAA_API)

const createRemoteSchema = async ({ url, headers, ...rest }) => {
  const executor = async ({ document, variables }) => {
    const query = typeof document === "string" ? document : print(document);
    // console.log('query', document, url)
    console.log('in executor')
    console.log('query:')
    console.log(query)
    const resp = await rawRequest(url, query, variables, headers);
    debugger;
    console.log('response:')
    console.log(resp)
    console.log(resp.data)

    return resp
  };

  const schema = wrapSchema({
    schema: await introspectSchema(executor),
    executor,
    ...rest,
  });

  return schema;
};


const localSchema = makeExecutableSchema({
  typeDefs: /* GraphQL */ `
    type Model {
      version: String
    }

    type Query {
      hello: String
      current_model: Model
    }
  `,
  resolvers: {
    Query: {
      hello: () => 'It\'s a Brave New World in Stitch land',
      current_model: () =>  {return { version: 'NSHM_1.0.0' }}
    }
  },
})

const stitched_schema = async () => {

  const localSubschema = { //apply transforms
    schema: localSchema,
    transforms: [
      new RenameRootFields((_, fieldName) => `NSHM_${fieldName}`),
      new RenameTypes((name) => `NSHM_${name}`),
    ],
  }

  const kororaaSchema = await createRemoteSchema({
      url: KORORAA_API,
      headers: {'X-API-KEY': KORORAA_TOKEN},
      transforms: [
        new RenameRootFields((_, fieldName) => `KORORAA_${fieldName}`),
        new RenameTypes((name) => `KORORAA_${name}`),
      ]
    });

  const toshiSchema =  await createRemoteSchema({
    url: TOSHI_API,
    headers: {'X-API-KEY': TOSHI_TOKEN},
    transforms: [
      new RenameRootFields((_, fieldName) => `TOSHI_${fieldName}`),
      new RenameTypes((name) => `TOSHI_${name}`),
      ],
    });

  // console.log('kororaaSchema', kororaaSchema)

  const schema = await stitchSchemas({
    // subschemas: handleRelaySubschemas(
    //   [kororaaSchema, toshiSchema], //, localSubschema],
    //   id => getTypeNameFromGlobalID(id)
    // ),
    subschemas: [kororaaSchema, toshiSchema, localSubschema],
    typeDefs: `
      extend type KORORAA_SourceLogicTreeBranch {
        source_solution: TOSHI_SourceSolutionUnion
      }
      extend type NSHM_Model{
        model: KORORAA_NzshmModelResult
      }
    `,
    resolvers: {

      NSHM_Model: {
        model:  {
          selectionSet: '{ version }',
          resolve: (parent, args, context, info) => {
            console.log('resolve', parent, parent.version, args)
            return delegateToSchema({
              schema: kororaaSchema,
              operation: "query",
              fieldName: "KORORAA_nzshm_model",
              args: {
                version: parent.version,
              },
              context,
              info,
            });
          },
        }
      },

      KORORAA_SourceLogicTreeBranch: {
        source_solution: {
          selectionSet: `{ inversion_solution_id }`, //
          resolve: (parent, args, context, info) => {
            console.log('resolve', parent.inversion_solution_id, args)
            // console.log( context )
            // console.log( info )

            if (parent.inversion_solution_id === null)  return null

            return delegateToSchema({
              schema: toshiSchema,
              operation: "query",
              fieldName: "TOSHI_node",
              args: {
                  id: parent.inversion_solution_id,
              },
              context,
              info,
            });
          },
        },
      },
    }, //resolvers
  });

  return schema
}

const yoga = createYoga({
   schema: stitched_schema,
   graphiql: true,
})

const app = express();

app.use('/graphql', yoga);

app.listen(process.env.PORT || 4002, () => {
  console.log("Server started!");
});