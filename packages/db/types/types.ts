export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      ReleaseGroups: {
        Row: {
          created_at: string;
          file_attributes: string[];
          id: number;
          is_supported: boolean | null;
          release_group_name: string;
          searchable_opensubtitles_name: string[] | null;
          searchable_subdivx_name: string[];
        };
        Insert: {
          created_at?: string;
          file_attributes: string[];
          id?: number;
          is_supported?: boolean | null;
          release_group_name: string;
          searchable_opensubtitles_name?: string[] | null;
          searchable_subdivx_name: string[];
        };
        Update: {
          created_at?: string;
          file_attributes?: string[];
          id?: number;
          is_supported?: boolean | null;
          release_group_name?: string;
          searchable_opensubtitles_name?: string[] | null;
          searchable_subdivx_name?: string[];
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
          lang: string;
          last_queried_at: string | null;
          queried_times: number | null;
          release_group_id: number;
          resolution: string;
          reviewed: boolean;
          subtitle_file_name: string;
          subtitle_group_id: number;
          subtitle_link: string;
          title_file_name: string;
          title_id: number;
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
          lang: string;
          last_queried_at?: string | null;
          queried_times?: number | null;
          release_group_id: number;
          resolution: string;
          reviewed: boolean;
          subtitle_file_name: string;
          subtitle_group_id: number;
          subtitle_link: string;
          title_file_name: string;
          title_id: number;
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
          lang?: string;
          last_queried_at?: string | null;
          queried_times?: number | null;
          release_group_id?: number;
          resolution?: string;
          reviewed?: boolean;
          subtitle_file_name?: string;
          subtitle_group_id?: number;
          subtitle_link?: string;
          title_file_name?: string;
          title_id?: number;
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
            foreignKeyName: "Subtitles_title_id_fkey";
            columns: ["title_id"];
            isOneToOne: false;
            referencedRelation: "Titles";
            referencedColumns: ["id"];
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
          created_at: string;
          email: string | null;
          id: number;
          run_times: number;
          title_file_name: string;
        };
        Insert: {
          created_at?: string;
          email?: string | null;
          id?: number;
          run_times?: number;
          title_file_name: string;
        };
        Update: {
          created_at?: string;
          email?: string | null;
          id?: number;
          run_times?: number;
          title_file_name?: string;
        };
        Relationships: [];
      };
      Titles: {
        Row: {
          backdrop: string | null;
          created_at: string;
          id: number;
          logo: string | null;
          overview: string;
          poster: string | null;
          rating: number;
          release_date: string;
          title_name: string;
          title_name_spa: string;
          total_episodes: number | null;
          total_seasons: number | null;
          type: string;
          year: number;
        };
        Insert: {
          backdrop?: string | null;
          created_at?: string;
          id?: number;
          logo?: string | null;
          overview: string;
          poster?: string | null;
          rating: number;
          release_date: string;
          title_name: string;
          title_name_spa: string;
          total_episodes?: number | null;
          total_seasons?: number | null;
          type: string;
          year: number;
        };
        Update: {
          backdrop?: string | null;
          created_at?: string;
          id?: number;
          logo?: string | null;
          overview?: string;
          poster?: string | null;
          rating?: number;
          release_date?: string;
          title_name?: string;
          title_name_spa?: string;
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
          torrent_size: number;
          torrent_tracker: string;
        };
        Insert: {
          created_at?: string;
          id?: number;
          torrent_link: string;
          torrent_name: string;
          torrent_seeds: number;
          torrent_size: number;
          torrent_tracker: string;
        };
        Update: {
          created_at?: string;
          id?: number;
          torrent_link?: string;
          torrent_name?: string;
          torrent_seeds?: number;
          torrent_size?: number;
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
          title_name: string;
          year: number;
          type: string;
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
          _title_file_name: string;
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
          _title_file_name: string;
        };
        Returns: undefined;
      };
      update_subtitles_info: {
        Args: {
          _title_id: string;
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
