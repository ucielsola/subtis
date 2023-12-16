import { initializeElyisia } from './elysia'

export const app = initializeElyisia()

// eslint-disable-next-line no-console
console.log(`🟢 Subtis API is running at https://${app.server?.hostname}:${app.server?.port}`)
