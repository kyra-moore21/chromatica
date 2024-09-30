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

// Function to one-hot encode emotions
function oneHotEncodeEmotion(emotion: Emotions): number[] {
  //get the emotion number
  const emoNum = +Emotions[emotion];
  const emotionVector = new Array(Object.keys(Emotions).length / 2).fill(0); // Create zero vector of length 25
  emotionVector[emoNum] = 1; // Set the index of the selected emotion to 1
  return emotionVector;
}

// Function to one-hot encode events
function oneHotEncodeEvent(event: Events): number[] {
  //get the event number
  const eventNum = +Events[event];
  const eventVector = new Array(Object.keys(Events).length / 2).fill(0); // Create zero vector of length 25
  eventVector[eventNum] = 1; // Set the index of the selected event to 1
  return eventVector;
}

// Function to one-hot encode genres
function oneHotEncodeGenre(genre: Genres): number[] {
  //get the genre number
  const genreNum = +Genres[genre];
  const genreVector = new Array(Object.keys(Genres).length / 2).fill(0); // Create zero vector of length 50
  genreVector[genreNum] = 1; // Set the index of the selected genre to 1
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
  //check if any of the inputs is none and set that input to all zeros
  if (emotion == Emotions.None) {
    emotionVector = new Array(Object.keys(Emotions).length / 2).fill(0); // Create zero vector of length 25
  } else {
    emotionVector = oneHotEncodeEmotion(emotion);
  }
  if (event == Events.None) {
    eventVector = new Array(Object.keys(Events).length / 2).fill(0); // Create zero vector of length 25
  } else {
    eventVector = oneHotEncodeEvent(event);
  }
  if (genre == Genres.None) {
    genreVector = new Array(Object.keys(Genres).length / 2).fill(0); // Create zero vector of length 50
  } else {
    genreVector = oneHotEncodeGenre(genre);
  }

  // Concatenate both vectors
  const combinedVector = [...emotionVector, ...eventVector, ...genreVector]; // This creates a 50-length vector
  return combinedVector;
}
