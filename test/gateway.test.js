const { queryMockedGateway } = require('./test_helper');


describe('gateway schema', () => {

  const TOSHI_QUERY = `query {
    node(id: "U2NhbGVkSW52ZXJzaW9uU29sdXRpb246MTE4NTQ2") {
      __typename
      ... on Node { id }
      ... on ScaledInversionSolution { file_name }
    }
  }`;

// ... on Node {
      //   id
      // }
      // ... on ScaledInversionSolution {
      //   # __typename
      //   id
      //   meta {k v}
      //   file_name
      // }

  test.skip('resolves toshi node', async () => {
    const { data } = await queryMockedGateway(TOSHI_QUERY);

    expect(data).toEqual({ node: {
      // __typename: 'ScaledInversionSolution',
      id: 'U2NhbGVkSW52ZXJzaW9uU29sdXRpb246MTE4NTQ2',
      meta: [
        {
          k: 'scale',
          v: '0.28'
        },
        {
          k: 'polygon_scale',
          v: null
        },
        {
          k: 'polygon_max_mag',
          v: null
        },
        {
          k: 'model_type',
          v: 'SUBDUCTION'
        }
      ],
      file_name: 'NZSHM22_ScaledInversionSolution-QXV0b21hdGlvblRhc2s6MTExMDA0.zip'
    }
    });
  });

  const USER_QUERY = `{
    user(id: "1") {
      # id << must work without this selected
      name
      username
      reviews {
        # id << must work without this selected
        body
      }
    }
  }`;

  test('resolves users -> reviews', async () => {
    const { data } = await queryMockedGateway(USER_QUERY);

    expect(data).toEqual({
      user: {
        name: 'users-value',
        username: 'hansolo',
        reviews: [{
          body: 'great',
        }]
      }
    });
  });


  const REVIEW_QUERY = `{
    review(id: "1") {
      # id << must work without this selected
      body
      author {
        # id << must work without this selected
        name
        username
      }
    }
  }`;

  test('resolves review -> author', async () => {
    const { data } = await queryMockedGateway(REVIEW_QUERY);

    expect(data).toEqual({
      review: {
        body: 'great',
        author: {
          name: 'users-value',
          username: 'hansolo',
        },
      }
    });
  });



});
