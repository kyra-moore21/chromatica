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
  Observable,
  of,
  switchMap,
  throwError,
} from 'rxjs';
import { SupabaseService } from '../services/supabase.service';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { ToastService } from '../shared/toast/toast.service';
import { CommonService } from '../services/common.service';

@Injectable({
  providedIn: 'root',
})
export class SpotifyService {
  private supabaseUrl = 'https://ifnsuywocfgtyzqqixss.supabase.co';
  // private supabaseUrl = 'http://localhost:54321'; // For local testing

  constructor(
    private supabase: SupabaseService,
    private http: HttpClient,
    private toastService: ToastService,
    private commonService: CommonService
  ) {

  }


  getProviderToken() {
    return localStorage.getItem('oauth_provider_token');
  }

  addToLikedSongs(trackId: string): Observable<boolean> {
    return this.handleSpotifyApi(() => {
      const token = this.getProviderToken();
      const url: string = `https://api.spotify.com/v1/me/tracks?ids=${trackId}`;

      if (!token) {
        console.error('No provider token available');
        return of(false);
      }


      return this.http.put<any>(url, null, {
        headers: new HttpHeaders({
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        }),
      }).pipe(
        map(() => {
          this.toastService.showToast("Song added to liked songs!", 'success');
          return true;
        }),
        catchError(error => {
          this.toastService.showToast("error adding to liked songs, please try again", 'error')
          console.error('Error adding song to liked songs:', error);
          return of(false);
        })
      );
    });
  }

  private handleSpotifyApi<T>(apiCall: () => Observable<T>): Observable<T> {
    return apiCall().pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          const refresh_token = localStorage.getItem('oauth_refresh_token');
          if (!refresh_token) {
            throw new Error('No refresh token available');
          }
          console.log('401 caught, refresh token exists:', refresh_token.substring(0, 10) + '...');
          console.log('Attempting to refresh Spotify token...');
          return this.refreshSpotifyToken(refresh_token).pipe(
            switchMap(data => {
              // Update tokens in localStorage
              console.log('Got new access token:', data.access_token.substring(0, 10) + '...');
              localStorage.setItem('oauth_provider_token', data.access_token);
              if (data.refresh_token) {
                localStorage.setItem('oauth_refresh_token', data.refresh_token);
              }
              return apiCall(); // Retry the API call after token refresh
            })
          );
        }
        throw error;
      })
    );
  }

  private refreshSpotifyToken(refreshToken: string): Observable<any> {
    const storageKey = 'sb-ifnsuywocfgtyzqqixss-auth-token';

    const sessionString = localStorage.getItem(storageKey);
    if (!sessionString) {
      throw new Error('No session found');
    }

    const session = JSON.parse(sessionString!);
    const userJwt = session.access_token;
    console.log('User JWT:', userJwt.substring(0, 10) + '...');

    return from(fetch(`${this.supabaseUrl}/functions/v1/refresh-spotify-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userJwt}`,
      },
      body: JSON.stringify({ refresh_token: refreshToken })
    })).pipe(
      switchMap(response =>
        from(response.json()).pipe(
          map(data => {
            if (!response.ok) {
              throw new Error(`Token refresh failed: ${data.error} - ${data.error_description}`);
            }
            return data;
          })
        )
      ),
      catchError(error => {
        console.error("Spotify token refresh error:", error);
        return throwError(() => error);
      })
    );
  }



  createPlaylist(name: string, visibility: boolean, user_id: string) {
    return this.handleSpotifyApi(() => {
      const token = this.getProviderToken();
      const url: string = `https://api.spotify.com/v1/users/${user_id}/playlists`;
      const body = {
        name: name,
        public: visibility,
      };

      return this.http.post<any>(url, body, {
        headers: new HttpHeaders({
          Authorization: `Bearer ${token}`,
        }),
      });
    });
  }

  addTracksToPlaylist(uris: string[], playlistId: string) {
    return this.handleSpotifyApi(() => {
      const token = this.getProviderToken();
      const url: string = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;
      // Prepend "spotify:track:" to each track ID
      const trackUris = uris.map(id => `spotify:track:${id}`);


      return this.http.post<any>(
        url,
        { uris: trackUris },
        {
          headers: new HttpHeaders({
            Authorization: `Bearer ${token}`,
          }),
        }
      );
    })
  }


  addPlaylistCoverImage(playlist_id: string, emotion: Emotions) {
    const token = this.getProviderToken();
    const url: string = `https://api.spotify.com/v1/playlists/${playlist_id}/images`;

    return fetch(`/lil-guys/${emotion.toString().toLowerCase().trim()}.png`)
      .then(response => response.blob())
      .then(blob => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64data = reader.result as string;
            resolve(base64data.split(',')[1]);
          };
          reader.readAsDataURL(blob);
        });
      })
      .then(base64 => {
        return firstValueFrom(this.http.put(url, base64, {
          headers: new HttpHeaders({
            Authorization: `Bearer ${token}`,
            'Content-Type': 'image/png'
          })
        }));
      });
  }

  createAndAddTracksToPlaylist(name: string, visibility: boolean, user_id: string, trackIds: string[], emotion: Emotions) {
    return this.handleSpotifyApi(() =>
      this.createPlaylist(name, visibility, user_id).pipe(
        switchMap(playlist =>
          this.addTracksToPlaylist(trackIds, playlist.id).pipe(
            map(trackResponse => ({
              playlist: playlist,
              trackResponse: trackResponse
            }))
          )
        ),
        catchError(error => {
          console.error('error creating playlist or adding tracks: ', error);
          this.toastService.showToast(
            this.commonService.lowercaseRemoveStop(error.message),
            'error'
          );
          throw error;
        })
      )
    );
  }



  getSpotifyRecommendations(emotion: number, event: number, genre: number, tracks: number): Observable<GeneratedSong[]> {
    return new Observable<GeneratedSong[]>((observer) => {
      // Convert numbers to enum values here
      const emotionEnum = emotion as Emotions;
      const eventEnum = event as Events;
      const genreEnum = genre as Genres;


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

                const token = localStorage.getItem('oauth_provider_token');
                if (!token) {
                  console.error('No authentication token found');
                  return;
                }

                // Call the Spotify API using only the predicted target features
                this.convertToSpotifyParams(genre).subscribe(spotifyParams => {
                  console.log(spotifyParams);
                  this.handleSpotifyApi(() => from(
                    fetch(
                      `https://api.spotify.com/v1/recommendations?limit=${tracks}&market=US&${spotifyParams}&target_acousticness=${denormalizedFeatures[0]}&target_danceability=${denormalizedFeatures[1]}&target_energy=${denormalizedFeatures[2]}&target_instrumentalness=${denormalizedFeatures[3]}&target_key=${denormalizedFeatures[4]}&target_liveness=${denormalizedFeatures[5]}&target_loudness=${denormalizedFeatures[6]}&target_mode=${denormalizedFeatures[7]}&target_speechiness=${denormalizedFeatures[8]}&target_tempo=${denormalizedFeatures[9]}&target_time_signature=${denormalizedFeatures[10]}&target_valence=${denormalizedFeatures[11]}`,
                      {
                        method: 'GET',
                        headers: {
                          Authorization: `Bearer ${this.getProviderToken()}`,
                        },
                      }
                    )
                  )).subscribe(response =>
                    response.json().then(data => {
                      if (data.tracks && data.tracks.length > 0) {
                        const recommendations: GeneratedSong[] =
                          data.tracks.map((track: any) => ({
                            id: '', // This will be set by the database
                            user_id: '', // This will be set in the FormService
                            playlist_id: null,
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
                      }));
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
  }

  // Normalization function
  normalize(value: number, min: number, max: number) {
    return (value - min) / (max - min);
  }

  denormalize(value: number, min: number, max: number) {
    return value * (max - min) + min;
  }

  getTopTracks(limit: number): Observable<string> {
    return this.handleSpotifyApi(() => {
      const token = this.getProviderToken();
      const offset = this.createRandomOffset();
      //using top five tracks default is medium_term/6 months
      const url: string = `https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=${limit}&offset=${offset}`;

      return this.http.get<any>(url, {
        headers: new HttpHeaders({
          Authorization: `Bearer ${token}`,
        }),
      }).pipe(
        map(response => {
          // Map the track IDs and create the seed_tracks string
          const trackIds = response.items.map((item: any) => item.id);
          console.log(trackIds);
          return `seed_tracks=${trackIds.join('%2C')}`;
        }),
        catchError(error => {
          console.error('Error fetching top tracks:', error);
          return of(''); // Return an empty string in case of an error
        })
      )
    })
  }

  getFilteredByGenreTopArtists(genre: string, limit: number): Observable<string[] | null> {
    return this.handleSpotifyApi(() => {
      const token = this.getProviderToken();
      const url = `https://api.spotify.com/v1/me/top/artists?limit=50`;

      return this.http.get<any>(url, {
        headers: new HttpHeaders({
          Authorization: `Bearer ${token}`,
        }),
      }).pipe(
        map(response => {
          // Filter the top artists based on the provided genre
          const matchingArtists = response.items.filter((artist: any) =>
            artist.genres.includes(genre.toLowerCase())
          );

          // Return the first 5 matching artist IDs or null if none found
          if (matchingArtists.length > 0) {
            return matchingArtists.slice(0, limit).map((artist: any) => artist.id);
          } else {
            return null;
          }
        })
      );
    })
  }

  getTopArtistsForNoGenre(limit: number): Observable<string[]> {
    return this.handleSpotifyApi(() => {
      const token = this.getProviderToken();
      const offset = this.createRandomOffset();
      const url = `https://api.spotify.com/v1/me/top/artists?limit=${limit}&offset=${offset}`;

      return this.http.get<any>(url, {
        headers: new HttpHeaders({
          Authorization: `Bearer ${token}`,
        }),
      }).pipe(
        map(response => {
          // Simply return the top artist IDs up to the specified limit
          return response.items.slice(0, limit).map((artist: any) => artist.id);
        }),
        catchError(error => {
          console.error('Error fetching top artists for no genre:', error);
          return of([]); // Return an empty array in case of an error
        })
      );
    })
  }

  convertToSpotifyParams(genre: number): Observable<string> {
    console.log('Genre number received:', genre);

    // Convert number to enum value
    const genreEnum = Genres[genre];
    // If genre is 'None', handle separately and return early
    if (genreEnum === 'None') {
      // No genre selected: Fetch 4 top artists directly and 4 top tracks
      return this.getTopArtistsForNoGenre(2).pipe(
        switchMap(topArtists => {
          const seedArtists = `seed_artists=${topArtists.join('%2C')}`;

          // Fetch 4 top tracks
          return this.getTopTracks(1).pipe(
            map(seedTracks => {
              const combinedParams = `${seedArtists}&${seedTracks}`;
              console.log('Final combined parameters with no genre selected:', combinedParams);
              return combinedParams;
            })
          );
        })
      );
    }
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
      LoFi: 'seed_genres=chill',
      NewWave: 'seed_genres=punk-rock',
      PostRock: 'seed_genres=alternative,rock',
      ProgressiveRock: 'seed_genres=rock',
      Shoegaze: 'seed_genres=indie',
      Synthwave: 'seed_genres=synth_pop',
      Trap: 'seed_genres=hip-hop,rap',
      None: ''
    };

    // Determine the genre parameter
    const spotifyParam = genreMap[genreEnum] || `seed_genres=${genreEnum.toLowerCase()}`;

    // Fetch top artists that match the genre
    return this.getFilteredByGenreTopArtists(genreEnum.toLowerCase(), 3).pipe(
      switchMap(matchingArtists => {
        if (matchingArtists) {
          // If there are matching artists, construct the seed_artists parameter
          const seedArtists = `seed_artists=${matchingArtists.join('%2C')}`;

          // Fetch top tracks if matching artists exist
          return this.getTopTracks(1).pipe(
            map(seedTracks => {
              // If there are seed tracks, append them to the artist parameter
              const combinedParams = seedTracks
                ? `${seedArtists}&${spotifyParam}&${seedTracks}`
                : seedArtists;
              console.log('Final combined parameters with artists and tracks:', combinedParams);
              return combinedParams;
            })
          );
        } else {
          // If no matching artists, use the genre parameter alone
          console.log('No matching artists found, using genre only:', spotifyParam);
          return of(spotifyParam);
        }
      })
    );
  }
  createRandomOffset(): number {
    return Math.floor(Math.random() * 50) + 1;
  }


}
