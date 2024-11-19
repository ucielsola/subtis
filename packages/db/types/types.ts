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
          file_attributes: string[];
          id: number;
          is_supported: boolean | null;
          query_matches: string[];
          release_group_name: string;
        };
        Insert: {
          created_at?: string;
          file_attributes: string[];
          id?: number;
          is_supported?: boolean | null;
          query_matches: string[];
          release_group_name: string;
        };
        Update: {
          created_at?: string;
          file_attributes?: string[];
          id?: number;
          is_supported?: boolean | null;
          query_matches?: string[];
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
          title_file_name: string;
          title_imdb_id: string;
          torrent_id: number;
          uploaded_by: string | null;
        };
        Insert: {
          author?: string | null;
          bytes: number;
          created_at?: string;
          current_episode?: number | null;
          current_season?: number | null;
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
          title_file_name: string;
          title_imdb_id: string;
          torrent_id: number;
          uploaded_by?: string | null;
        };
        Update: {
          author?: string | null;
          bytes?: number;
          created_at?: string;
          current_episode?: number | null;
          current_season?: number | null;
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
          title_file_name?: string;
          title_imdb_id?: string;
          torrent_id?: number;
          uploaded_by?: string | null;
        };
        Relationships: [
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
          {
            foreignKeyName: "Subtitles_title_imdb_id_fkey";
            columns: ["title_imdb_id"];
            isOneToOne: false;
            referencedRelation: "Titles";
            referencedColumns: ["imdb_id"];
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
          created_at: string;
          id: number;
          imdb_id: string;
          last_queried_at: string | null;
          logo: string | null;
          overview: string;
          poster: string | null;
          queried_times: number | null;
          rating: number;
          release_date: string;
          searched_times: number | null;
          title_name: string;
          title_name_spa: string;
          title_name_without_special_chars: string;
          total_episodes: number | null;
          total_seasons: number | null;
          type: string;
          year: number;
        };
        Insert: {
          backdrop?: string | null;
          created_at?: string;
          id?: number;
          imdb_id: string;
          last_queried_at?: string | null;
          logo?: string | null;
          overview: string;
          poster?: string | null;
          queried_times?: number | null;
          rating: number;
          release_date: string;
          searched_times?: number | null;
          title_name: string;
          title_name_spa: string;
          title_name_without_special_chars: string;
          total_episodes?: number | null;
          total_seasons?: number | null;
          type: string;
          year: number;
        };
        Update: {
          backdrop?: string | null;
          created_at?: string;
          id?: number;
          imdb_id?: string;
          last_queried_at?: string | null;
          logo?: string | null;
          overview?: string;
          poster?: string | null;
          queried_times?: number | null;
          rating?: number;
          release_date?: string;
          searched_times?: number | null;
          title_name?: string;
          title_name_spa?: string;
          title_name_without_special_chars?: string;
          total_episodes?: number | null;
          total_seasons?: number | null;
          type?: string;
          year?: number;
        };
        Relationships: [];
      };
      Torrents: {
        Row: {
          created_at: string;
          id: number;
          torrent_link: string;
          torrent_name: string;
          torrent_seeds: number;
          torrent_size: string;
          torrent_tracker: string;
        };
        Insert: {
          created_at?: string;
          id?: number;
          torrent_link: string;
          torrent_name: string;
          torrent_seeds: number;
          torrent_size: string;
          torrent_tracker: string;
        };
        Update: {
          created_at?: string;
          id?: number;
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
        Args: {
          query: string;
        };
        Returns: {
          id: number;
          imdb_id: string;
          title_name: string;
          year: number;
          type: string;
          backdrop: string;
          poster: string;
          searched_times: number;
          queried_times: number;
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
      set_limit: {
        Args: {
          "": number;
        };
        Returns: number;
      };
      show_trgm: {
        Args: {
          "": string;
        };
        Returns: string[];
      };
      update_subtitle_and_title_download_metrics: {
        Args: {
          _imdb_id: string;
          _subtitle_id: number;
        };
        Returns: boolean;
      };
      update_title_search_metrics: {
        Args: {
          _imdb_id: string;
        };
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

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"] | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;
