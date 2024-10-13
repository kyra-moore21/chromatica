import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule, NgSwitch, NgSwitchCase } from '@angular/common';
import { EmotionSelectionComponent } from "./emotion-selection/emotion-selection.component";
import { Emotions, Events, Genres } from '../../../../supabase/functions/emotion-event-enum';
import { EventSelectionComponent } from './event-selection/event-selection.component';
import { GenreSelectionComponent } from "./genre-selection/genre-selection.component";
import { FormService } from '../../services/form.service';
import { SpotifyService } from '../../services/spotify-service.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, EmotionSelectionComponent, EventSelectionComponent, GenreSelectionComponent],
  styleUrls: ['./form.component.scss'],
})
export class FormComponent  implements OnInit {
  generationType:string = "Song" //default to song
   //enum references
  Emotions = Emotions;
  Events = Events;
  Genres = Genres;

  //filtering out the nones
  availableEmotions = Object.values(Emotions).filter( v => typeof v === 'number' && v !== Emotions.None);
  availableEvents = Object.values(Events).filter(v => typeof v === 'number' && v !== Events.None);
  availableGenres = Object.values(Genres).filter(v => typeof v === 'number' && v !== Genres.None);

  // Initial selections set to 'None'
  selectedEmotion: Emotions = Emotions.None;
  selectedEvents: Events = Events.None;
  selectedGenre: Genres = Genres.None;

  // Tracks the current step in the form
  currentStep: 'emotion' | 'event' | 'genre'| 'count' = 'emotion';

  numberOfSongs: number = 1; 

  //array of available song count
  songCountOptions:number[] = [10, 20, 30];


  constructor(private route: ActivatedRoute, private router: Router, private formService: FormService, private spotifyService: SpotifyService ) {}


  ngOnInit() {
    
     this.route.queryParams.subscribe((params: { [x: string]: string; }) => {
      if (params['type']) {
        this.generationType = params['type'];
      }
    });
    this.currentStep = 'emotion';
  }
 
  navigateToHome(){
    this.currentStep = 'emotion';
    this.selectedEmotion = Emotions.None;
    this.selectedEvents = Events.None;
    this.selectedGenre = Genres.None;
    this.router.navigate(['/home']);
  }
  onEmotionsChange(emotion: number) {
    this.selectedEmotion = emotion;
    this.currentStep = 'event';
  }
  onEventsChange(event: number){
    this.selectedEvents = event;
    this.currentStep = 'genre';
  }
  onGenresChange(genre: number){
    this.selectedGenre = genre;
  }
  proceedToCount() {
    if (this.generationType === 'Playlist') {
      this.currentStep = 'count';
    }
  }

 submitForm(){
  const emotionName = this.formService.convertEnumName(Emotions, this.selectedEmotion);
  const eventName = this.formService.convertEnumName(Events, this.selectedEvents);
  const genreName = this.formService.convertEnumName(Genres, this.selectedGenre);
  let tracks: number = this.generationType === 'Song' ? 1 : this.numberOfSongs;
  
  this.spotifyService.getSpotifyRecommendations(this.selectedEmotion, this.selectedEvents, this.selectedGenre, tracks).subscribe({
    next: (response) => {
      this.formService.setRecommendation(response);
      //determine the navigation route based on if song or playlist 
      const navigationRoute = this.generationType === 'Song' ? '/song-results' : '/playlist-results';
      this.router.navigate([navigationRoute], {
        queryParams: {
          emotion: emotionName,
          event: eventName,
          genre: genreName
      }
    });
  },
  error: (error) => {
    console.error('Error fetching recommendations:', error);
    // Handle error (e.g., show error message to user)
  }
});
}
onSongCountChange(count: number) {
  this.numberOfSongs = count;
}

getSizeForCount(count: number): { width: string; height: string; fontSize: string } {
  let size: number;
  if (count === 10) {
    size = 140;
  } else if (count === 20) {
    size = 90;
  } else {
    size = 120;
  }
  
  return {
    width: `${size}px`,
    height: `${size}px`,
    fontSize: `${Math.floor(size * 0.2)}px`
  };
}
}
