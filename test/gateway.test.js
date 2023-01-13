const { queryMockedGateway } = require('./test_helper');

// based on https://github.com/gmac/schema-stitching-handbook/tree/main/continuous-integration-testing

describe('gateway schema', () => {
  test('resolves TOSHI_node', async () => {
    const TOSHI_QUERY_0 = `query {
      TOSHI_node(id: "U2NhbGVkSW52ZXJzaW9uU29sdXRpb246MTE4NTQ2") {
        __typename
        ... on TOSHI_Node { id }
        ... on TOSHI_ScaledInversionSolution { file_name file_size file_url}
      }
    }`;
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


  test('resolves delegated field on KORORAA', async () => {
    const query = /* GraphQL */ `
      query stitching_with_delegated_field {
        KORORAA_nzshm_model(version: "NSHM_1.0.0") {
          model {
            source_logic_tree {
              fault_system_branches {
                branches {
                  weight
                  source_solution {
                    __typename
                    ... on TOSHI_ScaledInversionSolution {
                      file_name
                    }
                  }
                }
              }
            }
          }
        }
      }`
    const { errors, data } = await queryMockedGateway(query);
    expect(errors).not.toBeDefined();
    expect(data).toBeDefined();
    expect(data.KORORAA_nzshm_model.model.source_logic_tree.fault_system_branches[0].branches[0].weight).toBeDefined()
    expect(data.KORORAA_nzshm_model.model.source_logic_tree.fault_system_branches[0].branches[0].source_solution).toBeDefined()
    expect(data.KORORAA_nzshm_model.model.source_logic_tree.fault_system_branches[0].branches[0].source_solution.__typename).toEqual('TOSHI_ScaledInversionSolution')
    // console.log(data.KORORAA_nzshm_model.model.source_logic_tree.fault_system_branches[0].branches[0].source_solution)
    })

});
