# Subtis

> El subtítulo que buscabas

## Packages

- [API](/packages/api/)
- [CLI](/packages/cli/)
- [Web](/packages/web/)
- [Shared](/packages/shared/)
- [Indexer](/packages/indexer/)

## Development

1. Install bun runtime

```bash
> curl -fsSL https://bun.sh/install | bash
```

If there's any specific issue with the latest version install the latest stable

```bash
> curl -fsSL https://bun.sh/install | bash -s "bun-v1.0.11"
```

or upgrade it

```bash
> bun upgrade
```

2. Install project dependencies

```bash
> bun install
```

3. Run any of the desired packages

```bash
> bun dev:api // needed for web and cli
> bun dev:web
> bun dev:cli
> bun dev:indexer
```

4. Test your code in watch mode

```bash
> bun test:watch
```

## Warnings

- Tests run all packages except CLI since msw is not working with Bun at the moment
  - Tests work running it separately doing `cd packages/cli && bun test`

## Support

| Release Groups | Subtitle Group | Support |
| -------------- | -------------- | ------- |
| YTS.MX         | SubDivx        | ✅      |
| YTS.MX         | Argenteam      | ✅      |
| YTS.MX         | OpenSubtitles  | ✅      |

## Diagrams

[Whimsical](https://whimsical.com/Subtis-9VTuUJTU3KcGLHGbk19ioA)
