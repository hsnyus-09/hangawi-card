# Hangawi Card

Hangawi Card is a TypeScript package for creating Chuseok greeting cards in SVG format. The web studio and Node.js CLI can save cards as SVG or PNG.

## Quick Start

Use Node.js 22 LTS (22.12 or later).

```bash
npm ci
npm run dev
```

By default, the web studio opens at `http://127.0.0.1:5178`.

## CLI

```bash
npm run build
node dist/cli/index.js --to "Parents" --from "Us" --message "Have a bountiful Chuseok" --theme coral --format svg --output card.svg
node dist/cli/index.js --to "Parents" --from "Us" --message "Have a bountiful Chuseok" --theme pine --format png --output card.png
```

Supported options are `--to`, `--from`, `--message`, `--theme`, `--template`, `--format svg|png`, `--output`, `--font-file`, and `--help`.

PNG output is rendered with `@resvg/resvg-js`. Korean output requires a system font that supports Hangul.

If your system does not have a Hangul font, pass the font to use for PNG rendering directly.

```bash
node dist/cli/index.js --to "Family" --from "Me" --message "Bright Chuseok" --format png --font-file /path/to/NotoSansCJKkr-Regular.otf --output card.png
```

## API

```ts
import { createHangawiCard, listHangawiTemplates, listHangawiThemes } from "hangawi-card";

const card = createHangawiCard({
  to: "A Loved One",
  from: "Our Family",
  message: "Wishing you a Chuseok as generous and warm as a bright full moon.",
  template: "lunar",
  theme: "coral"
});

console.log(card.svg);
console.log(listHangawiTemplates());
console.log(Object.keys(listHangawiThemes()));
```

`createHangawiCard()` returns the SVG string, card size, title, template, and theme.

| Option | Value |
| --- | --- |
| `to` | Recipient. Required and up to 28 characters. |
| `from` | Sender. Required and up to 28 characters. |
| `message` | Greeting message. Required, up to 180 characters, and up to 5 rendered lines. |
| `template` | `lunar`, `paper`, `botanical`, `modern`. The default is `lunar`. |
| `theme` | `coral`, `persimmon`, `pine`, `ink`, or a custom theme object |
| `title` | Card title. Defaults to `풍요로운 한가위` (“A Bountiful Chuseok”) and is limited to 20 characters. |

User text is XML-escaped. Control characters that XML does not allow are removed, and unpaired surrogates are replaced with the replacement character. Custom theme colors only allow the `#rrggbb` format.

## Build and Deployment

```bash
npm run build
npm run preview
```

For static hosting, upload only the contents of `dist/site/`. The library and CLI are generated in `dist/lib/` and `dist/cli/`, respectively.

`npm pack` builds the library and creates a `.tgz` package.

```bash
npm pack
```

## Tests

Install Chromium before running browser tests for the first time.

```bash
npx playwright install chromium
npm run check
```

`npm run check` includes browser tests and package installation checks. The package check verifies the API, CLI, SVG and PNG output, and type declarations.

## Documentation

[Contributing Guide](CONTRIBUTING.md) · [Security Policy](SECURITY.md) · [Changelog](CHANGELOG.md) · [License](LICENSE)
