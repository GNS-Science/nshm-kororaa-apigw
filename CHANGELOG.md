# Changelog

## [0.2.1] - TBD

### Changed

- Update `solvis` schema to latest version 0.9.2
- Update `toshi` schema to latest version 0.3.2
- Update `kororaa` schema to latest version 0.10.0
- Update `hazard` schema to latest version 0.3.0
- Upgrade serverless to v4
- Upgrade to yarn2
- ci-test workflow now uses yarn
- deps: configure yarn 7-day `npmMinimalAgeGate` with NSHM pre-approved packages
- deps: major: eslint/@eslint/js 9→10, globals 16→17, dotenv 17→18, graphql-yoga 4→6, @graphql-tools/utils 10→13, schema 10→11, delegate 11→12, load 8→9, url-loader 9→10, mock 9→10
- deps: minor (13 direct pkgs incl. graphql 16.14, express 5.3, jest 30.5, serverless 4.46; 8 transitive resolutions)
- deps: patch (10 transitive resolutions incl. tar, picomatch, minimatch, brace-expansion)

### Removed

- serverless-domain-manager

## [0.2.0] - 2025-07

### Added

- new nshm-hazard-graphql-api service integrated as HAZARD\_\*
- added this `CHANGELOG.md` file

### Changed

- update to use Node v22 (was 18)
- all subschemas queries are are PREFIXED
- updated packages:
  - serverless-offline

### Removed

- old KORORAA*\* hazard queries are deleted. Use HAZARD*\* instead)

## [0.1.0] -

- original project - not promoted to PROD
