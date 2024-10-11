import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SpotifyService } from '../../services/spotify-service.service';
import { GeneratedSong } from '../../models/generated-song';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { pause, play } from 'ionicons/icons';
import { FormService } from '../../services/form.service';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-song-results',
  templateUrl: './song-results.component.html',
  styleUrls: ['./song-results.component.css'],
  imports: [IonIcon, CommonModule],
  standalone: true
})
export class SongResultsComponent  implements OnInit {
  @ViewChild('audioPlayer') audioPlayer!: ElementRef<HTMLAudioElement>;
  emotionName: number = 0;
  eventName: number = 0;
  genreName: number = 0;
  recommendation = {} as GeneratedSong;
  isLoading: boolean = true; 
  errorMessage: string = ''
  isPlaying: boolean = false;

  constructor(private route: ActivatedRoute, private router: Router, private spotifyService: SpotifyService, private formService: FormService) { 
    addIcons({ play, pause})
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.emotionName = params['emotion'] || 'None'; //fallback to none if not provided
      this.eventName = params['event'] || 'None';
      this.genreName = params['genre'] || 'None';

        // Log the values for debugging
        console.log('Emotion:', this.emotionName);
        console.log('Event:', this.eventName);
        console.log('Genre:', this.genreName);
        
        this.loadRecommendations();
        });
  }

   loadRecommendations() {
    this.isLoading = true;
    this.errorMessage = "";
    this.recommendation = {} as GeneratedSong; // Reset recommendation before making a new call
      this.spotifyService.getSpotifyRecommendations(this.emotionName, this.eventName, this.genreName).subscribe({
        next: (response: GeneratedSong) => {
          console.log(response);
          this.recommendation = response;
          this.isLoading = false;
        },
        error: (error) => {
          this.errorMessage = 'An unexpected error occurred. Please try again.';
          this.isLoading = false;
          console.error('Error fetching recommendations:', error);
        },
        complete: () => {
          console.log('Recommendation fetching complete');
        }
   });
  }
  togglePlayPause() {
    const audio = this.audioPlayer.nativeElement;
    this.isPlaying ? audio.pause() : audio.play();
    this.isPlaying = !this.isPlaying;
  }
  spiltOnCapital(str: string): string{
    return this.formService.splitOnCapital(str);
  }
  navigateToHome(){
    this.router.navigate(['/home']);
    }

  }



  
