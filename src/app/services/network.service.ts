import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { createClient } from '@supabase/supabase-js';
import * as tf from '@tensorflow/tfjs';
import {
  Emotions,
  Genres,
  Events,
  combineEncodings,
} from '../../../supabase/functions/emotion-event-enum';

@Injectable({
  providedIn: 'root'
})
export class NetworkService {
  spotifyAccessToken = '';

  constructor() { }

  supabase = createClient(environment.DB_URL, environment.DB_ANON_KEY, {
    global: {
      headers: { Authorization: `Bearer ${environment.DB_SERVICE_KEY}` },
    },
  });

    // Function to update the HTML "console"
    updateConsole(message: string) {
      const consoleOutput = document.getElementById('console-output');
      if (consoleOutput) {
        // Append new message to the div
        const newMessage = document.createElement('div');
        newMessage.textContent = message;
        consoleOutput.appendChild(newMessage);
        // Scroll to the bottom to show the latest log
        consoleOutput.scrollTop = consoleOutput.scrollHeight;
      }
    }

  async train() {
    this.updateConsole('Starting training...');

    const { data, error } = await this.supabase.storage
      .from('train')
      .download('100_items.csv');

    const contents = await data!.text();

    const allAudioFeatures = this.getAllAudioFeatures(contents);

    let model;
    const modelData = localStorage.getItem('tensorflowjs_models/model/info');

    if (modelData === null) {
      //this.updateConsole('Building model');
      // Define the model
      model = tf.sequential();

      // Input layer
      model.add(
        tf.layers.dense({
          inputShape: [101],
          units: 101,
          activation: 'relu',
        })
      );

      // Hidden layer
      model.add(
        tf.layers.dense({
          units: 128,
          activation: 'relu',
        })
      );

      // Hidden layer
      model.add(
        tf.layers.dense({
          units: 64,
          activation: 'relu',
        })
      );

      // Hidden layer
      model.add(
        tf.layers.dense({
          units: 32,
          activation: 'relu',
        })
      );

      // Output layer (continuous features like music features)
      model.add(
        tf.layers.dense({
          units: 12, // 12 output features
          activation: 'linear', // Use linear activation for regression tasks
        })
      );

      // Compile the model
      model.compile({
        loss: tf.losses.huberLoss,
        optimizer: tf.train.adam(0.01),
        metrics: ['mae'],
      });
    } else {
      //this.updateConsole('Loading model');
      model = await tf.loadLayersModel('localstorage://model');
      model.compile({
        loss: tf.losses.huberLoss,
        optimizer: tf.train.adam(0.01),
        metrics: ['mae'],
      });
    }

    const oneHotInputsArray = [];
    const numCat = 101;
    for (let i = 0; i < numCat; i++) {
      const oneHotArray = new Array(numCat).fill(0);
      oneHotArray[i] = 1;

      //put the array into the oneHotInputsArray 10 times
      for (let j = 0; j < 100; j++) {
        oneHotInputsArray.push(oneHotArray);
      }
    }

    // create an array to store the combination one hots
    const combinedOneHotArray = [];
    //happy vacation
    combinedOneHotArray.push(
      combineEncodings(Emotions.Happy, Events.Vacation, Genres.None)
    );
    //sad relaxation day
    combinedOneHotArray.push(
      combineEncodings(Emotions.Sad, Events.Relaxation, Genres.None)
    );
    //angry workout
    combinedOneHotArray.push(
      combineEncodings(Emotions.Angry, Events.Workout, Genres.None)
    );
    //calm meditation
    combinedOneHotArray.push(
      combineEncodings(Emotions.Calm, Events.Meditation, Genres.None)
    );
    //excited party
    combinedOneHotArray.push(
      combineEncodings(Emotions.Excited, Events.Party, Genres.None)
    );
    //chill beach day
    combinedOneHotArray.push(
      combineEncodings(Emotions.Calm, Events.BeachDay, Genres.None)
    );
    //romanctic date
    combinedOneHotArray.push(
      combineEncodings(Emotions.Love, Events.Date, Genres.None)
    );
    //energetic workout
    combinedOneHotArray.push(
      combineEncodings(Emotions.Excited, Events.Running, Genres.None)
    );
    //focused study
    combinedOneHotArray.push(
      combineEncodings(Emotions.Calm, Events.Study, Genres.None)
    );
    //nostalgic roadtrip
    combinedOneHotArray.push(
      combineEncodings(Emotions.Nostalgic, Events.Roadtrip, Genres.None)
    );

    //loop over the array and add 10 of each into the oneHotInputsArray
    combinedOneHotArray.forEach((oneHotArray) => {
      for (let i = 0; i < 100; i++) {
        oneHotInputsArray.push(oneHotArray);
      }
    });

    const onHotInputs = tf.tensor2d(oneHotInputsArray);
    const audioFeatureOutputs = tf.tensor2d(allAudioFeatures);

    await model
      .fit(onHotInputs, audioFeatureOutputs, {
        epochs: 10,
        callbacks: {
          onEpochEnd: async (epoch, logs) => {
            const mae = logs!['mae'].toFixed(2); // Format MAE to 2 decimal places
            this.updateConsole(
              `Epoch: ${epoch} Loss: ${logs!['loss']} Accuracy (MAE): ${mae}`
            );
          },
        },

        batchSize: 32,
        validationSplit: 0.1,
      })
      .then(() => {
        this.updateConsole('Training complete');
      });

    await model.save('localstorage://model');
  }

  test() {
    this.updateConsole('Testing...');

    // Make a one hot array for the selected category
    const oneHotArray = combineEncodings(
      Emotions.Happy,
      Events.Celebration,
      Genres.Disco
    );

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
                this.updateConsole(`Feature ${i}: ${feature}`);
              });

              // Call the Spotify API using only the predicted target features
              fetch(
                `https://api.spotify.com/v1/recommendations?limit=1&seed_genres=disco&target_acousticness=${denormalizedFeatures[0]}&target_danceability=${denormalizedFeatures[1]}&target_energy=${denormalizedFeatures[2]}&target_instrumentalness=${denormalizedFeatures[3]}&target_key=${denormalizedFeatures[4]}&target_liveness=${denormalizedFeatures[5]}&target_loudness=${denormalizedFeatures[6]}&target_mode=${denormalizedFeatures[7]}&target_speechiness=${denormalizedFeatures[8]}&target_tempo=${denormalizedFeatures[9]}&target_time_signature=${denormalizedFeatures[10]}&target_valence=${denormalizedFeatures[11]}`,
                {
                  method: 'GET',
                  headers: {
                    Authorization: `Bearer ${this.spotifyAccessToken}`,
                  },
                }
              )
                .then((response) => response.json())
                .then((data) => {
                  if (data.tracks && data.tracks.length > 0) {
                    this.updateConsole(
                      `Song: ${data.tracks[0].name} by ${data.tracks[0].artists[0].name}`
                    );
                  } else {
                    this.updateConsole('No songs found.');
                  }
                })
                .catch((error) => {
                  this.updateConsole(
                    'Error fetching recommendations: ' + error
                  );
                });
            } else {
              this.updateConsole('Unexpected prediction structure');
            }
          })
          .catch((err) => {
            this.updateConsole('Error getting prediction: ' + err);
          });
      })
      .catch((err) => {
        this.updateConsole('Error loading model: ' + err);
      });
  }

  async getAllFeatures() {
    this.updateConsole('Getting all features...');

    const { data, error } = await this.supabase.storage
      .from('train')
      .download('genres_with_events.csv');

    if (error) {
      this.updateConsole('Error getting all features: ' + error.message);
      return;
    }

    const contents = await data!.text();
    type AudioFeatures = number[];

    // Process the contents to get audio features
    const allAudioFeatures: AudioFeatures[] =
      this.getAllAudioFeatures(contents);

    // Log each audio feature
    allAudioFeatures.forEach((row: AudioFeatures, i: number) => {
      this.updateConsole(`Emotion ${i}: ${row}`);
    });
  }

  parseCSV(csv: string): number[][] {
    const lines = csv.trim().split('\n');
    const headers = lines[0].split(',');

    return lines.slice(1).map((line) => {
      const values = line.split(',');
      return headers.map((header, i) => parseFloat(values[i]));
    });
  }

  getAudioFeaturesByEmotion(emotion: number, csv: string): any {
    const parsedData = this.parseCSV(csv);
    const emotionIndex = parsedData.findIndex((row) => row[0] === emotion);
    return parsedData[emotionIndex];
  }

  getAllAudioFeatures(csv: string): any {
    const parsedData = this.parseCSV(csv);
    parsedData.forEach((row) => {
      row.shift(); // Remove the category label

      // Normalize each feature using their respective min and max values
      row[0] = this.normalize(row[0], 0, 1); // acousticness (0 to 1)
      row[1] = this.normalize(row[1], 0, 1); // danceability (0 to 1)
      row[2] = this.normalize(row[2], 0, 1); // energy (0 to 1)
      row[3] = this.normalize(row[3], 0, 1); // instrumentalness (0 to 1)
      row[4] = this.normalize(row[4], -1, 11); // key (-1 to 11)
      row[5] = this.normalize(row[5], 0, 1); // liveness (0 to 1)
      row[6] = this.normalize(row[6], -60, 0); // loudness (-60 to 0)
      row[7] = this.normalize(row[7], 0, 1); // mode (0 or 1)
      row[8] = this.normalize(row[8], 0, 1); // speechiness (0 to 1)
      row[9] = this.normalize(row[9], 35, 256); // tempo (using the broader range 35 to 256)
      row[10] = this.normalize(row[10], 3, 7); // time_signature (3 to 7)
      row[11] = this.normalize(row[11], 0, 1); // valence (0 to 1)
    });
    return parsedData;
  }

  // Normalization function
  normalize(value: number, min: number, max: number) {
    return (value - min) / (max - min);
  }

  denormalize(value: number, min: number, max: number) {
    return value * (max - min) + min;
  }
}
