# Subtis - El subtítulo que estabas buscando!

## Packages

| Server-side | Client-side | Cross packages |
|-------------|-------------|----------------|
| [DB](/packages/db/) | [CLI](/packages/cli/) | [Shared](/packages/shared/) |
| [API](/packages/api/) | [Raycast](/packages/raycast/) |  |
| [Indexer](/packages/indexer/) | [Stremio](/packages/stremio/) |                |

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

4. Run subtis REST API first

```bash
bun run dev:api
```

5. Run any of the desired packages

    i. **clients**
      ```bash
      bun run dev:web
      bun run dev:cli
      bun run dev:raycast
      bun run dev:stremio
      ```

    ii. **indexer**
      ```bash
      bun run dev:indexer
      ```

## Deployment

- Deploy API

  ```
    bun run deploy:api
  ```

- Deploy CLI

  ```bash
    bun run deploy:cli
  ```

## Database

### Updating Database Types and Schemas

If there's a database schema update, we should run:

1. Login to Supabase (if you haven't already)

```bash
cd packages/db && bunx supabase login
```

2. Create database type definitions and zod schemas

```bash
bun run db:generate
```

### Access Database

Request access to Supabase team with the developer email.

## Good practices

- Bump project dependencies

```bash
bun run update:deps
```

- Code format and lint

```bash
bun run biome:check
```

- Check type errors

```bash
bun run type:check
```

- Check type coverage

```bash
bun run type:coverage
```

- Check test coverage

```bash
bun run test:coverage
```

- Check code duplications

```bash
bun run code:duplications
```

## API Playground

Import [docs/collection.json](/docs/collection.json) into your preferred HTTP client like Hoppscotch (recommended), Postman or Insomnia, to quickly play with all API endpoints and different scenarios.

## Diagrams

[Whimsical](https://whimsical.com/Subtis-9VTuUJTU3KcGLHGbk19ioA)
