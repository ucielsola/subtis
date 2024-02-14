export type Json =
  | { [key: string]: Json | undefined }
  | Json[]
  | boolean
  | null
  | number
  | string

export type Database = {
  public: {
    CompositeTypes: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    Functions: {
      insert_subtitle_not_found: {
        Args: {
          file_name: string
        }
        Returns: undefined
      }
      update_subtitle_info: {
        Args: {
          file_name: string
        }
        Returns: undefined
      }
    }
    Tables: {
      Movies: {
        Insert: {
          created_at?: string
          id: number
          name: string
          rating: number
          release_date: string
          year: number
        }
        Relationships: []
        Row: {
          created_at: string
          id: number
          name: string
          rating: number
          release_date: string
          year: number
        }
        Update: {
          created_at?: string
          id?: number
          name?: string
          rating?: number
          release_date?: string
          year?: number
        }
      }
      ReleaseGroups: {
        Insert: {
          created_at?: string
          fileAttribute: string
          id?: number
          isSupported?: boolean | null
          name: string
          searchableOpenSubtitlesName?: null | string[]
          searchableSubDivXName: string[]
          website: string
        }
        Relationships: []
        Row: {
          created_at: string
          fileAttribute: string
          id: number
          isSupported: boolean | null
          name: string
          searchableOpenSubtitlesName: null | string[]
          searchableSubDivXName: string[]
          website: string
        }
        Update: {
          created_at?: string
          fileAttribute?: string
          id?: number
          isSupported?: boolean | null
          name?: string
          searchableOpenSubtitlesName?: null | string[]
          searchableSubDivXName?: string[]
          website?: string
        }
      }
      SubtitleGroups: {
        Insert: {
          created_at?: string
          id?: number
          name: string
          website: string
        }
        Relationships: []
        Row: {
          created_at: string
          id: number
          name: string
          website: string
        }
        Update: {
          created_at?: string
          id?: number
          name?: string
          website?: string
        }
      }
      Subtitles: {
        Insert: {
          author?: null | string
          bytes: string
          created_at?: string
          fileExtension: string
          fileName: string
          id?: number
          lastQueriedAt?: null | string
          movieId?: null | number
          queriedTimes?: null | number
          releaseGroupId: number
          resolution: string
          subtitleFullLink: string
          subtitleGroupId: number
          subtitleShortLink: string
        }
        Relationships: [
          {
            columns: ['movieId']
            foreignKeyName: 'Subtitles_movieId_fkey'
            isOneToOne: false
            referencedColumns: ['id']
            referencedRelation: 'Movies'
          },
          {
            columns: ['releaseGroupId']
            foreignKeyName: 'Subtitles_releaseGroupId_fkey'
            isOneToOne: false
            referencedColumns: ['id']
            referencedRelation: 'ReleaseGroups'
          },
          {
            columns: ['subtitleGroupId']
            foreignKeyName: 'Subtitles_subtitleGroupId_fkey'
            isOneToOne: false
            referencedColumns: ['id']
            referencedRelation: 'SubtitleGroups'
          },
        ]
        Row: {
          author: null | string
          bytes: string
          created_at: string
          fileExtension: string
          fileName: string
          id: number
          lastQueriedAt: null | string
          movieId: null | number
          queriedTimes: null | number
          releaseGroupId: number
          resolution: string
          subtitleFullLink: string
          subtitleGroupId: number
          subtitleShortLink: string
        }
        Update: {
          author?: null | string
          bytes?: string
          created_at?: string
          fileExtension?: string
          fileName?: string
          id?: number
          lastQueriedAt?: null | string
          movieId?: null | number
          queriedTimes?: null | number
          releaseGroupId?: number
          resolution?: string
          subtitleFullLink?: string
          subtitleGroupId?: number
          subtitleShortLink?: string
        }
      }
      SubtitlesNotFound: {
        Insert: {
          created_at?: string
          fileName: string
          id?: number
        }
        Relationships: []
        Row: {
          created_at: string
          fileName: string
          id: number
        }
        Update: {
          created_at?: string
          fileName?: string
          id?: number
        }
      }
    }
    Views: {
      [_ in never]: never
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
  | { schema: keyof Database }
  | keyof (Database['public']['Tables'] & Database['public']['Views']),
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
    Database[PublicTableNameOrOptions['schema']]['Views'])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
  Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
      ? R
      : never
  : PublicTableNameOrOptions extends keyof (Database['public']['Tables'] &
  Database['public']['Views'])
    ? (Database['public']['Tables'] &
    Database['public']['Views'])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
        ? R
        : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
  | { schema: keyof Database }
  | keyof Database['public']['Tables'],
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
    Insert: infer I
  }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database['public']['Tables']
    ? Database['public']['Tables'][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
  | { schema: keyof Database }
  | keyof Database['public']['Tables'],
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
    Update: infer U
  }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database['public']['Tables']
    ? Database['public']['Tables'][PublicTableNameOrOptions] extends {
      Update: infer U
    }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
  | { schema: keyof Database }
  | keyof Database['public']['Enums'],
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
  : PublicEnumNameOrOptions extends keyof Database['public']['Enums']
    ? Database['public']['Enums'][PublicEnumNameOrOptions]
    : never
