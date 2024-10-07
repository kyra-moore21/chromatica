import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import * as tf from '@tensorflow/tfjs';
import { GeneratedSong } from '../models/generated-song';
import {shareReplay } from 'rxjs/operators';
import {
  Emotions,
  Genres,
  Events,
  combineEncodings,
} from '../../../supabase/functions/emotion-event-enum';
import { from, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SpotifyService {
  private spotifyAccessToken: Observable<string>;
  constructor() { 
    this.spotifyAccessToken = this.getSpotifyAccessToken();
  }
   //get the spotify access token (post)
   private getSpotifyAccessToken(): Observable<string> {
    return from(fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `grant_type=client_credentials&client_id=${environment.SPOTIFY_CLIENT_ID}&client_secret=${environment.SPOTIFY_CLIENT_SECRET}`,
    })
    .then(response => response.json())
    .then(data => data.access_token));
  }
    getSpotifyRecommendations(emotion: number, event: number, genre: number):Observable<GeneratedSong>{
      return new Observable<GeneratedSong>(observer => {
        this.spotifyAccessToken.subscribe(token => {
            // Convert numbers to enum values here
          const emotionEnum = emotion as Emotions;
          const eventEnum = event as Events;
          const genreEnum = genre as Genres;

          // Use these enum values in your existing logic for creating the one-hot array
          const oneHotArray = combineEncodings(emotionEnum, eventEnum, genreEnum);
        
          // Create a tensor from the one hot array
          const tensor = tf.tensor2d([oneHotArray]);
        
          tf.loadLayersModel('localstorage://model')
            .then((model) => {
              const prediction = model.predict(tensor) as tf.Tensor;
      
              // Add random noise to the prediction
              const noise = tf.randomNormal(prediction.shape, 0, 0.1);
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
                    denormalizedFeatures[10] = Math.round(denormalizedFeatures[10]);
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
                      `https://api.spotify.com/v1/recommendations?limit=1&seed_genres=${genreEnum.toString().toLowerCase()}&target_acousticness=${denormalizedFeatures[0]}&target_danceability=${denormalizedFeatures[1]}&target_energy=${denormalizedFeatures[2]}&target_instrumentalness=${denormalizedFeatures[3]}&target_key=${denormalizedFeatures[4]}&target_liveness=${denormalizedFeatures[5]}&target_loudness=${denormalizedFeatures[6]}&target_mode=${denormalizedFeatures[7]}&target_speechiness=${denormalizedFeatures[8]}&target_tempo=${denormalizedFeatures[9]}&target_time_signature=${denormalizedFeatures[10]}&target_valence=${denormalizedFeatures[11]}`,
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
                          const recommendation: GeneratedSong = {
                            trackName: data.tracks[0].name,
                            artist: data.tracks[0].artists[0].name,
                            spotifyTrackId: data.tracks[0].id,
                            imageUrl: data.tracks[0].album.images.length > 0 ? data.tracks[0].album.images[0].url : '',
                             previewUrl: data.tracks[0].preview_url || '',
                          };
                          observer.next(recommendation);
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
        })
        });
    }
      // Normalization function
  normalize(value: number, min: number, max: number) {
    return (value - min) / (max - min);
  }

  denormalize(value: number, min: number, max: number) {
    return value * (max - min) + min;
  }
   }

