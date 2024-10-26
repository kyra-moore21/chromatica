import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import * as tf from '@tensorflow/tfjs';
import { GeneratedSong } from '../models/database.types';
import {
  Emotions,
  Genres,
  Events,
  combineEncodings,
} from '../../../supabase/functions/emotion-event-enum';
import {
  catchError,
  firstValueFrom,
  from,
  map,
  mergeMap,
  Observable,
  of,
  switchMap,
  throwError,
} from 'rxjs';
import { SupabaseService } from '../shared/supabase.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ToastService } from '../shared/toast/toast.service';
import { CommonService } from '../shared/common.service';

@Injectable({
  providedIn: 'root',
})
export class SpotifyService {
  private spotifyAccessToken: Observable<string>;

  constructor(
    private supabase: SupabaseService,
    private http: HttpClient,
    private toastService: ToastService,
    private commonService: CommonService
  ) {
    this.spotifyAccessToken = this.getSpotifyAccessToken();
  }

  private getSpotifyAccessToken(): Observable<string> {
    return from(
      fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `grant_type=client_credentials&client_id=${environment.SPOTIFY_CLIENT_ID}&client_secret=${environment.SPOTIFY_CLIENT_SECRET}`,
      })
        .then((response) => response.json())
        .then((data) => data.access_token)
    );
  }
  getProviderToken() {
    return localStorage.getItem('oauth_provider_token');
  }
  addToLikedSongs(trackId: string): Observable<boolean> {
    const url: string = `https://api.spotify.com/v1/me/tracks?ids=${trackId}`;
    const provider_token = localStorage.getItem('oauth_provider_token');

    if (!provider_token) {
      console.error('No provider token available');
      return of(false);
    }

    return this.http
      .put<any>(url, null, {
        headers: new HttpHeaders({
          Authorization: `Bearer ${provider_token}`,
          'Content-Type': 'application/json',
        }),
      })
      .pipe(
        map(() => true),
        catchError((error) => {
          console.error('Error adding song to liked songs:', error);
          return of(false);
        })
      );
  }
  createPlaylist(name: string, visibility: boolean,user_id: string) {
    const token = this.getProviderToken();
    const url: string = `https://api.spotify.com/v1/users/${user_id}/playlists`;
    //create the body of the request
    const body = {
      name: name,
      public: visibility,
    };
    //request
    return this.http.post<any>(url, body, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
      }),
    });
  }
  addTracksToPlaylist(uris: string[], playlistId: string) {
    const token = this.getProviderToken();
    const url: string = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;
    
    
     // Prepend "spotify:track:" to each track ID
      const trackUris = uris.map(id => `spotify:track:${id}`);

      // Log to ensure the URIs are correctly formatted
      console.log('Formatted Track URIs:', trackUris);
      console.log('Playlist ID:', playlistId);

    return this.http.post<any>(
      url,
      { uris: trackUris },
      {
        headers: new HttpHeaders({
          Authorization: `Bearer ${token}`,
        }),
      }
    );
  }

  async createAndAddTracksToPlaylist(name: string, visibility: boolean, user_id: string, trackIds: string[]) {
    //creating the playlist
    try {
      const createPlaylistResponse = await firstValueFrom(
        this.createPlaylist(name, visibility, user_id)
      );
      //extract the id from creating the playlist
      const playlistId = createPlaylistResponse.id;

      const addTracksResponse = await firstValueFrom(
        this.addTracksToPlaylist(trackIds, playlistId)
      );
      return addTracksResponse;
    } catch (error: any) {
      console.error('error creating playlist or adding tracks: ', error);
      this.toastService.showToast(
        this.commonService.lowercaseRemoveStop(error.message),
        'error'
      );
    }
  }


  getSpotifyRecommendations(
    emotion: number,
    event: number,
    genre: number,
    tracks: number
  ): Observable<GeneratedSong[]> {
    return new Observable<GeneratedSong[]>((observer) => {
      this.spotifyAccessToken.subscribe((token) => {
        // Convert numbers to enum values here
        const emotionEnum = emotion as Emotions;
        const eventEnum = event as Events;
        const genreEnum = genre as Genres;

        const spotifyGenreParam = this.convertToSpotifyNames(genre);
        console.log('Spotify genre parameter:', spotifyGenreParam);

        // Use these enum values in your existing logic for creating the one-hot array
        const oneHotArray = combineEncodings(emotionEnum, eventEnum, genreEnum);

        // Create a tensor from the one hot array
        const tensor = tf.tensor2d([oneHotArray]);

        tf.loadLayersModel('localstorage://model')
          .then((model) => {
            const prediction = model.predict(tensor) as tf.Tensor;

            // Add random noise to the prediction
            const noise = tf.randomNormal(prediction.shape, 0, 0.05);
            const noisyPrediction = prediction.add(noise);

            // Use array() to get the predicted values directly
            noisyPrediction
              .array()
              .then((array) => {
                if (Array.isArray(array) && Array.isArray(array[0])) {
                  const features = array[0] as number[];

                  // Denormalize each feature
                  const denormalizedFeatures = [
                    this.denormalize(features[0], 0, 1), // acousticness (0 to 1)
                    this.denormalize(features[1], 0, 1), // danceability (0 to 1)
                    this.denormalize(features[2], 0, 1), // energy (0 to 1)
                    this.denormalize(features[3], 0, 1), // instrumentalness (0 to 1)
                    this.denormalize(features[4], -1, 11), // key (-1 to 11)
                    this.denormalize(features[5], 0, 1), // liveness (0 to 1)
                    this.denormalize(features[6], -60, 0), // loudness (-60 to 0)
                    this.denormalize(features[7], 0, 1), // mode (0 or 1)
                    this.denormalize(features[8], 0, 1), // speechiness (0 to 1)
                    this.denormalize(features[9], 35, 256), // tempo (35 to 256)
                    this.denormalize(features[10], 3, 7), // time_signature (3 to 7)
                    this.denormalize(features[11], 0, 1), // valence (0 to 1)
                  ];

                  // Set target key and time signature to whole numbers
                  denormalizedFeatures[4] = Math.round(denormalizedFeatures[4]);
                  denormalizedFeatures[10] = Math.round(
                    denormalizedFeatures[10]
                  );
                  // Set mode to 0 or 1
                  denormalizedFeatures[7] = Math.round(denormalizedFeatures[7]);

                  // Ensure all values are positive except loudness
                  denormalizedFeatures.forEach((feature, i) => {
                    if (i !== 6) {
                      denormalizedFeatures[i] = Math.abs(feature);
                    }
                  });

                  //log the features
                  denormalizedFeatures.forEach((feature, i) => {
                    console.log(`Feature ${i}: ${feature}`);
                  });

                  // Call the Spotify API using only the predicted target features
                  fetch(
                    `https://api.spotify.com/v1/recommendations?limit=${tracks}&${spotifyGenreParam}&target_acousticness=${denormalizedFeatures[0]}&target_danceability=${denormalizedFeatures[1]}&target_energy=${denormalizedFeatures[2]}&target_instrumentalness=${denormalizedFeatures[3]}&target_key=${denormalizedFeatures[4]}&target_liveness=${denormalizedFeatures[5]}&target_loudness=${denormalizedFeatures[6]}&target_mode=${denormalizedFeatures[7]}&target_speechiness=${denormalizedFeatures[8]}&target_tempo=${denormalizedFeatures[9]}&target_time_signature=${denormalizedFeatures[10]}&target_valence=${denormalizedFeatures[11]}`,
                    {
                      method: 'GET',
                      headers: {
                        Authorization: `Bearer ${token}`,
                      },
                    }
                  )
                    .then((response) => response.json())
                    .then((data) => {
                      if (data.tracks && data.tracks.length > 0) {
                        const recommendations: GeneratedSong[] =
                          data.tracks.map((track: any) => ({
                            id: '', // This will be set by the database
                            user_id: '', // This will be set in the FormService
                            playlist_id: null, // tbd once playlist is worked out
                            track_name: track.name,
                            artist: track.artists[0].name,
                            spotify_track_id: track.id,
                            song_image_url:
                              track.album.images.length > 0
                                ? track.album.images[0].url
                                : null,
                            preview_url: track.preview_url || '',
                            added_to_spotify: false, // Default value
                          }));
                        observer.next(recommendations);
                        observer.complete();
                      } else {
                        console.error('No songs found.');
                        observer.error('No songs found');
                      }
                    })
                    .catch((error) => {
                      console.log('Error fetching recommendations: ' + error);
                    });
                } else {
                  console.log('Unexpected prediction structure');
                }
              })
              .catch((err) => {
                console.log('Error getting prediction: ' + err);
              });
          })
          .catch((err) => {
            console.log('Error loading model: ' + err);
          });
      });
    });
  }
  // Normalization function
  normalize(value: number, min: number, max: number) {
    return (value - min) / (max - min);
  }

  denormalize(value: number, min: number, max: number) {
    return value * (max - min) + min;
  }

  convertToSpotifyNames(genre: number): string {
    console.log('Genre number received:', genre);

    // Convert number to enum value
    const genreEnum = Genres[genre];

    // Use an object to map specific cases to their Spotify parameters
    const genreMap: { [key: string]: string } = {
      RnB: 'seed_genres=r-n-b',
      DrumAndBass: 'seed_genres=drum-and-bass',
      HipHop: 'seed_genres=hip-hop',
      KPop: 'seed_genres=k-pop',
      PsychedelicRock: 'seed_genres=psych-rock',
      Soundtrack: 'seed_genres=soundtracks',
      WorldMusic: 'seed_genres=world-music',
      Chillout: 'seed_genres=chill',
      // Nujabes, MF Doom, Joji, Ariel Pink
      LoFi: 'seed_genres=chill',
      // Talking Heads, New Order, The B-52s, The Police
      NewWave: 'seed_genres=punk-rock',
      // Talking Heads, New Order, The B-52s, The Police
      PostRock: 'seed_genres=alternative',
      // Including Pink Floyd, Rush, Yes, and Genesis
      ProgressiveRock: 'seed_genres=rock',
      // Including My Bloody Valentine, Slowdive, Ride, and Lush
      Shoegaze: 'seed_genres=indie',
      // Including Kavinsky, The Midnight, Carpenter Brut, and Gunship
      Synthwave: 'seed_genre=synth_pop',
      // Including Future, Travis Scott, Migos, and Young Thug
      Trap: 'seed_genres=hip-hop,rap',
    };

    // Check if the genre is in the map, otherwise default to toLowerCase() of the genre string
    const spotifyParam =
      genreMap[genreEnum] || `seed_genres=${genreEnum.toLowerCase()}`;

    console.log('Spotify parameter:', spotifyParam);
    return spotifyParam;
  }
}
