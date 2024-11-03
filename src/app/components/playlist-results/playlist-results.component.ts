import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { GeneratedSong } from '../../models/database.types';
import { addIcons } from 'ionicons';
import { IonIcon, NavController } from '@ionic/angular/standalone';
import { close, pause, play } from 'ionicons/icons';
import { ActivatedRoute, Router } from '@angular/router';
import { FormService } from '../../services/form.service';
import { CommonModule } from '@angular/common';
import { SpotifyService } from '../../services/spotify-service.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-playlist-results',
  templateUrl: './playlist-results.component.html',
  styleUrls: ['./playlist-results.component.scss'],
  imports: [IonIcon, CommonModule, FormsModule],
  standalone: true,
})
export class PlaylistResultsComponent implements OnInit {
  @ViewChild('my_modal_3') modal!: ElementRef<HTMLDialogElement>;
  emotionName: number = 0;
  eventName: number = 0;
  genreName: number = 0;
  recommendations: (GeneratedSong & { isSelected?: boolean })[] = [];
  currentlyPlayingIndex: number | null = null;
  audioElement: HTMLAudioElement | null = null;
  spotifyPlaylistLink: string = '';
  playlistName!: string;
  isAdded: boolean = false;
  spotifyPlaylistUrl!: string;

  fillerRecommendation: (GeneratedSong & { isSelected?: boolean })[] =
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
        isSelected: true,
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
        isSelected: true,
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
        isSelected: true,
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
        isSelected: true,
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
        isSelected: true,
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
        isSelected: true,
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
        isSelected: true,
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
        isSelected: true,
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
        isSelected: true,
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
        isSelected: true,
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
        isSelected: true,
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
        isSelected: true,
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
        isSelected: true,
      },
    ];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private formService: FormService,
    private spotifyService: SpotifyService,
    private navCtrl: NavController
  ) {
    addIcons({ play, pause, close });
  }

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.emotionName = params['emotion'] || 'None';
      this.eventName = params['event'] || 'None';
      this.genreName = params['genre'] || 'None';
      this.loadRecommendation();
    });
  }
  loadRecommendation() {
    this.recommendations = this.formService.getRecommendation().map(song => ({
      ...song,
      isSelected: true
    }));
  }


  togglePlayPause(index: number) {
    if (this.currentlyPlayingIndex === index) {
      // Pause the currently playing song
      this.audioElement?.pause();
      this.currentlyPlayingIndex = null;
    } else {
      // Stop the currently playing song (if any)
      if (this.audioElement) {
        this.audioElement.pause();
        this.audioElement = null;
      }

      // Play the new song
      const song = this.recommendations[index];
      if (song.preview_url) {
        this.audioElement = new Audio(song.preview_url);
        this.audioElement.play();
        this.currentlyPlayingIndex = index;

        // Add ended event listener
        this.audioElement.addEventListener('ended', () => {
          this.currentlyPlayingIndex = null;
        });
      }
    }
  }

  isPlaying(index: number): boolean {
    return this.currentlyPlayingIndex === index;
  }
  navigateToHome() {
    this.audioElement?.pause();
    this.navCtrl.navigateForward(['/tabs/home'], { animated: false });
  }

  CreateSpotifyPlaylist(name: string, visibility: boolean, recommendation: GeneratedSong[]) {
    const spotifyId = this.getSpotifyId();
    if (!spotifyId) {
      console.error('No Spotify ID available');
      return;
    }

    const selectedSongs = this.recommendations.filter(song => song.isSelected);
    const trackIds: string[] = selectedSongs.map(data => data.spotify_track_id);

    if (trackIds.length === 0) {
      console.error('No songs selected');
      return;
    }

    this.spotifyService.createAndAddTracksToPlaylist(name, visibility, spotifyId, trackIds, this.emotionName)
      .subscribe({
        next: (response) => {
          let playlistId = recommendation[1].playlist_id;
          var response = response;
          if (playlistId != null) {
            this.spotifyService.addPlaylistCoverImage(response.playlist.id, this.emotionName)
              .catch(error => {
                console.error('Error uploading playlist cover:', error);
              });
            this.formService.updatePlaylist(playlistId, response.playlist.id);
            this.spotifyPlaylistUrl = `https://open.spotify.com/playlist/${response.playlist.id}`;
          }
          this.isAdded = true;
          this.modal.nativeElement.close();
        }
      })
  }

  getSpotifyId(): string | null {
    const userDataString = localStorage.getItem('user');

    if (!userDataString) {
      console.error('No user data found in localStorage');
      return null;
    }

    try {
      const userData = JSON.parse(userDataString);
      return userData.spotify_id;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }
}
