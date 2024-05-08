export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      Movies: {
        Row: {
          backdrop: string | null;
          created_at: string;
          id: number;
          name: string;
          poster: string | null;
          rating: number;
          release_date: string;
          year: number;
        };
        Insert: {
          backdrop?: string | null;
          created_at?: string;
          id: number;
          name: string;
          poster?: string | null;
          rating: number;
          release_date: string;
          year: number;
        };
        Update: {
          backdrop?: string | null;
          created_at?: string;
          id?: number;
          name?: string;
          poster?: string | null;
          rating?: number;
          release_date?: string;
          year?: number;
        };
        Relationships: [];
      };
      ReleaseGroups: {
        Row: {
          created_at: string;
          file_attributes: string[];
          id: number;
          is_supported: boolean | null;
          name: string;
          searchable_opensubtitles_name: string[] | null;
          searchable_subdivx_name: string[];
        };
        Insert: {
          created_at?: string;
          file_attributes: string[];
          id?: number;
          is_supported?: boolean | null;
          name: string;
          searchable_opensubtitles_name?: string[] | null;
          searchable_subdivx_name: string[];
        };
        Update: {
          created_at?: string;
          file_attributes?: string[];
          id?: number;
          is_supported?: boolean | null;
          name?: string;
          searchable_opensubtitles_name?: string[] | null;
          searchable_subdivx_name?: string[];
        };
        Relationships: [];
      };
      SubtitleGroups: {
        Row: {
          created_at: string;
          id: number;
          name: string;
          website: string;
        };
        Insert: {
          created_at?: string;
          id?: number;
          name: string;
          website: string;
        };
        Update: {
          created_at?: string;
          id?: number;
          name?: string;
          website?: string;
        };
        Relationships: [];
      };
      Subtitles: {
        Row: {
          author: string | null;
          bytes: number;
          created_at: string;
          file_extension: string;
          id: number;
          lang: string;
          last_queried_at: string | null;
          movie_file_name: string;
          movie_id: number;
          queried_times: number | null;
          release_group_id: number;
          resolution: string;
          reviewed: boolean;
          subtitle_file_name: string;
          subtitle_group_id: number;
          subtitle_link: string;
          uploaded_by: string | null;
        };
        Insert: {
          author?: string | null;
          bytes: number;
          created_at?: string;
          file_extension: string;
          id?: number;
          lang: string;
          last_queried_at?: string | null;
          movie_file_name: string;
          movie_id: number;
          queried_times?: number | null;
          release_group_id: number;
          resolution: string;
          reviewed: boolean;
          subtitle_file_name: string;
          subtitle_group_id: number;
          subtitle_link: string;
          uploaded_by?: string | null;
        };
        Update: {
          author?: string | null;
          bytes?: number;
          created_at?: string;
          file_extension?: string;
          id?: number;
          lang?: string;
          last_queried_at?: string | null;
          movie_file_name?: string;
          movie_id?: number;
          queried_times?: number | null;
          release_group_id?: number;
          resolution?: string;
          reviewed?: boolean;
          subtitle_file_name?: string;
          subtitle_group_id?: number;
          subtitle_link?: string;
          uploaded_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "Subtitles_movieId_fkey";
            columns: ["movie_id"];
            isOneToOne: false;
            referencedRelation: "Movies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "Subtitles_releaseGroupId_fkey";
            columns: ["release_group_id"];
            isOneToOne: false;
            referencedRelation: "ReleaseGroups";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "Subtitles_subtitleGroupId_fkey";
            columns: ["subtitle_group_id"];
            isOneToOne: false;
            referencedRelation: "SubtitleGroups";
            referencedColumns: ["id"];
          },
        ];
      };
      SubtitlesNotFound: {
        Row: {
          created_at: string;
          id: number;
          movie_file_name: string;
        };
        Insert: {
          created_at?: string;
          id?: number;
          movie_file_name: string;
        };
        Update: {
          created_at?: string;
          id?: number;
          movie_file_name?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      fuzzy_search_movie: {
        Args: {
          movie_query: string;
        };
        Returns: {
          id: number;
          name: string;
          year: number;
        }[];
      };
      gtrgm_compress: {
        Args: {
          "": unknown;
        };
        Returns: unknown;
      };
      gtrgm_decompress: {
        Args: {
          "": unknown;
        };
        Returns: unknown;
      };
      gtrgm_in: {
        Args: {
          "": unknown;
        };
        Returns: unknown;
      };
      gtrgm_options: {
        Args: {
          "": unknown;
        };
        Returns: undefined;
      };
      gtrgm_out: {
        Args: {
          "": unknown;
        };
        Returns: unknown;
      };
      insert_subtitle_not_found: {
        Args: {
          file_name: string;
        };
        Returns: undefined;
      };
      set_limit: {
        Args: {
          "": number;
        };
        Returns: number;
      };
      show_limit: {
        Args: Record<PropertyKey, never>;
        Returns: number;
      };
      show_trgm: {
        Args: {
          "": string;
        };
        Returns: string[];
      };
      update_subtitle_info: {
        Args: {
          _bytes: number;
          _movie_file_name: string;
        };
        Returns: undefined;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] & PublicSchema["Views"]) | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    ? (PublicSchema["Tables"] & PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends keyof PublicSchema["Tables"] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends keyof PublicSchema["Tables"] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  PublicEnumNameOrOptions extends keyof PublicSchema["Enums"] | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never;
