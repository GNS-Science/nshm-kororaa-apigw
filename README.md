[![Build Status](https://github.com/gns-science/nshm-kororaa-api/actions/workflows/ci-test.yaml/badge.svg)](https://github.com/gns-science/nshm-kororaa-api/actions/workflows/ci-test.yaml)
[![codecov](https://codecov.io/gh/gns-science/nshm-kororaa-api/branch/main/graphs/badge.svg)](https://codecov.io/github/gns-science/nshm-kororaa-api)

# nshm-kororaa-api

A stitched graphql API for Kororaa.

## TESTING

```
yarn install
yarn test
```

### Test details and coverage report

```
yarn test -- --verbose --coverage
```

### Run service locally

`yarn sls offline`

then browse to http://localhost:4100/dev/kororaa-app-api/graphql

## Upgrade GraphQL APIs

When any one of the child APIs change, use `get-graphql-schema` to pull in the new schema. For example:

```
 yarn get-graphql-schema -h "x-api-key={API-key}" {API-URL} > .\remote_schemas\kororaa.schema.graphql
```
