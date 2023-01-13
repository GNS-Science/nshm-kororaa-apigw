// the gateway config built from enviropnment settings
module.exports = {
  config: {
    "services": {
      "toshi": {
        "url": process.env.NZSHM_TOSHI_GRAPHQL_ENDPOINT,
        "key": process.env.NZSHM_TOSHI_GRAPHQL_API_KEY,
        "prefix": "TOSHI"
      },
      "kororaa": {
        "url": process.env.NZSHM_KORORAA_GRAPHQL_ENDPOINT,
        "key": process.env.NZSHM_KORORAA_GRAPHQL_API_KEY,
        "prefix": "KORORAA"
      }
    }
  }
}