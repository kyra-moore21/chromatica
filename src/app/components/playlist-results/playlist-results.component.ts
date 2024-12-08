import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { GeneratedSong } from '../../models/database.types';
import { addIcons } from 'ionicons';
import { IonIcon, NavController } from '@ionic/angular/standalone';
import { close, pause, play } from 'ionicons/icons';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormService } from '../../services/form.service';
import { CommonModule } from '@angular/common';
import { SpotifyService } from '../../services/spotify-service.service';
import { FormsModule } from '@angular/forms';
import { IsLoadingComponent } from '../is-loading/is-loading.component';
import { firstValueFrom, from } from 'rxjs';

@Component({
  selector: 'app-playlist-results',
  templateUrl: './playlist-results.component.html',
  styleUrls: ['./playlist-results.component.scss'],
  imports: [IonIcon, CommonModule, FormsModule, IsLoadingComponent, RouterModule],
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
  isLoading: boolean = true;

  fillerRecommendation: (GeneratedSong & { isSelected?: boolean })[] =
    [
      {
        id: '123',
        user_id: 'abc',
        playlist_id: null,
        song_image_url: "https://images.genius.com/f26ec26731c9b17fc3ec86b31dd19e21.1000x1000x1.jpg",
        track_name: "Cheekbones",
        artist: "Arrows in Action",
        spotify_track_id: "1urqCVjzIqn8cJWVS9P6Al",
        preview_url: "fakepreviewurlforlooks.com",
        added_to_spotify: false,
        isSelected: true,
        type: 'song',
      },
      {
        id: '123',
        user_id: 'abc',
        playlist_id: null,
<<<<<<< HEAD
        song_image_url: "https://d13fy1xtnzm9jo.cloudfront.net/ktiv59oy/1000x1000",
        track_name: "Sleeptalk",
        artist: "Dayseeker",
        spotify_track_id: "53Ssvy5Rww0BPTtOw375zW",
        preview_url: "fakepreviewurlforlooks.com",
=======
        song_image_url: "https://via.placeholder.com/300",
        track_name: "Sample Track 1",
        artist: "Sample Artist 1",
        spotify_track_id: "12345abcde",
        preview_url: "https://via.placeholder.com/300",
        added_to_spotify: false,
        isSelected: true,
        type: 'song',
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
>>>>>>> 7574716d8d290711ba0b543a410f274fdc3c9bb2
        added_to_spotify: false,
        isSelected: true,
        type: 'song'
      },
      {
        id: '123',
        user_id: 'abc',
        playlist_id: null,
        song_image_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ9m2m5hCd_giXaIjCSVmrbYyI8yxH5ML4wlg&s",
        track_name: "Kool-Aid",
        artist: "Bring Me The Horizon",
        spotify_track_id: "0hpWmAB3L0OJ3VBeMkOQUu",
        preview_url: "fakepreviewurlforlooks.com",
        added_to_spotify: false,
        isSelected: true,
        type: 'song'
      },
      {
        id: '123',
        user_id: 'abc',
        playlist_id: null,
        song_image_url: "https://i.scdn.co/image/ab67616d0000b2731356d39922ba5da84c36c352",
        track_name: "Medicate Me",
        artist: "Rain City Drive",
        spotify_track_id: "2sfH7KtjAnWv1algu94TR5",
        preview_url: "fakepreviewurlforlooks.com",
        added_to_spotify: false,
        isSelected: true,
        type: 'song'
      },
      {
        id: '123',
        user_id: 'abc',
        playlist_id: null,
        song_image_url: "https://images.genius.com/f5a88025a9e0037122a469e2341a1148.300x300x1.jpg",
        track_name: "Stuck In My Head",
        artist: "Sleep Theory",
        spotify_track_id: "35N9LmzkCjMd2ZmAATzG6U",
        preview_url: "fakepreviewurlforlooks.com",
        added_to_spotify: false,
        isSelected: true,
        type: 'song'
      },
      {
        id: '123',
        user_id: 'abc',
        playlist_id: null,
        song_image_url: "https://images.genius.com/ff8a379860bf8c10b594c5a799d1ea2d.600x600x1.jpg",
        track_name: "Blackout",
        artist: "Versus Me",
        spotify_track_id: "5HcvyLVQgHszX7Fq11s2IW",
        preview_url: "fakepreviewurlforlooks.com",
        added_to_spotify: false,
        isSelected: true,
        type: 'song'
      },

      {
        id: '123',
        user_id: 'abc',
        playlist_id: null,
        song_image_url: "https://upload.wikimedia.org/wikipedia/en/4/48/SleepTokenTMBTE.jpg",
        track_name: "Rain",
        artist: "Sleep Token",
        spotify_track_id: "0GXwlEXCO8qeeeOIYpsR3m",
        preview_url: "fakepreviewurlforlooks.com",
        added_to_spotify: false,
        isSelected: true,
        type: 'song'
      },
      {
        id: '123',
        user_id: 'abc',
        playlist_id: null,
        song_image_url: "https://i.scdn.co/image/ab67616d0000b2739c7522c8caa3d7ebd41f6d65",
        track_name: "Outside",
        artist: "breakk.away",
        spotify_track_id: "0iDB1lbAm2TCnsxPVnaEN6",
        preview_url: "fakepreviewurlforlooks.com",
        added_to_spotify: false,
        isSelected: true,
        type: 'song'
      },
      {
        id: '123',
        user_id: 'abc',
        playlist_id: null,
        song_image_url: "https://i1.sndcdn.com/artworks-E31e8UYdDmmr-0-t500x500.jpg",
        track_name: "Jaded",
        artist: "Spiritbox",
        spotify_track_id: "6IdyYbGg1jxiWhfwm2Ykjn",
        preview_url: "fakepreviewurlforlooks.com",
        added_to_spotify: false,
        isSelected: true,
        type: 'song'
      },
      {
        id: '123',
        user_id: 'abc',
        playlist_id: null,
        song_image_url: "https://m.media-amazon.com/images/I/71JC+y8jRcL._UF1000,1000_QL80_.jpg",
        track_name: "666.66",
        artist: "Weird Dreams",
        spotify_track_id: "19F9lCREdEYM0eqcCNXC7E",
        preview_url: "fakepreviewurlforlooks.com",
        added_to_spotify: false,
        isSelected: true,
        type: 'song'
      }
    ];

  constructor(
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
  async loadRecommendation() {
    this.recommendations = this.fillerRecommendation;
    this.isLoading = false;
    // await this.formService.getRecommendation().map(song => ({
    //   ...song,
    //   isSelected: true
    // }));
    // this.isLoading = false;
    // if (this.recommendations.length === 0 || !this.recommendations) {
    //   this.isLoading = false;
    //   this.navCtrl.navigateForward(['/tabs/home'], { animated: false });
    // }
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

  async createSpotifyPlaylist(visibility: boolean, recommendation: GeneratedSong[]) {
    const spotifyId = this.getSpotifyId();
    const playlistName = `${this.emotionName.toString().toLowerCase()}, ${this.eventName.toString().toLowerCase()} playlist`;

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

    this.isLoading = true;

    const response = await firstValueFrom(
      this.spotifyService.createAndAddTracksToPlaylist(
        playlistName,
        visibility,
        spotifyId,
        trackIds,
        this.emotionName
      )
    );

    const spotifyPlaylistId = response.playlist.id;
    // const playlistId = recommendation[1].playlist_id;

    if (spotifyPlaylistId) {
      await firstValueFrom(
        from(this.spotifyService.addPlaylistCoverImage(spotifyPlaylistId, this.emotionName))
      );

      // await this.formService.updatePlaylist(playlistId, response.playlist.id);

      this.spotifyPlaylistUrl = `https://open.spotify.com/playlist/${response.playlist.id}`;
      this.isAdded = true;
      window.location.href = this.spotifyPlaylistUrl;
    }

    this.isLoading = false;
    this.isAdded = true;
  }

  openSpotify() {
    window.location.href = this.spotifyPlaylistUrl;
  }

  getSpotifyId(): string | null {
    const userDataString = localStorage.getItem('user');

    if (!userDataString) {
      return null;
    }
    try {
      const userData = JSON.parse(userDataString);
      return userData.spotify_id;
    } catch (error) {
      return null;
    }
  }
}
