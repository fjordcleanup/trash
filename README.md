# Fjord CleanUP · Report and view trash in the Oslo fjord and in Akerselva.

[![GitHub Actions](https://github.com/fjordcleanup/trash/actions/workflows/test-and-release.yaml/badge.svg)](https://github.com/fjordcleanup/trash/actions/workflows/test-and-release.yaml)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Renovate](https://img.shields.io/badge/renovate-enabled-brightgreen.svg)](https://renovatebot.com)
[![@commitlint/config-conventional](https://img.shields.io/badge/%40commitlint-config--conventional-brightgreen)](https://github.com/conventional-changelog/commitlint/tree/master/@commitlint/config-conventional)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier/)
[![ESLint: TypeScript](https://img.shields.io/badge/ESLint-TypeScript-blue.svg)](https://github.com/typescript-eslint/typescript-eslint)

## Setup

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
npx cdk bootstrap
npx cdk deploy --all
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
