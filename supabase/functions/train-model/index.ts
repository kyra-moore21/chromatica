// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import * as nnFunctions from '../emotion-event-enum.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import * as tf from 'npm:@tensorflow/tfjs';
//import "../_shared/supabaseClient.ts"

function parseCSV(csv: string): number[][] {
  const lines = csv.trim().split('\n');
  const headers = lines[0].split(',');

  return lines.slice(1).map((line) => {
    const values = line.split(',');
    return headers.map((header, i) => {
      //if its the first column, return the value as is
      if (i === 0) return values[i];
      return parseFloat(values[i]);
    });
  });
}

function getAudioFeaturesByEmotion(emotion: string, csv: string): any {
  const parsedData = parseCSV(csv);
  //check to see if the first item in the array of arrays is the emotion
  const emotionIndex = parsedData.findIndex((row) => row[0] === emotion);
  return parsedData[emotionIndex];
}

function getAllAudioFeatures(csv: string): any {
  const parsedData = parseCSV(csv);
  //need to remove the first item from each of the arrays within the array (emotion, event, genre)
  parsedData.forEach((row) => row.shift());
  return parsedData;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Create a Supabase client with the Auth context of the logged in user.
  const supabase = createClient(
    // Supabase API URL - env var exported by default.
    Deno.env.get('DB_URL') ?? '',
    // Supabase API ANON KEY - env var exported by default.
    Deno.env.get('DB_ANON_KEY') ?? '',
    // Create client with Auth context of the user that called the function.
    // This way your row-level-security (RLS) policies are applied.
    {
      global: {
        headers: { Authorization: `Bearer ${Deno.env.get('DB_SERVICE_ROLE')}` },
      },
    }
  );

  const { data, error } = await supabase.storage
    .from('train')
    .download('genres_with_events.csv');

  //grab model
  const { data: modelData, error: modelError } = await supabase.storage
    .from('models')
    .download('model.json');

  console.log(modelData);

  const contents = await data.text();

  // // Extract the emotion, event, and genre from the request body
  // const { emotion, event, genre } = await req.json();

  // // Combine the encodings
  // const encoding = nnFunctions.combineEncodings(emotion, event, genre);

  // // read the emotion from the emotions csv
  // const audioFeatures = getAudioFeaturesByEmotion(emotion, contents);

  const allAudioFeatures = getAllAudioFeatures(contents);

  //check if the model exists, if it doesnt build it, else load i
  let model;

  if (modelData === null) {
    console.log('Building model');
    //start building the model
    model = tf.sequential();

    //input layer
    model.add(
      tf.layers.dense({
        inputShape: [101],
        units: 64,
        activation: 'relu',
      })
    );

    //hidden layer
    model.add(
      tf.layers.dense({
        units: 32,
        activation: 'relu',
      })
    );

    //output layer (number of audio features, 24)
    model.add(
      tf.layers.dense({
        units: 24,
        activation: 'softmax',
      })
    );

    //compile the model
    model.compile({
      loss: 'meanSquaredError',
      optimizer: tf.train.adam(0.001),
    });
  } else {
    console.log('Loading model');
    //load the model
    const modelJsonText = await modelData.text();
    const modelJson = JSON.parse(modelJsonText);

    console.log(modelJson);

    model = await tf.models.modelFromJSON(modelJson);
  }

  //one hot array gen
  const oneHotInputsArray = [];
  const numCat = 101;
  // create arrays to place into the one hot array
  for (let i = 0; i < numCat; i++) {
    const oneHotArray = new Array(numCat).fill(0);
    oneHotArray[i] = 1;
    oneHotInputsArray.push(oneHotArray);
  }

  //train the model
  const onHotInputs = tf.tensor2d(oneHotInputsArray);
  const audioFeatureOutputs = tf.tensor2d(allAudioFeatures);

  await model
    .fit(onHotInputs, audioFeatureOutputs, {
      epochs: 25,
      callbacks: {
        onEpochEnd: async (epoch, logs) => {
          console.log(`Epoch: ${epoch} Loss: ${logs.loss}`);
        },
      },
      batchSize: 32,
    })
    .then(() => {
      console.log('Training complete');
    });

  //save model to supabase
  const modelJSON = await model.toJSON();

  //save the json string to a file
  const modelBlob = new Blob([JSON.stringify(modelJSON)], {
    type: 'application/json',
  });
  const modelFile = new File([modelBlob], 'model.json');

  //upload to supabase
  const { data: modelUploadData, error: modelUploadError } =
    await supabase.storage.from('models').upload('model.json', modelFile);

  return new Response(JSON.stringify('Completed'), {
    headers: { 'Content-Type': 'application/json' },
  });
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/train-model' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
