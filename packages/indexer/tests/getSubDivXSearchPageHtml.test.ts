import { expect, test } from 'bun:test';

import { getSubDivXSearchPageHtml } from '../subdivx';

test('should return an search HTML for "Kinderfanger (2023)"', async () => {
  const searchParams = await getSubDivXSearchPageHtml('Kinderfanger (2023)');
  expect(searchParams).toBeTypeOf('string');
});
