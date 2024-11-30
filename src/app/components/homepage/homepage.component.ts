import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterOutlet, Router, ActivatedRoute } from '@angular/router';
import { IonicModule, NavController } from '@ionic/angular';
import { SupabaseService } from '../../services/supabase.service';
import { GeneratedPlaylist, GeneratedSong } from '../../models/database.types';
import { play } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { ToastService } from '../../shared/toast/toast.service';
import { NetworkService } from '../../services/network.service';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss'],
  imports: [IonicModule],
  standalone: true,
})
export class HomepageComponent implements OnInit {
  emotionName: string = '';
  eventName: string = '';
  genreName: string = '';
  songs: GeneratedSong[] = [];
  playlists: GeneratedPlaylist[] = [];
  constructor(
    private changeDetector: ChangeDetectorRef,
    private supabaseService: SupabaseService,
    private navCtrl: NavController,
    private toast: ToastService,
    private network: NetworkService
  ) {
    addIcons({ play });
  }

  navigateToForm(type: 'Song' | 'Playlist') {
    this.navCtrl.navigateForward(['/form'], {
      queryParams: { type: type },
      animated: false,
    });
  }

  title = 'chromatica';
  fillerRecommendation: (GeneratedSong)[] =
    [
      {
        id: '123',
        user_id: 'abc',
        playlist_id: null,
        song_image_url: "https://via.placeholder.com/300",
        track_name: "Sample Track 1",
        artist: "Sample Artist 1",
        spotify_track_id: "12345abcde",
        preview_url: "https://via.placeholder.com/300",
        added_to_spotify: false,
      },
      {
        id: '123',
        user_id: 'abc',
        playlist_id: null,
        song_image_url: "https://via.placeholder.com/300",
        track_name: "Sample Track 1",
        artist: "Sample Artist 1",
        spotify_track_id: "12345abcde",
        preview_url: "https://via.placeholder.com/300",
        added_to_spotify: false,
      },
      {
        id: '123',
        user_id: 'abc',
        playlist_id: null,
        song_image_url: "https://via.placeholder.com/300",
        track_name: "Sample Track 1",
        artist: "Sample Artist 1",
        spotify_track_id: "12345abcde",
        preview_url: "https://via.placeholder.com/300",
        added_to_spotify: false,
      },
      {
        id: '123',
        user_id: 'abc',
        playlist_id: null,
        song_image_url: "https://via.placeholder.com/300",
        track_name: "Sample Track 1",
        artist: "Sample Artist 1",
        spotify_track_id: "12345abcde",
        preview_url: "https://via.placeholder.com/300",
        added_to_spotify: false,
      },
      {
        id: '123',
        user_id: 'abc',
        playlist_id: null,
        song_image_url: "https://via.placeholder.com/300",
        track_name: "Sample Track 1",
        artist: "Sample Artist 1",
        spotify_track_id: "12345abcde",
        preview_url: "https://via.placeholder.com/300",
        added_to_spotify: false,
      },
      {
        id: '123',
        user_id: 'abc',
        playlist_id: null,
        song_image_url: "https://via.placeholder.com/300",
        track_name: "Sample Track 1",
        artist: "Sample Artist 1",
        spotify_track_id: "12345abcde",
        preview_url: "https://via.placeholder.com/300",
        added_to_spotify: false,
      },
      {
        id: '123',
        user_id: 'abc',
        playlist_id: null,
        song_image_url: "https://via.placeholder.com/300",
        track_name: "Sample Track 1",
        artist: "Sample Artist 1",
        spotify_track_id: "12345abcde",
        preview_url: "https://via.placeholder.com/300",
        added_to_spotify: false,
      },

      {
        id: '123',
        user_id: 'abc',
        playlist_id: null,
        song_image_url: "https://via.placeholder.com/300",
        track_name: "Sample Track 1",
        artist: "Sample Artist 1",
        spotify_track_id: "12345abcde",
        preview_url: "https://via.placeholder.com/300",
        added_to_spotify: false,
      },
      {
        id: '123',
        user_id: 'abc',
        playlist_id: null,
        song_image_url: "https://via.placeholder.com/300",
        track_name: "Sample Track 1",
        artist: "Sample Artist 1",
        spotify_track_id: "12345abcde",
        preview_url: "https://via.placeholder.com/300",
        added_to_spotify: false,
      },
      {
        id: '123',
        user_id: 'abc',
        playlist_id: null,
        song_image_url: "https://via.placeholder.com/300",
        track_name: "Sample Track 1",
        artist: "Sample Artist 1",
        spotify_track_id: "12345abcde",
        preview_url: "https://via.placeholder.com/300",
        added_to_spotify: false,
      },
      {
        id: '123',
        user_id: 'abc',
        playlist_id: null,
        song_image_url: "https://via.placeholder.com/300",
        track_name: "Sample Track 1",
        artist: "Sample Artist 1",
        spotify_track_id: "12345abcde",
        preview_url: "https://via.placeholder.com/300",
        added_to_spotify: false,
      },
      {
        id: '123',
        user_id: 'abc',
        playlist_id: null,
        song_image_url: "https://via.placeholder.com/300",
        track_name: "Sample Track 1",
        artist: "Sample Artist 1",
        spotify_track_id: "12345abcde",
        preview_url: "https://via.placeholder.com/300",
        added_to_spotify: false,
      },
      {
        id: '123',
        user_id: 'abc',
        playlist_id: null,
        song_image_url: "https://via.placeholder.com/300",
        track_name: "Sample Track 1",
        artist: "Sample Artist 1",
        spotify_track_id: "12345abcde",
        preview_url: "https://via.placeholder.com/300",
        added_to_spotify: false,
      },
    ];

  ngOnInit() {
    this.changeDetector.detectChanges();

    //get user from local storage and check if username is null
    const cachedUser = localStorage.getItem('user');
    const cachedUsername = cachedUser ? JSON.parse(cachedUser).username : null;

    if (!cachedUsername) {
      this.navCtrl.navigateForward('/choose-username', { animated: false });
    }
    this.getSpotifyPlaylists();
    this.getSpotifySongs();
    console.log('Is native platform:', Capacitor.isNativePlatform());
    console.log('Platform:', Capacitor.getPlatform());

  }

  private async getSpotifyPlaylists() {
    await this.supabaseService.getClient()
      .from('generated_playlists')
      .select('playlist_image_url, spotify_playlist_id')
      .eq('added_to_spotify', true)
      .limit(10)
      .then((data) => {
        if (data.error) {
          console.error('Error fetching playlists:', data.error);
          this.toast.showToast('Error fetching playlists', 'error');
        }
        else {
          console.log('Playlists:', data.data);
          this.playlists = data.data.map((playlist: any) => ({
            ...playlist,
            id: '',
            user_id: '',
            added_to_spotify: true
          }));
        }
      })
  }

  private async getSpotifySongs() {
    await this.supabaseService.getClient()
      .from('generated_songs')
      .select('song_image_url, spotify_track_id, track_name, artist')
      // .is('playlist_id', null)
      .eq('added_to_spotify', true)
      .limit(10)
      .then((data) => {
        if (data.error) {
          console.error('Error fetching songs:', data.error);
          this.toast.showToast('Error fetching songs', 'error');
        }
        else {
          console.log('Songs:', data.data);
          this.songs = data.data.map((song: any) => ({
            ...song,
            id: '',
            user_id: '',
            added_to_spotify: true
          }));
        }
      })
  }

  async train() {
    await this.network.train();
  }
}
