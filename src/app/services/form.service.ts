import { Injectable } from '@angular/core';
import { GeneratedSong, User } from '../models/database.types';
import { SupabaseService } from './supabase.service';
import { ToastService } from '../shared/toast/toast.service';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root',
})
export class FormService {
  private recommendation: GeneratedSong[] = [];
  private user: User | null = null;

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
    generationType: 'Song' | 'Playlist'
  ) {
    this.recommendation = recommendation;
    await this.addSongsToDatabase(this.recommendation, generationType);
  }

  async addSongsToDatabase(
    recommendation: GeneratedSong[],
    generationType: 'Song' | 'Playlist'
  ) {
    const supabase = this.supabase.getClient();
    try {
      if (!this.user || !this.user.id) {
        throw new Error('User is not authenticated');
      }
      let playlistId: string | null = null;

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

      const songsWithUserId = recommendation.map((recommendation) => ({
        user_id: this.user!.id,
        track_name: recommendation.track_name,
        playlist_id: playlistId,
        artist: recommendation.artist,
        spotify_track_id: recommendation.spotify_track_id,
        song_image_url: recommendation.song_image_url,
        preview_url: recommendation.preview_url,
        added_to_spotify: false, // Assuming this is a default value
      }));

      const { data, error } = await supabase
        .from('generated_songs')
        .insert(songsWithUserId);

      if (error) throw error;

      console.log('Songs added successfully:', data);
    } catch (error: any) {
      this.toastService.showToast(
        this.commonService.lowercaseRemoveStop(error.message),
        'error'
      );
      console.error('Error adding songs to database:', error);
    }
  }

  //toggle selection between enum and none
  toggleSelection(
    currentSelection: any,
    newSelection: any,
    enumNoneValue: any
  ): any {
    return currentSelection === newSelection ? enumNoneValue : newSelection;
  }
  getRecommendation() {
    return this.recommendation;
  }
}
