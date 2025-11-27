// the gateway config built from enviropnment settings
module.exports = {
  config: {
    services: {
      kororaa: {
        url: process.env.NZSHM22_KORORAA_API_URL,
        key: process.env.NZSHM22_KORORAA_API_KEY,
        prefix: 'KORORAA',
      },
      solvis: {
        url: process.env.NZSHM22_SOLVIS_API_URL,
        key: process.env.NZSHM22_SOLVIS_API_KEY,
        prefix: 'SOLVIS',
      },
      hazard: {
        url: process.env.NZSHM22_HAZARD_API_URL,
        key: process.env.NZSHM22_HAZARD_API_KEY,
        prefix: 'HAZARD',
      },
    },
  },
};
