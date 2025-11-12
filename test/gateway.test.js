const { queryMockedGateway } = require('./test_helper');

// based on https://github.com/gmac/schema-stitching-handbook/tree/main/continuous-integration-testing

describe('gateway schema', () => {
  test('resolves Toshi node', async () => {
    const QUERY_0 = `query {
      TOSHI_node(id: "U2NhbGVkSW52ZXJzaW9uU29sdXRpb246MTE4NTQ2") {
        __typename
        ... on Node { id }
        ... on ScaledInversionSolution { file_name file_size file_url}
      }
    }`;
    const { errors, data } = await queryMockedGateway(QUERY_0);
    // console.log(errors)
    expect(errors).not.toBeDefined();
    // console.log(errors)
    expect(data).toBeDefined();

    expect(data).toEqual({
      TOSHI_node: {
        __typename: 'ScaledInversionSolution',
        id: 'U2NhbGVkSW52ZXJzaW9uU29sdXRpb246MTE4NTQ2',
        file_name: 'holas',
        file_size: 677,
        file_url: 'toshi-value',
      },
    });
  });

  test('resolves Kororaa about', async () => {
    const query = `query {
      KORORAA_about
    }`;
    const { errors, data } = await queryMockedGateway(query);
    expect(errors).not.toBeDefined();
    expect(data).toBeDefined();
    expect(data).toEqual({ KORORAA_about: 'kororaa-value' });
  });

  test('resolves SOLVIS about', async () => {
    const query = `query {
      SOLVIS_about
    }`;
    const { errors, data } = await queryMockedGateway(query);
    expect(errors).not.toBeDefined();
    expect(data).toBeDefined();
    expect(data).toEqual({ SOLVIS_about: 'solvis-value' });
  });

  test('resolves HAZARD about', async () => {
    const query = `query {
      HAZARD_about
    }`;
    const { errors, data } = await queryMockedGateway(query);
    expect(errors).not.toBeDefined();
    expect(data).toBeDefined();
    expect(data).toEqual({ HAZARD_about: 'hazard-value' });
  });
});
