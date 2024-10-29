import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, IonicModule, NavController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import {
  Emotions,
  Events,
  Genres,
} from '../../../../supabase/functions/emotion-event-enum';
import { addIcons } from 'ionicons';
import { close } from 'ionicons/icons';
import { FormService } from '../../services/form.service';
import { SpotifyService } from '../../services/spotify-service.service';
import { FormsModule } from '@angular/forms';
import { ButtonSelectionComponent } from './button-selection/button-selection.component';
import { IsLoadingComponent } from '../is-loading/is-loading.component';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ButtonSelectionComponent,
    IsLoadingComponent,
  ],
  styleUrls: ['./form.component.scss'],
})
export class FormComponent implements OnInit {
  @ViewChild(IonContent, { static: false }) content!: IonContent;
  generationType: 'Song' | 'Playlist' = 'Song';
  //enum references
  Emotions = Emotions;
  Events = Events;
  Genres = Genres;

  //filtering out the nones
  availableEmotions = Object.values(Emotions).filter(
    (v) => typeof v === 'number' && v !== Emotions.None
  );
  availableEvents = Object.values(Events).filter(
    (v) => typeof v === 'number' && v !== Events.None
  );
  availableGenres = Object.values(Genres).filter(
    (v) => typeof v === 'number' && v !== Genres.None
  );

  // Initial selections set to 'None'
  selectedEmotion: Emotions = Emotions.None;
  selectedEvents: Events = Events.None;
  selectedGenre: Genres = Genres.None;

  // Tracks the current step in the form
  currentStep: 'emotion' | 'event' | 'genre' | 'count' = 'emotion';

  numberOfSongs: number = 1;

  //array of available song count
  songCountOptions: number[] = [10, 20, 30];

  isLoading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formService: FormService,
    private spotifyService: SpotifyService,
    private navCtrl: NavController
  ) {
    addIcons({ close });
  }

  ngOnInit() {
    this.route.queryParams.subscribe((params: { [x: string]: string }) => {
      if (params['type']) {
        this.generationType = params['type'] as 'Song' | 'Playlist';
      }
    });
    this.currentStep = 'emotion';
  }

  //resolves issue where when moving through the form, it wasn't resetting scroll position
  scrollToTop() {
    if (this.content) {
      this.content.scrollToTop(300);
    }
  }

  navigateToHome() {
    this.resetForm();
    this.navCtrl.navigateBack(['/tabs/home'], { animated: false });
  }

  //setting selected emotion to pass in load recommendations
  onEmotionsChange(emotion: Emotions) {
    this.selectedEmotion = emotion;
  }

  onEventsChange(event: Events) {
    this.selectedEvents = event;
  }

  onGenresChange(genre: Genres) {
    this.selectedGenre = genre;
  }
  changeStep(newStep: 'emotion' | 'event' | 'genre' | 'count') {
    this.currentStep = newStep;
    this.scrollToTop();
  }

  proceedToCount() {
    if (this.generationType === 'Playlist') {
      this.changeStep('count');
    } else {
      this.submitForm();
    }
  }

  submitForm() {
    this.isLoading = true;
    const emotionName = this.formService.convertEnumName(
      Emotions,
      this.selectedEmotion
    );
    const eventName = this.formService.convertEnumName(
      Events,
      this.selectedEvents
    );
    const genreName = this.formService.convertEnumName(
      Genres,
      this.selectedGenre
    );
    let tracks: number =
      this.generationType === 'Song' ? 1 : this.numberOfSongs;

    this.spotifyService
      .getSpotifyRecommendations(
        this.selectedEmotion,
        this.selectedEvents,
        this.selectedGenre,
        tracks
      )
      .subscribe({
        next: async (response) => {
          await this.formService.setRecommendation(
            response,
            this.generationType
          );
          const navigationRoute =
            this.generationType === 'Song'
              ? '/song-results'
              : '/playlist-results';
          this.navCtrl.navigateForward([navigationRoute], {
            queryParams: {
              emotion: emotionName,
              event: eventName,
              genre: genreName,
            },
            animated: false,
          });
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error fetching recommendations:', error);
          this.isLoading = false;
          // Handle error (e.g., show error message to user)
        },
        complete: () => {
          this.resetForm();
        },
      });
  }
  onSongCountChange(count: number) {
    this.numberOfSongs = count;
  }

  getSizeForCount(count: number): {
    width: string;
    height: string;
    fontSize: string;
  } {
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
      fontSize: `${Math.floor(size * 0.2)}px`,
    };
  }
  resetForm() {
    this.selectedEmotion = Emotions.None;
    this.selectedEvents = Events.None;
    this.selectedGenre = Genres.None;
    this.numberOfSongs = 1;
  }
  ionViewDidEnter() {
    this.scrollToTop();
  }
}
