const { join } = require('node:path');
const { loadSchema } = require('@graphql-tools/load');
// const { GraphQLFileLoader } = require('@graphql-tools/graphql-file-loader');
const { addResolversToSchema } = require('@graphql-tools/schema');
const { createYoga } = require('graphql-yoga');
 
// const { loadSchema } = require('@graphql-tools/load');
const { UrlLoader } = require('@graphql-tools/url-loader');
const { createServer }  = require('http');
 


async function main() {
  const schema = await loadSchema('https://aihssdkef5.execute-api.ap-southeast-2.amazonaws.com/prod/graphql', {
    loaders: [new UrlLoader()],
    headers: {
      'X-API-KEY': '8o9XVIVrOh6J9qfp0hW3d3c1S7WyT2U69YzRtgIE'
    },
  });
 
  // Write some resolvers
  const resolvers = {}
 
  // Add resolvers to the schema
  const schemaWithResolvers = addResolversToSchema({ schema, resolvers })
 
  const yoga = createYoga({
    schema: schemaWithResolvers
  })
  const server = createServer(yoga)
 
  await server.listen(4001)
}
 
main().catch(error => console.error(error))

