# Subtis | Tu buscador de subtitulos

## URLs

| Name    | Link                        |
|---------|-----------------------------|
| API     | https://api.subt.is         |
| Stremio | https://stremio.subt.is     |
| WebSocket | https://socketdex.subt.is |

## Packages

| Client-side | Server-side | Cross packages |
|-------------|-------------|----------------|
| [Web](/packages/web/) | [DB](/packages/db/) | [Shared](/packages/shared/) |
| [CLI](/packages/cli/) | [API](/packages/api/) |  |
| [Raycast](/packages/raycast/) |[Indexer](/packages/indexer/)  |
| [Stremio](/packages/stremio/) |                |

## Development

1. Request `.env.development` file from a team member

2. Run initialization script

```bash
chmod +x ./setup.sh && ./setup.sh
```

3. Install [bun](https://bun.sh/) runtime

```bash
curl -fsSL https://bun.sh/install | bash
```

4. Install project dependencies

```bash
bun install
```

5. Run Subtis REST API

```bash
bun run dev:api
```

6. Run Subtis Web

```bash
bun run dev:web
```

7. Run any of the desired client packages (Optional)

```bash
bun run dev:cli
bun run dev:raycast
bun run dev:stremio
```

8. Run the indexer to fill DB (Optional)

```bash
bun run dev:indexer:movies
bun run dev:indexer:tv-shows
```

## Deployment

- Deploy API

1. Login to Cloudfare (if you haven't already)

```bash
wrangler login
```

2. Run the following command

```bash
bun run deploy:api
```

- Deploy CLI

1. Create new release in [Github Releases](https://github.com/lndgalante/homebrew-subtis/releases)

2. Update `subtis.rb` with the new release version and push the changes


## Database

### Updating Database Types and Schemas

1. Login to Supabase (if you haven't already)

```bash
bunx supabase login
```

2. Create database type definitions and zod schemas

```bash
bun run update:db:schemas
```

### Access Database

Request access to Supabase team with the developer email.

### Schema

To check how the database schema looks like go to Supabase project, under `Database -> Tools -> Schema Visualizer`.

## CLI

### Installation

```bash
brew tap lndgalante/homebrew-subtis
brew install subtis
```


## Good practices

- Generate SQL dump

```bash
bun run update:db:dump
```

- Bump DB schemas

  1. Remove the following 4 lines
  ```typescript
  show_limit: {
    Args: Record<PropertyKey, never>;
    Returns: number;
  };
  ```

  2. Run the following command
  ```bash
  bun run update:db:schemas
  ```

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

1. Import [docs/collection.json](/docs/collection.json) into your preferred HTTP client like [Yaak](https://yaak.app) within Collecitions to quickly play with all API endpoints and different scenarios

2. Import [docs/localhost.json](/docs/localhost.json) and [docs/localhost.json](/docs/production.json) to your environments section in your HTTP client

3. Select your environment to test like LOCALHOST or PRODUCTION

## Diagrams

[Whimsical](https://whimsical.com/Subtis-9VTuUJTU3KcGLHGbk19ioA)
