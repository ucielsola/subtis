import { expect, test } from 'bun:test'

// internals
import { SUBTITLE_GROUPS_ARRAY, getEnabledSubtitleProviders } from '../subtitle-groups'

test('should return no subtitle providers', () => {
  const subtitleProviders = getEnabledSubtitleProviders([])
  expect(subtitleProviders).toEqual([])
})

test('should return all currently subtitle providers', () => {
  const subtitleProviders = getEnabledSubtitleProviders(['SubDivX', 'Argenteam', 'OpenSubtitles'])
  expect(subtitleProviders).toEqual(SUBTITLE_GROUPS_ARRAY)
})

test('should return only SubDivX subtitle provider', () => {
  const subtitleProviders = getEnabledSubtitleProviders(['SubDivX'])
  expect(subtitleProviders).toEqual(SUBTITLE_GROUPS_ARRAY.filter(subtitleGroup => subtitleGroup.name === 'SubDivX'))
})

test('should return only Argenteam subtitle provider', () => {
  const subtitleProviders = getEnabledSubtitleProviders(['Argenteam'])
  expect(subtitleProviders).toEqual(SUBTITLE_GROUPS_ARRAY.filter(subtitleGroup => subtitleGroup.name === 'Argenteam'))
})

test('should return only OpenSubtitles subtitle provider', () => {
  const subtitleProviders = getEnabledSubtitleProviders(['OpenSubtitles'])
  expect(subtitleProviders).toEqual(SUBTITLE_GROUPS_ARRAY.filter(subtitleGroup => subtitleGroup.name === 'OpenSubtitles'))
})

test('should return only SubDivX and Argenteam as subtitle provider', () => {
  const subtitleProviders = getEnabledSubtitleProviders(['SubDivX', 'Argenteam'])
  expect(subtitleProviders).toEqual(SUBTITLE_GROUPS_ARRAY.filter(subtitleGroup => ['SubDivX', 'Argenteam'].includes(subtitleGroup.name)))
})
