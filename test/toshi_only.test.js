const { addMocksToSchema, createMockStore } = require('@graphql-tools/mock');
const readFileSync = require('../lib/read_file_sync.js');
const { graphql, buildSchema } = require('graphql');

const SCHEMA_PATH = '../remote_schemas/toshi.schema.graphql';

async function setStore(store) {
  await store.set('ScaledInversionSolution', 'U2NhbGVkSW52ZXJzaW9uU29sdXRpb246MTE4NTQ2', {
    file_name: 'abc.zip',
  });
}

describe('toshi mocked store', () => {
  const schema = buildSchema(readFileSync(__dirname, SCHEMA_PATH));
  const store = createMockStore({ schema });
  // const schemaWithMocks = addMocksToSchema({ schema, store })
  setStore(store);

  test('mocked object returns id', async () => {
    expect(
      store.get('ScaledInversionSolution', 'U2NhbGVkSW52ZXJzaW9uU29sdXRpb246MTE4NTQ2', 'id'),
    ).toEqual('U2NhbGVkSW52ZXJzaW9uU29sdXRpb246MTE4NTQ2');
  });

  test('mocked object returns valid typename', async () => {
    expect(
      store.get('ScaledInversionSolution', 'U2NhbGVkSW52ZXJzaW9uU29sdXRpb246MTE4NTQ2'),
    ).toEqual({
      $ref: {
        key: 'U2NhbGVkSW52ZXJzaW9uU29sdXRpb246MTE4NTQ2',
        typeName: 'ScaledInversionSolution',
      },
    });
  });

  test('returns ref from object', async () => {
    const nodeRef = {
      $ref: {
        key: 'U2NhbGVkSW52ZXJzaW9uU29sdXRpb246MTE4NTQ2',
        typeName: 'ScaledInversionSolution',
      },
    };
    expect(
      store.get('ScaledInversionSolution', { id: 'U2NhbGVkSW52ZXJzaW9uU29sdXRpb246MTE4NTQ2' }),
    ).toEqual(nodeRef);
  });

  test('knows the schema types', async () => {
    expect(() => store.get('HUH', 'U2NhbGVkSW52ZXJzaW9uU29sdXRpb246MTE4NTQ2', 'id')).toThrow(
      'HUH does not exist on schema or is not an object or interface',
    );
  });

  test('mocked store async field example', async () => {
    const getName = () => Promise.resolve('myfile.zip');
    const res = await store.get({
      typeName: 'ScaledInversionSolution',
      key: 'U2NhbGVkSW52ZXJzaW9uU29sdXRpb246MTE4NTQW',
      fieldName: 'file_name',
      defaultValue: await getName(),
    });
    expect(res).toEqual('myfile.zip');
  });

  test('mocked store returns mocked Node object', async () => {
    expect(store.get('Node', 'U2NhbGVkSW52ZXJzaW9uU29sdXRpb246MTE4NTQ2', 'id')).toEqual(
      'U2NhbGVkSW52ZXJzaW9uU29sdXRpb246MTE4NTQ2',
    );
    expect(
      store.get('ScaledInversionSolution', 'U2NhbGVkSW52ZXJzaW9uU29sdXRpb246MTE4NTQ2', 'id'),
    ).toEqual('U2NhbGVkSW52ZXJzaW9uU29sdXRpb246MTE4NTQ2');
    expect(
      store.get('ScaledInversionSolution', 'U2NhbGVkSW52ZXJzaW9uU29sdXRpb246MTE4NTQ2', 'file_name'),
    ).toEqual('abc.zip');
  });
});

describe('toshi with custom mocks', () => {
  const schema = buildSchema(readFileSync(__dirname, SCHEMA_PATH));
  const store = createMockStore({ schema });
  setStore(store);

  const schemaWithMocks = addMocksToSchema({
    schema,
    resolvers: () => {
      // const getName = () => Promise.resolve('Vlad')
      return {
        QueryRoot: {
          node: (_, { id }) => store.get('ScaledInversionSolution', id),
          nodes: () => ({
            SearchResultConnection: {
              edges: [
                {
                  SearchResultEdge: {
                    node: {
                      typeName: 'ScaledInversionSolution',
                      key: 'U2NhbGVkSW52ZXJzaW9uU29sdXRpb246MTE4NTQW',
                      fieldName: 'file_name',
                    },
                  },
                },
              ],
            },
          }),
        },
      };
    },
    mocks: {
      BigInt: () => 235e6,
      String: () => 'Goodness me',
    },
  });

  test('mocked store via query with our Node object', async () => {
    const query = /* GraphQL */ `
      query NodeQuery {
        node(id: "1") {
          __typename
          ... on ScaledInversionSolution {
            file_name
            file_size
            file_url
          }
        }
      }
    `;
    const { data, errors } = await graphql({
      schema: schemaWithMocks,
      source: query,
    });

    // console.log(data)
    expect(errors).not.toBeDefined();
    expect(data).toBeDefined();
    // expect(data['node']['result']['edges'][0]).toEqual("ABC");
    expect(data.node.file_name).toEqual('Goodness me');
  });

  test('nodes query (List) ', async () => {
    const query = /* GraphQL */ `
      query NodesQuery {
        nodes(id_in: ["U2NhbGVkSW52ZXJzaW9uU29sdXRpb246MTE4NTQ2"]) {
          result {
            edges {
              node {
                ... on Node {
                  id
                }
                __typename
                ... on ScaledInversionSolution {
                  file_name
                  file_size
                  file_url
                }
              }
            }
          }
        }
      }
    `;

    const { data, errors } = await graphql({
      schema: schemaWithMocks,
      source: query,
    });

    // console.log(data.nodes.result.edges[0])
    expect(errors).not.toBeDefined();
    expect(data).toBeDefined();
    // expect(data.nodes.result.edges[0].node).toEqual({"__typename": "InversionSolution", "id": "1aa95aeb-1b02-40ac-9dd5-f43b10415672"});
  });
});

describe('toshi with custom mocks 2', () => {
  const schema = buildSchema(readFileSync(__dirname, SCHEMA_PATH));
  const store = createMockStore({ schema });
  setStore(store);

  const schemaWithMocks = addMocksToSchema({
    schema,
    resolvers: () => {
      return {
        QueryRoot: {
          node: (_, { id }) => store.get('ScaledInversionSolution', id),
        },
      };
    },
    mocks: {
      BigInt: () => 235e6,
      String: () => 'stringish field value',
    },
  });

  test('resolves toshi node', async () => {
    const TOSHI_QUERY = `query {
      node(id: "U2NhbGVkSW52ZXJzaW9uU29sdXRpb246MTE4NTQ2") {
        __typename
        ... on Node { id }
        ... on ScaledInversionSolution { file_name }
      }
    }`;

    const { data, errors } = await graphql({
      schema: schemaWithMocks,
      source: TOSHI_QUERY,
    });

    // console.log(data.node)
    expect(errors).not.toBeDefined();
    expect(data).toBeDefined();
    expect(data).toEqual({
      node: {
        __typename: 'ScaledInversionSolution',
        id: 'U2NhbGVkSW52ZXJzaW9uU29sdXRpb246MTE4NTQ2',
        file_name: 'stringish field value',
      },
    });
  });
});
