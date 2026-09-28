# Contributing

## Development

```bash
npm ci
npm run dev
```

## Checks Before Submission

```bash
npx playwright install chromium
npm run check
```

## Change Guidelines

- User input must pass through the existing `normalizeText()`, `escapeXml()`, and `wrapText()` functions.
- When adding a new template or theme, update the types, input validation, studio, and README together.
- When changing the CLI, check `--help`, SVG and PNG output, and error exit codes.
- Check Korean line wrapping and long phrases in unit tests and browser tests.

Describe the scope of the changes and the tests you ran in the PR. If behavior changes, update the tests and documentation together.
