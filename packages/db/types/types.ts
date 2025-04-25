export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      Genres: {
        Row: {
          created_at: string;
          genre_id: number;
          id: number;
          name: string;
        };
        Insert: {
          created_at?: string;
          genre_id: number;
          id?: number;
          name: string;
        };
        Update: {
          created_at?: string;
          genre_id?: number;
          id?: number;
          name?: string;
        };
        Relationships: [];
      };
      ReleaseGroups: {
        Row: {
          created_at: string;
          id: number;
          is_supported: boolean | null;
          matches: string[];
          release_group_name: string;
        };
        Insert: {
          created_at?: string;
          id?: number;
          is_supported?: boolean | null;
          matches: string[];
          release_group_name: string;
        };
        Update: {
          created_at?: string;
          id?: number;
          is_supported?: boolean | null;
          matches?: string[];
          release_group_name?: string;
        };
        Relationships: [];
      };
      SubtitleGroups: {
        Row: {
          created_at: string;
          id: number;
          subtitle_group_name: string;
          website: string;
        };
        Insert: {
          created_at?: string;
          id?: number;
          subtitle_group_name: string;
          website: string;
        };
        Update: {
          created_at?: string;
          id?: number;
          subtitle_group_name?: string;
          website?: string;
        };
        Relationships: [];
      };
      Subtitles: {
        Row: {
          author: string | null;
          bytes: number;
          created_at: string;
          current_episode: number | null;
          current_season: number | null;
          external_id: string;
          file_extension: string;
          id: number;
          is_valid: boolean;
          lang: string;
          last_queried_at: string | null;
          queried_times: number | null;
          release_group_id: number;
          resolution: string;
          reviewed: boolean;
          rip_type: string | null;
          subtitle_file_name: string;
          subtitle_group_id: number;
          subtitle_link: string;
          time_to_index_in_s: number | null;
          title_file_name: string;
          title_slug: string;
          torrent_id: number;
          uploaded_by: string | null;
        };
        Insert: {
          author?: string | null;
          bytes: number;
          created_at?: string;
          current_episode?: number | null;
          current_season?: number | null;
          external_id: string;
          file_extension: string;
          id?: number;
          is_valid: boolean;
          lang: string;
          last_queried_at?: string | null;
          queried_times?: number | null;
          release_group_id: number;
          resolution: string;
          reviewed: boolean;
          rip_type?: string | null;
          subtitle_file_name: string;
          subtitle_group_id: number;
          subtitle_link: string;
          time_to_index_in_s?: number | null;
          title_file_name: string;
          title_slug: string;
          torrent_id: number;
          uploaded_by?: string | null;
        };
        Update: {
          author?: string | null;
          bytes?: number;
          created_at?: string;
          current_episode?: number | null;
          current_season?: number | null;
          external_id?: string;
          file_extension?: string;
          id?: number;
          is_valid?: boolean;
          lang?: string;
          last_queried_at?: string | null;
          queried_times?: number | null;
          release_group_id?: number;
          resolution?: string;
          reviewed?: boolean;
          rip_type?: string | null;
          subtitle_file_name?: string;
          subtitle_group_id?: number;
          subtitle_link?: string;
          time_to_index_in_s?: number | null;
          title_file_name?: string;
          title_slug?: string;
          torrent_id?: number;
          uploaded_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "Subtitles_release_group_id_fkey";
            columns: ["release_group_id"];
            isOneToOne: false;
            referencedRelation: "ReleaseGroups";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "Subtitles_subtitle_group_id_fkey";
            columns: ["subtitle_group_id"];
            isOneToOne: false;
            referencedRelation: "SubtitleGroups";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "Subtitles_title_slug_fkey";
            columns: ["title_slug"];
            isOneToOne: false;
            referencedRelation: "Titles";
            referencedColumns: ["slug"];
          },
          {
            foreignKeyName: "Subtitles_torrent_id_fkey";
            columns: ["torrent_id"];
            isOneToOne: false;
            referencedRelation: "Torrents";
            referencedColumns: ["id"];
          },
        ];
      };
      SubtitlesNotFound: {
        Row: {
          bytes: number;
          created_at: string;
          email: string | null;
          id: number;
          run_times: number;
          title_file_name: string;
        };
        Insert: {
          bytes: number;
          created_at?: string;
          email?: string | null;
          id?: number;
          run_times?: number;
          title_file_name: string;
        };
        Update: {
          bytes?: number;
          created_at?: string;
          email?: string | null;
          id?: number;
          run_times?: number;
          title_file_name?: string;
        };
        Relationships: [];
      };
      TitleGenres: {
        Row: {
          created_at: string;
          genre_id: number;
          id: number;
          title_id: number;
        };
        Insert: {
          created_at?: string;
          genre_id: number;
          id?: number;
          title_id: number;
        };
        Update: {
          created_at?: string;
          genre_id?: number;
          id?: number;
          title_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "TitleGenres_genre_id_fkey";
            columns: ["genre_id"];
            isOneToOne: false;
            referencedRelation: "Genres";
            referencedColumns: ["genre_id"];
          },
          {
            foreignKeyName: "TitleGenres_title_id_fkey";
            columns: ["title_id"];
            isOneToOne: false;
            referencedRelation: "Titles";
            referencedColumns: ["id"];
          },
        ];
      };
      Titles: {
        Row: {
          backdrop: string | null;
          backdrop_thumbhash: string | null;
          created_at: string;
          id: number;
          imdb_id: string;
          justwatch_id: string | null;
          last_queried_at: string | null;
          letterboxd_id: string | null;
          logo: string | null;
          optimized_backdrop: string | null;
          optimized_logo: string | null;
          optimized_poster: string | null;
          overview: string;
          poster: string | null;
          poster_thumbhash: string | null;
          queried_times: number | null;
          rating: number;
          release_date: string;
          rottentomatoes_id: string | null;
          runtime: number | null;
          searched_times: number | null;
          slug: string;
          spotify_id: string | null;
          title_name: string;
          title_name_ja: string | null;
          title_name_spa: string;
          title_name_without_special_chars: string;
          total_episodes: number | null;
          total_seasons: number | null;
          type: string;
          year: number;
          youtube_id: string | null;
        };
        Insert: {
          backdrop?: string | null;
          backdrop_thumbhash?: string | null;
          created_at?: string;
          id?: number;
          imdb_id: string;
          justwatch_id?: string | null;
          last_queried_at?: string | null;
          letterboxd_id?: string | null;
          logo?: string | null;
          optimized_backdrop?: string | null;
          optimized_logo?: string | null;
          optimized_poster?: string | null;
          overview: string;
          poster?: string | null;
          poster_thumbhash?: string | null;
          queried_times?: number | null;
          rating: number;
          release_date: string;
          rottentomatoes_id?: string | null;
          runtime?: number | null;
          searched_times?: number | null;
          slug: string;
          spotify_id?: string | null;
          title_name: string;
          title_name_ja?: string | null;
          title_name_spa: string;
          title_name_without_special_chars: string;
          total_episodes?: number | null;
          total_seasons?: number | null;
          type: string;
          year: number;
          youtube_id?: string | null;
        };
        Update: {
          backdrop?: string | null;
          backdrop_thumbhash?: string | null;
          created_at?: string;
          id?: number;
          imdb_id?: string;
          justwatch_id?: string | null;
          last_queried_at?: string | null;
          letterboxd_id?: string | null;
          logo?: string | null;
          optimized_backdrop?: string | null;
          optimized_logo?: string | null;
          optimized_poster?: string | null;
          overview?: string;
          poster?: string | null;
          poster_thumbhash?: string | null;
          queried_times?: number | null;
          rating?: number;
          release_date?: string;
          rottentomatoes_id?: string | null;
          runtime?: number | null;
          searched_times?: number | null;
          slug?: string;
          spotify_id?: string | null;
          title_name?: string;
          title_name_ja?: string | null;
          title_name_spa?: string;
          title_name_without_special_chars?: string;
          total_episodes?: number | null;
          total_seasons?: number | null;
          type?: string;
          year?: number;
          youtube_id?: string | null;
        };
        Relationships: [];
      };
      Torrents: {
        Row: {
          created_at: string;
          id: number;
          torrent_bytes: number;
          torrent_link: string;
          torrent_name: string;
          torrent_seeds: number;
          torrent_size: string;
          torrent_tracker: string;
        };
        Insert: {
          created_at?: string;
          id?: number;
          torrent_bytes: number;
          torrent_link: string;
          torrent_name: string;
          torrent_seeds: number;
          torrent_size: string;
          torrent_tracker: string;
        };
        Update: {
          created_at?: string;
          id?: number;
          torrent_bytes?: number;
          torrent_link?: string;
          torrent_name?: string;
          torrent_seeds?: number;
          torrent_size?: string;
          torrent_tracker?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      fuzzy_search_title: {
        Args: { query: string };
        Returns: {
          id: number;
          imdb_id: string;
          title_name: string;
          title_name_spa: string;
          title_name_ja: string;
          year: number;
          type: string;
          slug: string;
          optimized_backdrop: string;
          optimized_poster: string;
          optimized_logo: string;
          searched_times: number;
          queried_times: number;
          poster_thumbhash: string;
          backdrop_thumbhash: string;
          overview: string;
          runtime: number;
          rating: number;
          youtube_id: string;
        }[];
      };
      gtrgm_compress: {
        Args: { "": unknown };
        Returns: unknown;
      };
      gtrgm_decompress: {
        Args: { "": unknown };
        Returns: unknown;
      };
      gtrgm_in: {
        Args: { "": unknown };
        Returns: unknown;
      };
      gtrgm_options: {
        Args: { "": unknown };
        Returns: undefined;
      };
      gtrgm_out: {
        Args: { "": unknown };
        Returns: unknown;
      };
      set_limit: {
        Args: { "": number };
        Returns: number;
      };
      show_limit: {
        Args: Record<PropertyKey, never>;
        Returns: number;
      };
      show_trgm: {
        Args: { "": string };
        Returns: string[];
      };
      sum_queried_times: {
        Args: Record<PropertyKey, never>;
        Returns: number;
      };
      unaccent: {
        Args: { "": string };
        Returns: string;
      };
      unaccent_init: {
        Args: { "": unknown };
        Returns: unknown;
      };
      update_subtitle_and_title_download_metrics: {
        Args: { _title_slug: string; _subtitle_id: number };
        Returns: boolean;
      };
      update_title_search_metrics: {
        Args: { _slug: string };
        Returns: boolean;
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

type DefaultSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"] | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"] | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
