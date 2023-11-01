const { fetch } = require('cross-fetch');
const { print } = require('graphql');
const logger = require('../logger');

module.exports = function makeRemoteExecutor(url, apiKey) {
  return async ({ document, variables }) => {
    const query = typeof document === 'string' ? document : print(document);

    logger.info(`fetching from url ${url}`);
    // console.log(document)
    logger.debug(`query: ${query}`);

    const fetchResult = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-KEY': apiKey },
      body: JSON.stringify({ query, variables }),
    });

    const jsondoc = await fetchResult.json();
    // console.log('RESULT')
    // console.log(jsondoc)

    return jsondoc;
  };
};
