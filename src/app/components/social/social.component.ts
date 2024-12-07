import { Component, OnInit } from '@angular/core';
import {
  User,
  Friendship,
  GeneratedSong,
  GeneratedPlaylist,
} from '../../models/database.types';
import { SupabaseService } from '../../services/supabase.service';
import { IonIcon, NavController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { personAddSharp, play } from 'ionicons/icons';
import { ToastService } from '../../shared/toast/toast.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-social',
  templateUrl: './social.component.html',
  styleUrls: ['./social.component.scss'],
  standalone: true,
  imports: [FormsModule, IonIcon],
})
export class SocialComponent implements OnInit {
  user: User = {
    avatar_url: null,
    created_at: null,
    deleted_at: null,
    email: '',
    friend_count: null,
    id: '',
    is_spotify_connected: null,
    last_spotify_sync: null,
    profile_visibility: null,
    spotify_id: null,
    updated_at: null,
    username: null,
    social_score: null,
    push_notifications: null,
    email_notifications: null,
  };
  friendships: Friendship[] = [];
  pendingRequestCount: number = 2;
  songs: GeneratedSong[] = [];
  playlists: GeneratedPlaylist[] = [];


  constructor(
    private supabase: SupabaseService,
    private navCtrl: NavController,
    private toast: ToastService
  ) {
    addIcons({ personAddSharp, play });
  }

  //create fake merged content with 3 songs and 3 playlists
  mergedContent = [
    {
      id: '1',
      track_name: 'track 1',
      artist: 'artist 1',
      song_image_url: '/mock/song1.png',
      spotify_track_id: '1',
      user_id: '1',
      playlist_id: null,
      preview_url: 'https://via.placeholder.com/150',
      added_to_spotify: false,
      users: {
        username: 'user 1',
        profile_visibility: 'public',
      },
      type: 'song',
      liked: false,
    },
    {
      id: '4',
      playlist_image_url: '/mock/playlist.png',
      user_id: '1',
      spotify_playlist_id: '1',
      added_to_spotify: false,
      playlist_name: "playlist 1",
      users: {
        username: 'user 1',
        profile_visibility: 'public',
      },
      type: 'playlist',
      liked: false,
    },
    {
      id: '2',
      track_name: 'track 2',
      artist: 'artist 2',
      song_image_url: '/mock/song2.png',
      spotify_track_id: '2',
      user_id: '2',
      playlist_id: null,
      preview_url: 'https://via.placeholder.com/150',
      added_to_spotify: false,
      users: {
        username: 'user 2',
        profile_visibility: 'public',
      },
      type: 'song',
      liked: false,
    },
    {
      id: '5',
      playlist_image_url: '/mock/playlist.png',
      user_id: '2',
      spotify_playlist_id: '2',
      added_to_spotify: false,
      playlist_name: "playlist 2",
      users: {
        username: 'user 2',
        profile_visibility: 'public',
      },
      type: 'playlist',
      liked: false,
    },
    {
      id: '3',
      track_name: 'track 3',
      artist: 'artist 3',
      song_image_url: '/mock/song3.png',
      spotify_track_id: '3',
      user_id: '3',
      playlist_id: null,
      preview_url: 'https://via.placeholder.com/150',
      added_to_spotify: false,
      users: {
        username: 'user 3',
        profile_visibility: 'public',
      },
      type: 'song',
      liked: false,
    },
    {
      id: '6',
      playlist_image_url: '/mock/playlist.png',
      user_id: '3',
      spotify_playlist_id: '3',
      added_to_spotify: false,
      playlist_name: "playlist 3",
      users: {
        username: 'user 3',
        profile_visibility: 'public',
      },
      type: 'playlist',
      liked: false,
    },
  ];

  async ngOnInit() {
    // const cachedUser = localStorage.getItem('user');
    // this.user = cachedUser ? JSON.parse(cachedUser) : null;

    // //check if local storage has friendships and set it to friendships variable
    // const cachedFriendships = localStorage.getItem('friendships');
    // this.friendships = cachedFriendships ? JSON.parse(cachedFriendships) : [];

    // // get list of friendships with current user id in either user_id or friend_id
    // await this.supabase
    //   .getClient()
    //   .from('friendships')
    //   .select(
    //     `
    //       *,
    //       user_details:user_id ( id, username, avatar_url ),
    //       friend_details:friend_id ( id, username, avatar_url )
    //     `
    //   )
    //   .or(`user_id.eq.${this.user.id},friend_id.eq.${this.user.id}`)
    //   .then((data) => {
    //     if (data.error) {
    //       console.error('failed to fetch friendships:', data.error);
    //       this.toast.showToast('failed to fetch friendships', 'error');
    //     } else {
    //       console.log('friendships:', data.data);
    //       this.friendships = data.data;
    //       localStorage.setItem('friendships', JSON.stringify(data.data));
    //     }
    //   });

    // this.pendingRequestCount = this.friendships.filter(
    //   (friendship) =>
    //     friendship.friendship_status === 'pending' &&
    //     friendship.friend_id === this.user.id
    // ).length;

    // const cachedSongs = localStorage.getItem('generatedSongs');
    // const cachedPlaylists = localStorage.getItem('generatedPlaylists');
    // const lastCacheTime = localStorage.getItem('cacheTime');

    // const isCacheStale =
    //   !lastCacheTime || Date.now() - Number(lastCacheTime) > 1000 * 60 * 5; // 5 minutes

    // if (cachedSongs && cachedPlaylists && !isCacheStale) {
    //   console.log('Using cached data');
    //   this.songs = JSON.parse(cachedSongs);
    //   this.playlists = JSON.parse(cachedPlaylists);
    //   //set types 
    //   this.songs = this.songs.map((song) => ({ ...song, type: 'song', liked: false }));
    //   this.playlists = this.playlists.map((playlist) => ({ ...playlist, type: 'playlist', liked: false }));
    //   this.mergedContent = [...this.songs, ...this.playlists];
    // } else {
    //   console.log('Fetching data from server');
    //   await this.fetchGeneratedContent();
    // }
  }

  // private async fetchGeneratedContent() {
  //   // Get all friend IDs from the cached friendships
  //   const friendIds = this.friendships
  //   .filter(
  //     (friendship) =>
  //       friendship.friendship_status === 'accepted' // Only accepted friendships
  //   )
  //   .map((friendship) =>
  //     // Get the friend's ID depending on the direction of the relationship
  //     friendship.user_id === this.user.id
  //       ? friendship.friend_id
  //       : friendship.user_id
  //   );


  //   // get songs
  //   const { data: songs, error: songsError } = await this.supabase
  //   .getClient()
  //   .from('generated_songs')
  //   .select(`
  //     id, track_name, artist, song_image_url, spotify_track_id, user_id,
  //     playlist_id, preview_url, added_to_spotify,
  //     users (username, profile_visibility)
  //   `)
  //   .in('user_id', friendIds) // Only fetch songs from friends
  //   .or('profile_visibility.eq.public,profile_visibility.eq.friends_only', { referencedTable: 'users' }) // Public and friends-only visibility
  
  
    console.log('Songs:', songs);

  //   if (songsError) {
  //     console.error('Error fetching generated content:', songsError);
  //     return;
  //   }

  //   this.songs = songs.map((song) => ({ ...song, type: 'song', liked: false }));
  //   //filter out songs that have a playlist_id
  //   this.songs = this.songs.filter((song) => !song.playlist_id);
  //   localStorage.setItem('generatedSongs', JSON.stringify(songs));

  //   // get playlists
  //   const { data: playlists, error: playlistsError } = await this.supabase
  //     .getClient()
  //     .from('generated_playlists')
  //     .select(`
  //       id, playlist_image_url, user_id,
  //       spotify_playlist_id, added_to_spotify,
  //       users(username, profile_visibility)
  //     `)
  //     .in('user_id', friendIds) // Only fetch playlists from friends
  //     .or('profile_visibility.eq.public,profile_visibility.eq.friends_only', { referencedTable: 'users' }) // Filter visibility

  //   if (playlistsError) {
  //     console.error('Error fetching generated playlists:', playlistsError);
  //     return;
  //   }

  //   this.playlists = playlists.map((playlist) => ({ ...playlist, type: 'playlist', liked: false }));

  //   // Merge songs and playlists into a single list
  //   this.mergedContent = [...this.songs, ...this.playlists];
  //   console.log('Merged content:', this.mergedContent);
  //   localStorage.setItem('generatedPlaylists', JSON.stringify(playlists));
  //   localStorage.setItem('cacheTime', Date.now().toString());
  // }

  navigateToFriendsList() {
    this.navCtrl.navigateForward('/friend-list', { animated: false });
  }
}
