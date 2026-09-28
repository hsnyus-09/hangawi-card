# Security Policy

## Reporting Vulnerabilities

Privately notify the maintainers with the reproduction steps and impact scope. If no private contact channel is available, leave only the impact scope and contact method in a public issue. Do not disclose exploitable input or attack code publicly.

## Card Rendering

Before user text is inserted into SVG, it goes through length checks, XML character cleanup, and XML escaping. Custom themes allow only `#rrggbb` colors. New templates and CLI options must also pass through the existing string-processing functions.

PNG files are rendered with `@resvg/resvg-js`. Use font files from trusted sources.
