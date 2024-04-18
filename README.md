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
  - [Stremio](/packages/stremio/)

- Cross packages
  - [UI](/packages/ui/)
  - [Shared](/packages/shared/)

## Development

1. Install [bun](https://bun.sh/) runtime

```bash
curl -fsSL https://bun.sh/install | bash
```

2. Install project dependencies

```bash
cd subtis && bun install
```

3. Copy and paste environment variables from 1Password to root project folder

4. Run subtis API first

```bash
bun run dev:api
```

5. Run any of the desired packages

    i. Clients:
      ```bash
      bun run dev:web
      bun run dev:cli
      bun run dev:raycast
      bun run dev:stremio
      ```

    ii. Indexer:
      ```bash
      bun run dev:indexer
      ```

6. Test your code in watch mode

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
bun run db:generate
```

## Access Database

Request access to Supabase team with the developer email.

## API Playground

Import [docs/collection.json](/docs/collection.json) into your preferred HTTP client like Hoppscotch (recommended), Postman or Insomnia, to quickly play with all API endpoints and different scenarios.

## Diagrams

[Whimsical](https://whimsical.com/Subtis-9VTuUJTU3KcGLHGbk19ioA)
