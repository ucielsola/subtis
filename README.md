# Subtis

El subtítulo que estabas buscando!

## Packages

- Server-side
  - [DB](/packages/db/)
  - [API](/packages/api/)
  - [Indexer](/packages/indexer/)

- Client-side
  - [CLI](/packages/cli/)
  - [Raycast](/packages/raycast/)

- Cross packages
  - [Shared](/packages/shared/)

## Development

1. Install bun runtime

```bash
curl -fsSL https://bun.sh/install | bash
```

If there's any specific issue with the latest version install the v1.0.11 stable that it works mainly with the indexer

```bash
curl -fsSL https://bun.sh/install | bash -s "bun-v1.0.11"
```

_At least until [Brotly](https://github.com/oven-sh/bun/issues/267) is fully supported on Bun._

2. Install project dependencies

```bash
bun install
```

3. Run any of the desired packages

```bash
bun dev:api
bun dev:web
bun dev:cli
bun dev:raycast
bun dev:indexer
```

4. Test your code in watch mode

```bash
bun run test:watch
```

## Updating Database

If there's a database schema update, we should run:

3. Create database type definitions and zod schemas
```bash
bun run db:generate
```

## Access Database

Request access to Supabase team with the developer email.

## Linting on VSCode

If you want to have lint in auto-save follow the official [VSCode Support](https://github.com/antfu/eslint-config#vs-code-support-auto-fix) guide from the ESLint config we use.

## API Playground

Import [docs/collection.json](/docs/collection.json) into your preferred HTTP client like Hoppscotch, Postman or Insomnia, to quickly play with all API endpoints and different scenarios.

## Support

| Release Groups | Subtitle Group | Support |
| -------------- | -------------- | ------- |
| YTS.MX         | SubDivx        | ✅      |
| YTS.MX         | Argenteam      | ✅      |
| YTS.MX         | OpenSubtitles  | ✅      |

## Diagrams

[Whimsical](https://whimsical.com/Subtis-9VTuUJTU3KcGLHGbk19ioA)
