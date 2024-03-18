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

## Updating Database Types and Schemas

If there's a database schema update, we should run:

1. Login to Supabase (if you haven't already)

```bash
cd packages/db && bunx supabase login
```

2. Create database type definitions and zod schemas

```bash
bun run generate
```

## Access Database

Request access to Supabase team with the developer email.

## Linting on VSCode

If you want to have lint in auto-save follow the official [VSCode Support](https://github.com/antfu/eslint-config#vs-code-support-auto-fix) guide from the ESLint config we use.

## API Playground

Import [docs/collection.json](/docs/collection.json) into your preferred HTTP client like Hoppscotch, Postman or Insomnia, to quickly play with all API endpoints and different scenarios.

## Diagrams

[Whimsical](https://whimsical.com/Subtis-9VTuUJTU3KcGLHGbk19ioA)
