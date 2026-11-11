// Local smoke test: runs the real Lambda handler (yoga behind API Gateway)
// with a fake API Gateway event. Sub-service HTTP calls are answered by mocked schemas.

const mockServices = {
  kororaa: 'http://kororaa.test/graphql',
  solvis: 'http://solvis.test/graphql',
  hazard: 'http://hazard.test/graphql',
};

process.env.BASE_PATH = 'kororaa-app-api';
process.env.NZSHM22_KORORAA_API_URL = mockServices.kororaa;
process.env.NZSHM22_SOLVIS_API_URL = mockServices.solvis;
process.env.NZSHM22_HAZARD_API_URL = mockServices.hazard;
process.env.PINO_LOG_LEVEL = 'silent';

jest.mock('cross-fetch', () => {
  const { buildSchema, graphql } = require('graphql');
  const { addMocksToSchema } = require('@graphql-tools/mock');
  const readFileSync = require('../lib/read_file_sync');

  const schemasByUrl = {};
  for (const [name, url] of Object.entries(mockServices)) {
    const schema = buildSchema(readFileSync(__dirname, `../remote_schemas/${name}.schema.graphql`));
    schemasByUrl[url] = addMocksToSchema({ schema, mocks: { String: () => `${name}-value` } });
  }

  return {
    fetch: async (url, { body }) => {
      const { query, variables } = JSON.parse(body);
      const result = await graphql({
        schema: schemasByUrl[url],
        source: query,
        variableValues: variables,
      });
      return { json: async () => JSON.parse(JSON.stringify(result)) };
    },
  };
});

const { handler } = require('../handler');

function apiGatewayEvent(
  query,
  { method = 'POST', path = `/${process.env.BASE_PATH}/graphql` } = {},
) {
  const headers = { 'content-type': 'application/json', accept: 'application/json' };
  const isGet = method === 'GET';
  return {
    resource: '/{any+}',
    path,
    httpMethod: method,
    headers,
    multiValueHeaders: Object.fromEntries(Object.entries(headers).map(([k, v]) => [k, [v]])),
    queryStringParameters: isGet ? { query } : null,
    multiValueQueryStringParameters: isGet ? { query: [query] } : null,
    pathParameters: { any: 'graphql' },
    requestContext: { stage: 'test', httpMethod: 'POST', identity: {} },
    body: isGet ? null : JSON.stringify({ query }),
    isBase64Encoded: false,
  };
}

describe('lambda handler', () => {
  test('answers warmup events', async () => {
    expect(await handler({ source: 'serverless-plugin-warmup' }, {})).toBe('Lambda is warm!');
  });

  test('serves the smoke test query', async () => {
    const response = await handler(
      apiGatewayEvent('query Query{KORORAA_about SOLVIS_about HAZARD_about}'),
      { callbackWaitsForEmptyEventLoop: false },
    );
    expect(response).toBeDefined();
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual({
      data: {
        KORORAA_about: 'kororaa-value',
        SOLVIS_about: 'solvis-value',
        HAZARD_about: 'hazard-value',
      },
    });
  });

  test('serves GET queries from the query string', async () => {
    const response = await handler(apiGatewayEvent('{KORORAA_about}', { method: 'GET' }), {});
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual({ data: { KORORAA_about: 'kororaa-value' } });
  });

  test('returns 404 outside the graphql endpoint', async () => {
    const response = await handler(apiGatewayEvent('{KORORAA_about}', { path: '/nope' }), {});
    expect(response.statusCode).toBe(404);
  });

  test('returns 500 and logs when yoga crashes', async () => {
    const logger = require('../logger');
    const yoga = require('graphql-yoga');
    const errorSpy = jest.spyOn(logger, 'error').mockImplementation(() => {});
    let isolatedHandler;
    jest.isolateModules(() => {
      jest.doMock('graphql-yoga', () => ({
        ...yoga,
        createYoga: () => ({
          fetch: async () => {
            throw new Error('boom');
          },
        }),
      }));
      jest.doMock('../logger', () => logger);
      isolatedHandler = require('../handler').handler;
    });

    const response = await isolatedHandler(apiGatewayEvent('{KORORAA_about}'), {});
    expect(response.statusCode).toBe(500);
    expect(JSON.parse(response.body)).toEqual({ errors: [{ message: 'Internal server error' }] });
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});
