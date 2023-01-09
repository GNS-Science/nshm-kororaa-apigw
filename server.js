const express = require('express');
const { createYoga } = require('graphql-yoga');
const { makeExecutableSchema } = require('@graphql-tools/schema');

const schema = makeExecutableSchema({
  typeDefs: /* GraphQL */ `
    type Query {
      hello: String
    }
  `,
  resolvers: {
    Query: {
      hello: () => 'Beautiful World'
    }
  }
})


const app = express();

const yoga = createYoga({
   schema,
   // context: (req) => ({ // Context factory gets called for every request
   //    myToken: req.headers.get('authorization'),
   // }),
   graphiql: true,
})

app.use('/graphql', yoga);
app.listen(4000);

console.log('Running a GraphQL API server at http://localhost:4000/graphql');