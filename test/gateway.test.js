const { queryMockedGateway } = require('./test_helper');

// based on https://github.com/gmac/schema-stitching-handbook/tree/main/continuous-integration-testing

describe('gateway schema', () => {
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
