//test gateway config
module.exports = {
  config: {
    "services": {
      "toshi": {
        "url": "http://localhost:4001/graphql",
        "key": "NADA",
        "prefix": null
      },
      "kororaa": {
        "url": "http://localhost:4002/graphql",
        "key": "nonce",
        "prefix": null
      }
    }
  }
}