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
    const provider_token = this.getProviderToken();

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
  createPlaylist(name: string, visibility: boolean, user_id: string) {
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
                  this.convertToSpotifyParams(genre).subscribe(spotifyParams => {
                    console.log(spotifyParams);
                    fetch(
                      `https://api.spotify.com/v1/recommendations?limit=${tracks}&market=US&${spotifyParams}&target_acousticness=${denormalizedFeatures[0]}&target_danceability=${denormalizedFeatures[1]}&target_energy=${denormalizedFeatures[2]}&target_instrumentalness=${denormalizedFeatures[3]}&target_key=${denormalizedFeatures[4]}&target_liveness=${denormalizedFeatures[5]}&target_loudness=${denormalizedFeatures[6]}&target_mode=${denormalizedFeatures[7]}&target_speechiness=${denormalizedFeatures[8]}&target_tempo=${denormalizedFeatures[9]}&target_time_signature=${denormalizedFeatures[10]}&target_valence=${denormalizedFeatures[11]}`,
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
  getTopTracks(limit: number): Observable<string> {
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
    );
  }

  getFilteredByGenreTopArtists(genre: string, limit: number): Observable<string[] | null> {
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
  }

  getTopArtistsForNoGenre(limit: number): Observable<string[]> {
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
      PostRock: 'seed_genres=alternative',
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
