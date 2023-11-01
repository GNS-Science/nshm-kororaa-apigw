const { queryMockedGateway } = require('./test_helper');

// based on https://github.com/gmac/schema-stitching-handbook/tree/main/continuous-integration-testing

describe('gateway schema', () => {
  test('resolves Toshi node', async () => {
    const QUERY_0 = `query {
      node(id: "U2NhbGVkSW52ZXJzaW9uU29sdXRpb246MTE4NTQ2") {
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
      node: {
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
      about
    }`;
    const { errors, data } = await queryMockedGateway(query);
    expect(errors).not.toBeDefined();
    expect(data).toBeDefined();
    expect(data).toEqual({ about: 'kororaa-value' });
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

  test('resolves SOLVIS about', async () => {
    const query = `query {
      SOLVIS_inversion_solution (
        filter:{
          solution_id:"U2NhbGVkSW52ZXJzaW9uU29sdXRpb246MTIwNzIy"
          location_ids: ["WLG", "LVN"]
          radius_km: 30
          minimum_mag:8.2
        }) {
        analysis {
          fault_sections_geojson
          solution_id
        }
      }
    }`;
    const { errors, data } = await queryMockedGateway(query);
    expect(errors).not.toBeDefined();
    expect(data).toBeDefined();
    expect(data.SOLVIS_inversion_solution).toBeDefined();
    expect(data.SOLVIS_inversion_solution.analysis).toBeDefined();
    expect(data.SOLVIS_inversion_solution.analysis.fault_sections_geojson).toEqual('JuicyJson');
  });

  test('resolves delegated field on KORORAA.nzshm_model', async () => {
    const query = /* GraphQL */ `
      query stitching_with_delegated_field {
        nzshm_model(version: "NSHM_1.0.0") {
          model {
            source_logic_tree {
              fault_system_branches {
                branches {
                  weight
                  source_solution {
                    __typename
                    ... on ScaledInversionSolution {
                      file_name
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;
    const { errors, data } = await queryMockedGateway(query);
    expect(errors).not.toBeDefined();
    expect(data).toBeDefined();
    expect(
      data.nzshm_model.model.source_logic_tree.fault_system_branches[0].branches[0].weight,
    ).toBeDefined();
    expect(
      data.nzshm_model.model.source_logic_tree.fault_system_branches[0].branches[0].source_solution,
    ).toBeDefined();
    expect(
      data.nzshm_model.model.source_logic_tree.fault_system_branches[0].branches[0].source_solution
        .__typename,
    ).toEqual('ScaledInversionSolution');
    // console.log(data.KORORAA_nzshm_model.model.source_logic_tree.fault_system_branches[0].branches[0].source_solution)
  });
});
