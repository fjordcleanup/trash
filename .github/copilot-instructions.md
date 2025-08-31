# Copilot instructions

## Project setup

Ensure to set up the Node.js version as specified in the `package.json`'s
`engines` directive.

## Adding new features

Always add tests for new code.

## Ensure code style consistency

Always run these commands before committing to ensure everything looks good:

```bash
# Compile TypeScript
npx tsc
# Format source code
npx prettier --write ./
# Run unit tests
npm test
```
