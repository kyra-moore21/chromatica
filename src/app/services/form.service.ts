import { Injectable } from '@angular/core';
import { GeneratedSong, User } from '../models/database.types';
import { SupabaseService } from '../shared/supabase.service';
import { ToastService } from '../shared/toast/toast.service';
import { CommonService } from '../shared/common.service';
import { catchError, from, Observable, tap } from 'rxjs';
import { Emotions, Genres } from '../../../supabase/functions/emotion-event-enum';

@Injectable({
  providedIn: 'root',
})
export class FormService {
  private recommendation: GeneratedSong[] = [];
  private user: User = {} as User;

  constructor(
    private supabase: SupabaseService,
    private toastService: ToastService,
    private commonService: CommonService
  ) {
    this.loadUser();
  }

  //convert enum to name
  convertEnumName(enumType: any, value: number): string {
    const enumEntry = Object.entries(enumType).find(
      ([key, val]) => val === value
    );
    return enumEntry ? enumEntry[0] : 'None';
  }
  private loadUser() {
    const cachedUser = localStorage.getItem('user');
    this.user = cachedUser ? JSON.parse(cachedUser) : null;
  }

  async setRecommendation(
    recommendation: GeneratedSong[],
    generationType: 'Song' | 'Playlist') {
    const supabase = this.supabase.getClient();

    try {
      let playlistId: string | null = null;

      // Create playlist if needed
      if (generationType === 'Playlist') {
        const { data: playlistData, error: playlistError } = await supabase
          .from('generated_playlists')
          .insert({
            user_id: this.user.id,
            playlist_image_url: recommendation[0]?.song_image_url || null,
            spotify_playlist_id: null,
            added_to_spotify: false,
          })
          .select('id')
          .single();

        if (playlistError) throw playlistError;
        playlistId = playlistData.id;
      }

      // Insert songs
      const { data: insertedSongs, error } = await supabase
        .from('generated_songs')
        .insert(
          recommendation.map(song => ({
            user_id: this.user.id,
            track_name: song.track_name,
            playlist_id: playlistId,
            artist: song.artist,
            spotify_track_id: song.spotify_track_id,
            song_image_url: song.song_image_url,
            preview_url: song.preview_url,
            added_to_spotify: false,
          }))
        )
        .select('*');

      if (error) throw error;

      // Map back to GeneratedSong type with IDs
      const songsWithIds = insertedSongs.map((dbSong: any) => ({
        ...recommendation.find(r => r.spotify_track_id === dbSong.spotify_track_id)!,
        id: dbSong.id,
        playlist_id: dbSong.playlist_id,
        added_to_spotify: dbSong.added_to_spotify,
      }));

      this.recommendation = songsWithIds;
      return songsWithIds;

      //below can we used to test without adding to db 
      // this.recommendation = recommendation;
      // return recommendation;

    } catch (error: any) {
      this.toastService.showToast(error.message, 'error');
      throw error;
    }
  }

  async updateIndividualSong(songId: string) {
    const supabase = this.supabase.getClient();

    try {
      const { error: songError } = await supabase
        .from('generated_songs')
        .update({ added_to_spotify: true })
        .eq('id', songId);

      if (songError) throw songError;

    } catch (error: any) {
      console.error('Error updating song:', error);
      throw error;
    }
  }

  async updatePlaylist(playlistId: string) {
    const supabase = this.supabase.getClient();
    try {
      //update the playlist
      const { data: playlistData, error: playlistError } = await supabase
        .from('generated_playlists')
        .update({ added_to_spotify: true })
        .eq('id', playlistId)
      if (playlistError) throw playlistError;
    } catch (error: any) {
      throw error
    }
  }

  //toggle selection between enum and none
  toggleSelection(
    currentSelection: any,
    newSelection: any,
    enumNoneValue: any): any {
    return currentSelection === newSelection ? enumNoneValue : newSelection;
  }

  getRecommendation() {
    return this.recommendation;
  }

  async updateUserMoodGenreEvents(event: string, emotion: string, genre: string) {
    const userId = this.user.id;
    if (!userId) {
      throw new Error('User is not authenticated');
    }

    try {
      // Check and update user_events
      await this.upsertUserEvent(userId, event);

      // Check and update user_moods
      await this.upsertUserMood(userId, emotion);

      // Check and update user_genres
      await this.upsertUserGenre(userId, genre);
    } catch (error) {
      console.error('Error updating user data:', error);
    }
  }

  private async upsertUserEvent(userId: string, event: string) {
    if (event.toLowerCase() === "none") {
      return;
    }
    const { data, error } = await this.supabase.getClient()
      .from('user_events')
      .select('*')
      .eq('user_id', userId)
      .eq('event', event)
      .single();

    if (error && error.code !== 'PGRST116') {
      // Error handling other than "no record found"
      throw error;
    }

    if (data) {
      // Update the existing record
      const { error: updateError } = await this.supabase.getClient()
        .from('user_events')
        .update({
          frequency: (data.frequency || 0) + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', data.id);

      if (updateError) throw updateError;
    } else {
      // Insert a new record
      const { error: insertError } = await this.supabase.getClient()
        .from('user_events')
        .insert({
          user_id: userId,
          event,
          frequency: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (insertError) throw insertError;
    }
  }

  private async upsertUserMood(userId: string, mood: string) {
    if (mood.toLowerCase() === "none") {
      return;
    }
    const { data, error } = await this.supabase.getClient()
      .from('user_moods')
      .select('*')
      .eq('user_id', userId)
      .eq('mood', mood)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    if (data) {
      const { error: updateError } = await this.supabase.getClient()
        .from('user_moods')
        .update({
          frequency: (data.frequency || 0) + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', data.id);

      if (updateError) throw updateError;
    } else {
      const { error: insertError } = await this.supabase.getClient()
        .from('user_moods')
        .insert({
          user_id: userId,
          mood,
          frequency: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (insertError) throw insertError;
    }
  }

  private async upsertUserGenre(userId: string, genre: string) {
    if (genre.toLowerCase() === "none") {
      return;
    }
    const { data, error } = await this.supabase.getClient()
      .from('user_genres')
      .select('*')
      .eq('user_id', userId)
      .eq('genre', genre)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    if (data) {
      const { error: updateError } = await this.supabase.getClient()
        .from('user_genres')
        .update({
          frequency: (data.frequency || 0) + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', data.id);

      if (updateError) throw updateError;
    } else {
      const { error: insertError } = await this.supabase.getClient()
        .from('user_genres')
        .insert({
          user_id: userId,
          genre,
          frequency: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (insertError) throw insertError;
    }
  }

}
