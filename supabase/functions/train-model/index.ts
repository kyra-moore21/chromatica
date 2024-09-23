// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import * as nnFunctions from '../emotion-event-enum.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';
//import "../_shared/supabaseClient.ts"

function parseCSV(csv: string): number[][] {
  const lines = csv.trim().split('\n');
  const headers = lines[0].split(',');

  return lines.slice(1).map((line) => {
    const values = line.split(',');
    return headers.map((header, i) => {
      return parseFloat(values[i]);
    });
  });
}

function getAudioFeaturesByEmotion(emotion: string, csv: string): any {
  const parsedData = parseCSV(csv);
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
    .download('emotions.csv');

  const contents = await data.text();

  // Extract the emotion, event, and genre from the request body
  //const { emotion, event, genre } = await req.json()

  // Combine the encodings
  //const data = combineEncodings(emotion, event, genre)

  // read the emotion from the emotions csv

  return new Response(JSON.stringify(contents), {
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
