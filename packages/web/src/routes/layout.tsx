import { Slot, component$ } from '@builder.io/qwik'
import type { RequestHandler } from '@builder.io/qwik-city'

export const onGet: RequestHandler = async ({ cacheControl }) => {
  cacheControl({
    maxAge: 5,
    staleWhileRevalidate: 60 * 60 * 24 * 7,
  })
}

export default component$(() => {
  return <Slot />
})
