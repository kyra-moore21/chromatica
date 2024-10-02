export enum Emotions {
  Happy = 0,
  Sad,
  Angry,
  Calm,
  Excited,
  Love,
  Fear,
  Hopeful,
  Lonely,
  Joy,
  Anxiety,
  Peaceful,
  Confident,
  Tense,
  Nostalgic,
  Curious,
  Frustrated,
  Relaxed,
  Bored,
  Surprised,
  Embarrassed,
  Grateful,
  Guilty,
  Proud,
  Scared,
  None,
}

export enum Events {
  Vacation = 0,
  Roadtrip,
  Work,
  Study,
  Party,
  Relaxation,
  Exercise,
  Morning,
  Evening,
  Sleep,
  Driving,
  Walking,
  Running,
  Cooking,
  Cleaning,
  Shopping,
  Hiking,
  Date,
  Celebration,
  Meditation,
  Workout,
  Reading,
  BeachDay,
  Camping,
  FamilyTime,
  None,
}

export enum Genres {
  Pop = 0,
  Rock,
  HipHop,
  Jazz,
  Classical,
  Country,
  Electronic,
  RnB,
  Reggae,
  Blues,
  Metal,
  Folk,
  Indie,
  Punk,
  Soul,
  Funk,
  Disco,
  House,
  Techno,
  Trap,
  Dubstep,
  Grunge,
  Ambient,
  DrumAndBass,
  EDM,
  Latin,
  Gospel,
  KPop,
  Afrobeat,
  Dancehall,
  Ska,
  Bluegrass,
  Synthwave,
  Trance,
  Garage,
  Opera,
  Acoustic,
  Emo,
  Shoegaze,
  Hardcore,
  Industrial,
  Experimental,
  Chillout,
  NewWave,
  LoFi,
  PostRock,
  ProgressiveRock,
  PsychedelicRock,
  Soundtrack,
  WorldMusic,
  Alternative,
  None,
}

// Adjusting to exclude "None" from length calculation
const emotionLength = (Object.keys(Emotions).length / 2) - 1;
const eventLength = (Object.keys(Events).length / 2) - 1;
const genreLength = (Object.keys(Genres).length / 2) - 1;

// Function to one-hot encode emotions
function oneHotEncodeEmotion(emotion: Emotions): number[] {
  // Ensure that 'emotion' is used directly as it already represents the numeric value
  const emotionVector = new Array(emotionLength).fill(0);
  if (emotion >= 0 && emotion < emotionLength) {
    emotionVector[emotion] = 1; // Set the index of the selected emotion to 1
  }
  return emotionVector;
}

// Function to one-hot encode events
function oneHotEncodeEvent(event: Events): number[] {
  // Use 'event' directly
  const eventVector = new Array(eventLength).fill(0);
  if (event >= 0 && event < eventLength) {
    eventVector[event] = 1;
  }
  return eventVector;
}

// Function to one-hot encode genres
function oneHotEncodeGenre(genre: Genres): number[] {
  // Use 'genre' directly
  const genreVector = new Array(genreLength).fill(0);
  if (genre >= 0 && genre < genreLength) {
    genreVector[genre] = 1;
  }
  return genreVector;
}

// Function to combine one-hot encodings of both emotion and event
export function combineEncodings(
  emotion: Emotions,
  event: Events,
  genre: Genres
): number[] {
  let emotionVector;
  let eventVector;
  let genreVector;

  // Check if any of the inputs is "None" and set that input to all zeros
  if (emotion == Emotions.None) {
    emotionVector = new Array(emotionLength).fill(0);
  } else {
    emotionVector = oneHotEncodeEmotion(emotion);
  }

  if (event == Events.None) {
    eventVector = new Array(eventLength).fill(0);
  } else {
    eventVector = oneHotEncodeEvent(event);
  }

  if (genre == Genres.None) {
    genreVector = new Array(genreLength).fill(0);
  } else {
    genreVector = oneHotEncodeGenre(genre);
  }

  // Concatenate the vectors
  const combinedVector = [...emotionVector, ...eventVector, ...genreVector];
  return combinedVector;
}
