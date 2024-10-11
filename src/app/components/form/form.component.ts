import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule, NgSwitch, NgSwitchCase } from '@angular/common';
import { EmotionSelectionComponent } from "./emotion-selection/emotion-selection.component";
import { Emotions, Events, Genres } from '../../../../supabase/functions/emotion-event-enum';
import { EventSelectionComponent } from './event-selection/event-selection.component';
import { GenreSelectionComponent } from "./genre-selection/genre-selection.component";
import { FormService } from '../../services/form.service';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  standalone: true,
  imports: [IonicModule, CommonModule, EmotionSelectionComponent, EventSelectionComponent, GenreSelectionComponent],
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
  currentStep: 'emotion' | 'event' | 'genre' = 'emotion';

  constructor(private route: ActivatedRoute, private router: Router, private formService: FormService ) {}


  ngOnInit() {
    
     this.route.queryParams.subscribe((params: { [x: string]: string; }) => {
      if (params['type']) {
        this.generationType = params['type'];
      }
    });
    this.currentStep = 'emotion';
  }
 
  navigateToHome(){
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

 submitForm(){
  const emotionName = this.formService.convertEnumName(Emotions, this.selectedEmotion);
  const eventName = this.formService.convertEnumName(Events, this.selectedEvents);
  const genreName = this.formService.convertEnumName(Genres, this.selectedGenre);
  console.log(emotionName, eventName, genreName);

  this.router.navigate(['/song-results'],{
    queryParams: {
      emotion: emotionName,
      event: eventName,
      genre: genreName
    }
  })
 }
  
}
