# Fjord CleanUP · Report and view trash in the Oslo fjord and in Akerselva.

[![GitHub Actions](https://github.com/fjordcleanup/trash/actions/workflows/test-and-release.yaml/badge.svg)](https://github.com/fjordcleanup/trash/actions/workflows/test-and-release.yaml)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Renovate](https://img.shields.io/badge/renovate-enabled-brightgreen.svg)](https://renovatebot.com)
[![@commitlint/config-conventional](https://img.shields.io/badge/%40commitlint-config--conventional-brightgreen)](https://github.com/conventional-changelog/commitlint/tree/master/@commitlint/config-conventional)
[![code style: oxfmt](https://img.shields.io/badge/code_style-oxfmt-32f3e9.svg)](https://oxc.rs/docs/guide/usage/formatter.html)
[![Oxlint](https://img.shields.io/badge/Ox-lint-blue.svg)](https://oxc.rs/docs/guide/usage/linter.html)

## Node & NPM

This project requires Node.js `>=26.13.1 <27` and npm `>=12.2.2 <13` (enforced
via `check-node-version` on `npm install` and `npm ci`). The check is skipped
during `npm publish` and `npm pack`, because `semantic-release` bundles its own
npm (`@semantic-release/npm` depends on `npm@^11.6.2`) and runs the publish with
that version rather than the one installed in CI.

## Setup

[`@fjordcleanup/trash-proto`](https://github.com/fjordcleanup/trash-proto) is
published to the GitHub npm registry, which requires authentication, even for
public packages. Log in with a
[personal access token (classic)](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry#authenticating-with-a-personal-access-token)
that has the `read:packages` scope:

```bash
npm login --scope=@fjordcleanup --auth-type=legacy --registry=https://npm.pkg.github.com
```

Install the dependencies:

```bash
npm ci
```

## Run

```bash
npm start
```

## Deploy

- If deploying the production stack: ensure that a hosted zone in Route53 exists
  for the base domain name.
- Deploy the
  [`image-magick-lambda-layer`](https://serverlessrepo.aws.amazon.com/applications/arn:aws:serverlessrepo:us-east-1:145266761615:applications~image-magick-lambda-layer)

```bash
npm run cdk:bootstrap
npm run cdk:prod:deploy
```

## Continuous Deployment with GitHub Actions

Create a GitHub environment `production`.

Store the account ID as a variable:

```bash
gh secret set ACCOUNT_ID --env production --body "<account id>"
```

Provide these environment variables:

- For the stack
  - `STACK_PREFIX` (e.g. `fjordcleanup-trash`)
  - `AWS_REGION` (e.g. `eu-north-1`)
  - `BASE_DOMAIN_NAME` (e.g. `fjordcleanup.org`)

- For the map resources (e.g. using <https://github.com/hello-nrfcloud/aws-map>)
  - `MAP_API_KEY`

- For Cognito
  - `COGNITO_USER_POOL_CLIENT_ID`
  - `COGNITO_USER_POOL_URL`
  - `COGNITO_IDENTITY_POOL_ID`

```bash
gh variable set <STACK_PREFIX> --env production --body "<value>"
```
