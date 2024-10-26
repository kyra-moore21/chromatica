import { Injectable } from '@angular/core';
import { GeneratedSong, User } from '../models/database.types';
import { SupabaseService } from '../shared/supabase.service';
import { ToastService } from '../shared/toast/toast.service';
import { CommonService } from '../shared/common.service';
import { catchError, from, Observable, tap } from 'rxjs';

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
}
