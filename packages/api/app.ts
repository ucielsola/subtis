import { Elysia, t } from 'elysia';
import { cors } from '@elysiajs/cors';
import { swagger } from '@elysiajs/swagger';

// internals
import { getSubtitleFromFileName } from './subtitles';

// core
export const app = new Elysia()
  .use(cors())
  .use(swagger())
  .post('/subtitles', ({ set, body }) => getSubtitleFromFileName({ set, body }), {
    body: t.Object({ fileName: t.String() }),
  })
  .listen(8080);

// types
export type App = typeof app;

// logs
console.log(`🦊 API is running at ${app.server?.hostname}:${app.server?.port}`);
