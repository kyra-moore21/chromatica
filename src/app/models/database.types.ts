export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      friendships: {
        Row: {
          created_at: string | null;
          friend_id: string;
          friendship_status: string | null;
          id: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          friend_id: string;
          friendship_status?: string | null;
          id?: string;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          friend_id?: string;
          friendship_status?: string | null;
          id?: string;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'friendships_friend_id_fkey';
            columns: ['friend_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'friendships_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      generated_playlists: {
        Row: {
          id: string;
          playlist_image_url: string | null;
          spotify_playlist_id: string | null;
          user_id: string;
        };
        Insert: {
          id?: string;
          playlist_image_url?: string | null;
          spotify_playlist_id?: string | null;
          user_id: string;
        };
        Update: {
          id?: string;
          playlist_image_url?: string | null;
          spotify_playlist_id?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'generated_playlists_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      generated_songs: {
        Row: {
          artist: string | null;
          id: string;
          playlist_id: string | null;
          song_image_url: string | null;
          spotify_track_id: string | null;
          track_name: string | null;
          user_id: string;
        };
        Insert: {
          artist?: string | null;
          id?: string;
          playlist_id?: string | null;
          song_image_url?: string | null;
          spotify_track_id?: string | null;
          track_name?: string | null;
          user_id: string;
        };
        Update: {
          artist?: string | null;
          id?: string;
          playlist_id?: string | null;
          song_image_url?: string | null;
          spotify_track_id?: string | null;
          track_name?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'generated_songs_playlist_id_fkey';
            columns: ['playlist_id'];
            isOneToOne: false;
            referencedRelation: 'generated_playlists';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'generated_songs_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      user_events: {
        Row: {
          created_at: string | null;
          event: string | null;
          frequency: number | null;
          id: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          event?: string | null;
          frequency?: number | null;
          id?: string;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          event?: string | null;
          frequency?: number | null;
          id?: string;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'user_events_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      user_genres: {
        Row: {
          created_at: string | null;
          frequency: number | null;
          genre: string | null;
          id: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          frequency?: number | null;
          genre?: string | null;
          id?: string;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          frequency?: number | null;
          genre?: string | null;
          id?: string;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'user_genres_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      user_moods: {
        Row: {
          created_at: string | null;
          frequency: number | null;
          id: string;
          mood: string | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          frequency?: number | null;
          id?: string;
          mood?: string | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          frequency?: number | null;
          id?: string;
          mood?: string | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'user_moods_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      user_stats: {
        Row: {
          all_time_most_frequent_event: string | null;
          all_time_most_frequent_genre: string | null;
          all_time_most_frequent_mood: string | null;
          created_at: string | null;
          id: string;
          last_calculated_at: string | null;
          most_frequent_event_1m: string | null;
          most_frequent_event_1w: string | null;
          most_frequent_event_6m: string | null;
          most_frequent_genre_1m: string | null;
          most_frequent_genre_1w: string | null;
          most_frequent_genre_6m: string | null;
          most_frequent_mood_1m: string | null;
          most_frequent_mood_1w: string | null;
          most_frequent_mood_6m: string | null;
          playlists_created: number | null;
          songs_created: number | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          all_time_most_frequent_event?: string | null;
          all_time_most_frequent_genre?: string | null;
          all_time_most_frequent_mood?: string | null;
          created_at?: string | null;
          id?: string;
          last_calculated_at?: string | null;
          most_frequent_event_1m?: string | null;
          most_frequent_event_1w?: string | null;
          most_frequent_event_6m?: string | null;
          most_frequent_genre_1m?: string | null;
          most_frequent_genre_1w?: string | null;
          most_frequent_genre_6m?: string | null;
          most_frequent_mood_1m?: string | null;
          most_frequent_mood_1w?: string | null;
          most_frequent_mood_6m?: string | null;
          playlists_created?: number | null;
          songs_created?: number | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          all_time_most_frequent_event?: string | null;
          all_time_most_frequent_genre?: string | null;
          all_time_most_frequent_mood?: string | null;
          created_at?: string | null;
          id?: string;
          last_calculated_at?: string | null;
          most_frequent_event_1m?: string | null;
          most_frequent_event_1w?: string | null;
          most_frequent_event_6m?: string | null;
          most_frequent_genre_1m?: string | null;
          most_frequent_genre_1w?: string | null;
          most_frequent_genre_6m?: string | null;
          most_frequent_mood_1m?: string | null;
          most_frequent_mood_1w?: string | null;
          most_frequent_mood_6m?: string | null;
          playlists_created?: number | null;
          songs_created?: number | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'user_stats_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      users: {
        Row: {
          avatar_url: string | null;
          created_at: string | null;
          deleted_at: string | null;
          email: string;
          email_notifications: boolean | null;
          friend_count: number | null;
          id: string;
          is_spotify_connected: boolean | null;
          last_spotify_sync: string | null;
          profile_visibility: string | null;
          push_notifications: boolean | null;
          social_score: number | null;
          spotify_id: string | null;
          updated_at: string | null;
          username: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string | null;
          deleted_at?: string | null;
          email: string;
          email_notifications?: boolean | null;
          friend_count?: number | null;
          id?: string;
          is_spotify_connected?: boolean | null;
          last_spotify_sync?: string | null;
          profile_visibility?: string | null;
          push_notifications?: boolean | null;
          social_score?: number | null;
          spotify_id?: string | null;
          updated_at?: string | null;
          username?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string | null;
          deleted_at?: string | null;
          email?: string;
          email_notifications?: boolean | null;
          friend_count?: number | null;
          id?: string;
          is_spotify_connected?: boolean | null;
          last_spotify_sync?: string | null;
          profile_visibility?: string | null;
          push_notifications?: boolean | null;
          social_score?: number | null;
          spotify_id?: string | null;
          updated_at?: string | null;
          username?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database[Extract<keyof Database, 'public'>];

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema['Tables'] & PublicSchema['Views'])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
        Database[PublicTableNameOrOptions['schema']]['Views'])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
      Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema['Tables'] &
      PublicSchema['Views'])
  ? (PublicSchema['Tables'] &
      PublicSchema['Views'])[PublicTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
  ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
  ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema['Enums']
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema['Enums']
  ? PublicSchema['Enums'][PublicEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema['CompositeTypes']
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema['CompositeTypes']
  ? PublicSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
  : never;

export interface Friendship {
  created_at: string | null;
  friend_id: string;
  friendship_status: string | null;
  id: string;
  updated_at: string | null;
  user_id: string;
}

export interface GeneratedPlaylist {
  id: string;
  user_id: string;
  playlist_image_url: string | null;
  spotify_playlist_id: string | null;
  added_to_spotify: boolean;
}

export interface GeneratedSong {
  id: string;
  user_id: string;
  playlist_id: string | null;
  song_image_url: string | null;
  track_name: string;
  artist: string;
  spotify_track_id: string;
  preview_url: string | null;
  added_to_spotify: boolean;
}

export interface UserEvent {
  created_at: string | null;
  event: string | null;
  frequency: number | null;
  id: string;
  updated_at: string | null;
  user_id: string;
}

export interface UserGenre {
  created_at: string | null;
  frequency: number | null;
  genre: string | null;
  id: string;
  updated_at: string | null;
  user_id: string;
}

export interface UserMood {
  created_at: string | null;
  frequency: number | null;
  id: string;
  mood: string | null;
  updated_at: string | null;
  user_id: string;
}

export interface UserStat {
  all_time_most_frequent_event: string | null;
  all_time_most_frequent_genre: string | null;
  all_time_most_frequent_mood: string | null;
  created_at: string | null;
  id: string;
  last_calculated_at: string | null;
  most_frequent_event_1m: string | null;
  most_frequent_event_1w: string | null;
  most_frequent_event_6m: string | null;
  most_frequent_genre_1m: string | null;
  most_frequent_genre_1w: string | null;
  most_frequent_genre_6m: string | null;
  most_frequent_mood_1m: string | null;
  most_frequent_mood_1w: string | null;
  most_frequent_mood_6m: string | null;
  playlists_created: number | null;
  songs_created: number | null;
  updated_at: string | null;
  user_id: string;
}

export interface User {
  avatar_url: string | null;
  created_at: string | null;
  deleted_at: string | null;
  email: string;
  email_notifications: boolean | null;
  friend_count: number | null;
  id: string;
  is_spotify_connected: boolean | null;
  last_spotify_sync: string | null;
  profile_visibility: string | null;
  push_notifications: boolean | null;
  social_score: number | null;
  spotify_id: string | null;
  updated_at: string | null;
  username: string | null;
}
