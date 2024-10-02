import { Component, OnInit } from '@angular/core';
// Simplified enums for example purposes
enum Emotion {
    Happy = 0,
    Sad,
    Excited,
    Calm,
    Angry,
    Joyful,
    Nervous,
    Relaxed,
    Fearful,
    Surprised,
    Confident,
    Anxious,
    Bored,
    Enthusiastic,
    Curious,
    Frustrated,
    Grateful,
    Hopeful,
    Lonely,
    Motivated,
    Overwhelmed,
    Peaceful,
    Proud,
    Resentful,
    Satisfied,
    Stressed,
    Tired,
    Embarrassed,
    Disappointed,
    Optimistic,
    Indifferent,
    Restless,
    Melancholic,
    Impatient,
    Nostalgic,
    Confused,
    Jealous,
    Inspired,
    Determined,
    Resigned,
    None
  
}

enum Event {
  Party = 0,
  Workout,
  Study,
  Relax,
  Drive,
  Roadtrip,
  None
}

enum Genre {
  Pop = 0,
  Rock,
  Jazz,
  Classical,
  None
}

@Component({
  selector: 'app-mood-button',
  templateUrl: './mood-button.component.html',
  styleUrls: ['./mood-button.component.scss'],
  standalone: true
})
export class MoodButtonComponent  implements OnInit {
  //enum references, later can be inputs() of the larger list we have
  Emotion = Emotion;
  Event = Event;
  Genre = Genre;

  //filtering out the nones
  emotions = Object.values(Emotion).filter(v => typeof v === 'number' && v !== Emotion.None);
  events = Object.values(Event).filter(v => typeof v === 'number' && v !== Event.None);
  genres = Object.values(Genre).filter(v => typeof v === 'number' && v !== Genre.None);

  //set to track selections
  emotionSelections = new Set<Emotion>();
  eventSelections = new Set<Event>();
  genreSelections = new Set<Genre>();

  constructor() { }

  ngOnInit() {}
  // Generic toggle function for any type of selection (Emotion, Event, Genre)
  toggleSelected<T>(item: T, selectionSet: Set<T>) {
    if (selectionSet.has(item)) {
      selectionSet.delete(item);  // Deselect if already selected
    } else {
      selectionSet.add(item);  // Select if not already selected
    }
  }

  //checks if item is select
  isSelected<T>(item: T, selectionSet: Set<T>){
    return selectionSet.has(item);
  }
  
}
