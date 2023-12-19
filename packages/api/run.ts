import { runElyisia } from '.'

export const app = runElyisia()

// eslint-disable-next-line no-console
console.log(`\n🟢 Subtis API is running at https://${app.server?.hostname}:${app.server?.port}\n`)
