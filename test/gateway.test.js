const { queryMockedGateway } = require('./test_helper');

// based on https://github.com/gmac/schema-stitching-handbook/tree/main/continuous-integration-testing

describe('gateway schema', () => {

  const TOSHI_QUERY_0 = `query {
    TOSHI_node(id: "U2NhbGVkSW52ZXJzaW9uU29sdXRpb246MTE4NTQ2") {
      __typename
      ... on TOSHI_Node { id }
      ... on TOSHI_ScaledInversionSolution { file_name file_size file_url}
    }
  }`;

  test('resolves TOSHI_node', async () => {
    const { data } = await queryMockedGateway(TOSHI_QUERY_0);

    expect(data).toEqual({ TOSHI_node: {
      __typename: 'TOSHI_ScaledInversionSolution',
      id: 'U2NhbGVkSW52ZXJzaW9uU29sdXRpb246MTE4NTQ2',
      file_name: 'holas',
      file_size: 677,
      file_url: "toshi-value"
    }
    });
  });

  test('resolves KORORAA_about', async () => {

    const query = `query {
      KORORAA_about
    }`;
    const { errors, data } = await queryMockedGateway(query);
    expect(errors).not.toBeDefined();
    expect(data).toBeDefined();

    expect(data).toEqual({ KORORAA_about: "kororaa-value" })
  });

});
