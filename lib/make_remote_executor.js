const { fetch } = require('cross-fetch');
const { print } = require('graphql');

module.exports = function makeRemoteExecutor(url, api_key) {
  return async ({ document, variables }) => {
    const query = typeof document === 'string' ? document : print(document);


    console.log('fetching from', url)
    // console.log(document)
    // console.log(query)

    const fetchResult = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-KEY': api_key },
      body: JSON.stringify({ query, variables }),
    });

    const jsondoc = await fetchResult.json()
    // console.log('RESULT')
    // console.log(jsondoc)

    return jsondoc
    return fetchResult.json();
  };
};
