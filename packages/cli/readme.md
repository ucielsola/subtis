# Subtis - CLI

## How to use

```typescript
bnx @subtis/cli --file [YOUR_MOVIE_FILE_PATH]
npx @subtis/cli --file [YOUR_MOVIE_FILE_PATH]
pnpx @subtis/cli --file [YOUR_MOVIE_FILE_PATH]
yarn dlx @subtis/cli --file [YOUR_MOVIE_FILE_PATH]
```

## Development

Run in the root:

```bash
bun dev:cli --file [YOUR_MOVIE_FILE_PATH] // or
```

Example:

```bash
bun dev:cli --file ./Oppenheimer.2023.1080p.BluRay.DD5.1.x264-GalaxyRG.mkv
```

or

```bash
bun dev:cli -f ./Oppenheimer.2023.1080p.BluRay.DD5.1.x264-GalaxyRG.mkv
```

## Guidelines

Follow [Node.js CLI Apps best practices list](https://github.com/lirantal/nodejs-cli-apps-best-practices)
