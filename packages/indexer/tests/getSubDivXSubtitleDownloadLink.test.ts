import { expect, test } from 'bun:test'

// internals
import { getSubDivXSubtitleDownloadLink } from '../subdivx'

test('should return a subtitle page link for "The Guardians of the Galaxy Vol. 3"', async () => {
  const subDivXSubtitlePageLink = await getSubDivXSubtitleDownloadLink(
    'http://www.subdivx.com/X666XNjY2NTQwX-guardians-of-the-galaxy-vol-3-2023.html',
  )
  expect(subDivXSubtitlePageLink).toBe('https://subdivx.com/bajar.php?id=666540&u=9')
})
