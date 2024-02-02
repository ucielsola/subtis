import { describe, expect, it } from 'bun:test'

// internals
import { jsonSchema, moviesInsertSchema, moviesRowSchema, moviesUpdateSchema, releaseGroupsInsertSchema, releaseGroupsRowSchema, releaseGroupsUpdateSchema, subtitleGroupsInsertSchema, subtitleGroupsRowSchema, subtitleGroupsUpdateSchema, subtitlesInsertSchema, subtitlesRowSchema, subtitlesUpdateSchema } from './schemas'

describe('DB | schemas', () => {
  describe('DB  | moviesRowSchema', () => {
    it('should validate a correct movies row', () => {
      const validMovieRow = {
        created_at: '2024-01-01',
        id: 1,
        name: 'Inception',
        rating: 8.8,
        year: 2010,
      }
      expect(moviesRowSchema.safeParse(validMovieRow).success).toBeTruthy()
    })

    it('should invalidate an incorrect movies row', () => {
      const invalidMovieRow = {
        created_at: '2024-01-01',
        id: 'one', // Invalid ID
        name: 'Inception',
        rating: 8.8,
        year: 2010,
      }
      expect(moviesRowSchema.safeParse(invalidMovieRow).success).toBeFalsy()
    })
  })

  describe('DB | moviesInsertSchema', () => {
    it('should validate a correct movie insert structure', () => {
      const validMovieInsert = {
        id: 2,
        name: 'Avatar',
        rating: 7.8,
        year: 2009,
      }
      expect(moviesInsertSchema.safeParse(validMovieInsert).success).toBeTruthy()
    })

    it('should invalidate an incorrect movie insert structure', () => {
      const invalidMovieInsert = {
        id: 'two', // Invalid ID type
        name: 'Avatar',
        rating: 'high', // Invalid rating type
        year: 2009,
      }
      expect(moviesInsertSchema.safeParse(invalidMovieInsert).success).toBeFalsy()
    })
  })

  describe('DB | moviesUpdateSchema', () => {
    it('should validate a correct movie update structure', () => {
      const validMovieUpdate = {
        name: 'The Matrix',
      }
      expect(moviesUpdateSchema.safeParse(validMovieUpdate).success).toBeTruthy()
    })

    it('should invalidate an incorrect movie update structure', () => {
      const invalidMovieUpdate = {
        rating: 'excellent', // Invalid rating type
      }
      expect(moviesUpdateSchema.safeParse(invalidMovieUpdate).success).toBeFalsy()
    })
  })

  describe('DB | releaseGroupsRowSchema', () => {
    it('should validate a correct release groups row', () => {
      const validReleaseGroupRow = {
        created_at: '2024-01-01',
        fileAttribute: 'HD',
        id: 1,
        isSupported: true,
        name: 'GroupA',
        searchableOpenSubtitlesName: 'GroupA-OS',
        searchableSubDivXName: 'GroupA-SDX',
        website: 'www.groupa.com',
      }
      expect(releaseGroupsRowSchema.safeParse(validReleaseGroupRow).success).toBeTruthy()
    })

    it('should invalidate an incorrect release groups row', () => {
      const invalidReleaseGroupRow = {
        created_at: '2024-01-01',
        fileAttribute: 720, // Invalid type
        id: 1,
        isSupported: 'yes', // Invalid type
        name: 'GroupA',
        searchableOpenSubtitlesName: 'GroupA-OS',
        searchableSubDivXName: 'GroupA-SDX',
        website: 'www.groupa.com',
      }
      expect(releaseGroupsRowSchema.safeParse(invalidReleaseGroupRow).success).toBeFalsy()
    })
  })

  describe('DB | releaseGroupsInsertSchema', () => {
    it('should validate a correct release group insert structure', () => {
      const validReleaseGroupInsert = {
        fileAttribute: 'HD',
        name: 'GroupB',
        searchableSubDivXName: 'GroupB-SDX',
        website: 'www.groupb.com',
      }
      expect(releaseGroupsInsertSchema.safeParse(validReleaseGroupInsert).success).toBeTruthy()
    })

    it('should invalidate an incorrect release group insert structure', () => {
      const invalidReleaseGroupInsert = {
        fileAttribute: 'HD',
        id: 'one', // Invalid ID type
        name: 123, // Invalid name type
        searchableSubDivXName: 'GroupB-SDX',
        website: 'www.groupb.com',
      }
      expect(releaseGroupsInsertSchema.safeParse(invalidReleaseGroupInsert).success).toBeFalsy()
    })
  })

  describe('DB | releaseGroupsUpdateSchema', () => {
    it('should validate a correct release group update structure', () => {
      const validReleaseGroupUpdate = {
        fileAttribute: '4K',
        isSupported: false,
      }
      expect(releaseGroupsUpdateSchema.safeParse(validReleaseGroupUpdate).success).toBeTruthy()
    })

    it('should invalidate an incorrect release group update structure', () => {
      const invalidReleaseGroupUpdate = {
        isSupported: 'maybe', // Invalid boolean type
      }
      expect(releaseGroupsUpdateSchema.safeParse(invalidReleaseGroupUpdate).success).toBeFalsy()
    })
  })

  describe('DB | subtitleGroupsRowSchema', () => {
    it('should validate a correct subtitle groups row', () => {
      const validSubtitleGroupRow = {
        created_at: '2024-01-01',
        id: 1,
        name: 'Subtitle Group A',
        website: 'www.subtitlegroupa.com',
      }
      expect(subtitleGroupsRowSchema.safeParse(validSubtitleGroupRow).success).toBeTruthy()
    })

    it('should invalidate an incorrect subtitle groups row', () => {
      const invalidSubtitleGroupRow = {
        created_at: '2024-01-01',
        id: 'one', // Invalid ID type
        name: 'Subtitle Group A',
        website: 1234, // Invalid website type
      }
      expect(subtitleGroupsRowSchema.safeParse(invalidSubtitleGroupRow).success).toBeFalsy()
    })
  })

  describe('DB | subtitleGroupsInsertSchema', () => {
    it('should validate a correct subtitle groups insert structure', () => {
      const validSubtitleGroupInsert = {
        name: 'Subtitle Group B',
        website: 'www.subtitlegroupb.com',
      }
      expect(subtitleGroupsInsertSchema.safeParse(validSubtitleGroupInsert).success).toBeTruthy()
    })

    it('should invalidate an incorrect subtitle groups insert structure', () => {
      const invalidSubtitleGroupInsert = {
        name: 1234, // Invalid name type
        website: 'www.subtitlegroupb.com',
      }
      expect(subtitleGroupsInsertSchema.safeParse(invalidSubtitleGroupInsert).success).toBeFalsy()
    })
  })

  describe('DB | subtitleGroupsInsertSchema', () => {
    it('should validate a correct subtitle groups insert structure', () => {
      const validSubtitleGroupInsert = {
        name: 'Subtitle Group B',
        website: 'www.subtitlegroupb.com',
      }
      expect(subtitleGroupsInsertSchema.safeParse(validSubtitleGroupInsert).success).toBeTruthy()
    })

    it('should invalidate an incorrect subtitle groups insert structure', () => {
      const invalidSubtitleGroupInsert = {
        name: 1234, // Invalid name type
        website: 'www.subtitlegroupb.com',
      }
      expect(subtitleGroupsInsertSchema.safeParse(invalidSubtitleGroupInsert).success).toBeFalsy()
    })
  })

  describe('DB | subtitleGroupsUpdateSchema', () => {
    it('should validate a correct subtitle groups update structure', () => {
      const validSubtitleGroupUpdate = {
        name: 'Updated Subtitle Group',
      }
      expect(subtitleGroupsUpdateSchema.safeParse(validSubtitleGroupUpdate).success).toBeTruthy()
    })

    it('should invalidate an incorrect subtitle groups update structure', () => {
      const invalidSubtitleGroupUpdate = {
        website: 2024, // Invalid website type
      }
      expect(subtitleGroupsUpdateSchema.safeParse(invalidSubtitleGroupUpdate).success).toBeFalsy()
    })
  })

  describe('DB | subtitlesRowSchema', () => {
    it('should validate a correct subtitles row', () => {
      const validSubtitlesRow = {
        author: 'Author Name',
        created_at: '2024-01-01',
        fileExtension: 'srt',
        fileName: 'subtitle_file',
        id: 1,
        lastQueriedAt: '2024-01-02',
        movieId: 100,
        queriedTimes: 5,
        releaseGroupId: 10,
        resolution: '1080p',
        subtitleFullLink: 'http://example.com/subtitle_full',
        subtitleGroupId: 20,
        subtitleShortLink: 'http://example.com/sub',
      }
      expect(subtitlesRowSchema.safeParse(validSubtitlesRow).success).toBeTruthy()
    })

    it('should invalidate an incorrect subtitles row', () => {
      const invalidSubtitlesRow = {
        author: null,
        created_at: '2024-01-01',
        fileExtension: 123, // Invalid type
        fileName: 'subtitle_file',
        id: 1,
        lastQueriedAt: '2024-01-02',
        movieId: 100,
        queriedTimes: 'five', // Invalid type
        releaseGroupId: 10,
        resolution: '1080p',
        subtitleFullLink: 'http://example.com/subtitle_full',
        subtitleGroupId: 20,
        subtitleShortLink: 'http://example.com/sub',
      }
      expect(subtitlesRowSchema.safeParse(invalidSubtitlesRow).success).toBeFalsy()
    })
  })

  describe('DB | subtitlesInsertSchema', () => {
    it('should validate a correct subtitles insert structure', () => {
      const validSubtitlesInsert = {
        fileExtension: 'srt',
        fileName: 'subtitle_file_insert',
        releaseGroupId: 15,
        resolution: '720p',
        subtitleFullLink: 'http://example.com/subtitle_full_insert',
        subtitleGroupId: 25,
        subtitleShortLink: 'http://example.com/sub_insert',
      }
      expect(subtitlesInsertSchema.safeParse(validSubtitlesInsert).success).toBeTruthy()
    })

    it('should invalidate an incorrect subtitles insert structure', () => {
      const invalidSubtitlesInsert = {
        fileExtension: 'srt',
        fileName: 'subtitle_file_insert',
        releaseGroupId: 'fifteen', // Invalid type
        resolution: '720p',
        subtitleFullLink: 'http://example.com/subtitle_full_insert',
        subtitleGroupId: 25,
        subtitleShortLink: 'http://example.com/sub_insert',
      }
      expect(subtitlesInsertSchema.safeParse(invalidSubtitlesInsert).success).toBeFalsy()
    })
  })

  describe('DB | subtitlesUpdateSchema', () => {
    it('should validate a correct subtitles update structure', () => {
      const validSubtitlesUpdate = {
        author: 'New Author',
        fileExtension: 'sub',
        resolution: '4K',
      }
      expect(subtitlesUpdateSchema.safeParse(validSubtitlesUpdate).success).toBeTruthy()
    })

    it('should invalidate an incorrect subtitles update structure', () => {
      const invalidSubtitlesUpdate = {
        author: 12345, // Invalid type
        fileExtension: 'sub',
        resolution: '4K',
      }
      expect(subtitlesUpdateSchema.safeParse(invalidSubtitlesUpdate).success).toBeFalsy()
    })
  })
})

describe('jsonSchema', () => {
  it('should validate a string', () => {
    expect(jsonSchema.safeParse('Hello World').success).toBeTruthy()
  })

  it('should validate a number', () => {
    expect(jsonSchema.safeParse(123).success).toBeTruthy()
  })

  it('should validate a boolean', () => {
    expect(jsonSchema.safeParse(true).success).toBeTruthy()
  })

  it('should validate a simple object', () => {
    expect(jsonSchema.safeParse({ key: 'value' }).success).toBeTruthy()
  })

  it('should validate an array', () => {
    expect(jsonSchema.safeParse([1, 'a', true, null]).success).toBeTruthy()
  })

  it('should validate a nested structure', () => {
    expect(jsonSchema.safeParse({ nested: { flag: true, key: [1, 2, null] } }).success).toBeTruthy()
  })

  it('should invalidate an undefined value', () => {
    expect(jsonSchema.safeParse(undefined).success).toBeFalsy()
  })
})
