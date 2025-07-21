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

- Ensure that a hosted zone in Route53 exists for the base domain name.

```bash
npx cdk bootstrap
npx cdk deploy --all
```

## Continuous Deployment with GitHub Actions

Create a GitHub environment `production`.

Store the account ID and the region as a variable:

```bash
gh secret set ACCOUNT_ID --env production --body "<account id>"
```
