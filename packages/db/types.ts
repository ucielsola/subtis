export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      Movies: {
        Row: {
          created_at: string
          id: number
          name: string
          rating: number
          year: number
        }
        Insert: {
          created_at?: string
          id: number
          name: string
          rating: number
          year: number
        }
        Update: {
          created_at?: string
          id?: number
          name?: string
          rating?: number
          year?: number
        }
        Relationships: []
      }
      ReleaseGroups: {
        Row: {
          created_at: string
          fileAttribute: string
          id: number
          isSupported: boolean | null
          name: string
          searchableArgenteamName: string
          searchableOpenSubtitlesName: string | null
          searchableSubDivXName: string
          website: string
        }
        Insert: {
          created_at?: string
          fileAttribute: string
          id?: number
          isSupported?: boolean | null
          name: string
          searchableArgenteamName: string
          searchableOpenSubtitlesName?: string | null
          searchableSubDivXName: string
          website: string
        }
        Update: {
          created_at?: string
          fileAttribute?: string
          id?: number
          isSupported?: boolean | null
          name?: string
          searchableArgenteamName?: string
          searchableOpenSubtitlesName?: string | null
          searchableSubDivXName?: string
          website?: string
        }
        Relationships: []
      }
      SubtitleGroups: {
        Row: {
          created_at: string
          id: number
          name: string
          website: string
        }
        Insert: {
          created_at?: string
          id?: number
          name: string
          website: string
        }
        Update: {
          created_at?: string
          id?: number
          name?: string
          website?: string
        }
        Relationships: []
      }
      Subtitles: {
        Row: {
          author: string | null
          created_at: string
          fileExtension: string
          fileName: string
          fileNameHash: string
          id: number
          movieId: number | null
          releaseGroupId: number
          resolution: string
          subtitleFullLink: string
          subtitleGroupId: number
          subtitleShortLink: string
        }
        Insert: {
          author?: string | null
          created_at?: string
          fileExtension: string
          fileName: string
          fileNameHash: string
          id?: number
          movieId?: number | null
          releaseGroupId: number
          resolution: string
          subtitleFullLink: string
          subtitleGroupId: number
          subtitleShortLink: string
        }
        Update: {
          author?: string | null
          created_at?: string
          fileExtension?: string
          fileName?: string
          fileNameHash?: string
          id?: number
          movieId?: number | null
          releaseGroupId?: number
          resolution?: string
          subtitleFullLink?: string
          subtitleGroupId?: number
          subtitleShortLink?: string
        }
        Relationships: [
          {
            foreignKeyName: "Subtitles_movieId_fkey"
            columns: ["movieId"]
            isOneToOne: false
            referencedRelation: "Movies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Subtitles_releaseGroupId_fkey"
            columns: ["releaseGroupId"]
            isOneToOne: false
            referencedRelation: "ReleaseGroups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Subtitles_subtitleGroupId_fkey"
            columns: ["subtitleGroupId"]
            isOneToOne: false
            referencedRelation: "SubtitleGroups"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
      Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
      Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never
