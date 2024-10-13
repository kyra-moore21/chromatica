import { Component, OnInit } from '@angular/core';
import { GeneratedSong } from '../../models/generated-song';
import { addIcons } from 'ionicons';
import { IonIcon } from '@ionic/angular/standalone';
import { pause, play } from 'ionicons/icons';
import { ActivatedRoute, Router } from '@angular/router';
import { FormService } from '../../services/form.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-playlist-results',
  templateUrl: './playlist-results.component.html',
  styleUrls: ['./playlist-results.component.scss'],
  imports: [IonIcon, CommonModule],
  standalone: true
})
export class PlaylistResultsComponent  implements OnInit {
emotionName: number = 0;
eventName: number = 0;
genreName: number = 0;
recommendations: GeneratedSong[] = [];
errorMsg: string = '';
currentlyPlayingIndex: number | null = null;
audioElement: HTMLAudioElement | null = null;
spotifyPlaylistLink: string = '';

  constructor(private router: Router, private route: ActivatedRoute, private formService: FormService) {
    addIcons({ play, pause});
   }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
        this.emotionName = params['emotion'] || 'None';
        this.eventName = params['event'] || 'None';
        this.genreName = params['genre'] || 'None';
    });
    this.loadRecommendation();
  }
   loadRecommendation(){
    this.recommendations = this.formService.getRecommendation();
   }

   togglePlayPause(index: number) {
    if (this.currentlyPlayingIndex === index) {
      // Pause the currently playing song
      this.audioElement?.pause();
      this.currentlyPlayingIndex = null;
    } else {
      // Stop the currently playing song (if any)
      if (this.audioElement) {
        this.audioElement.pause();
        this.audioElement = null;
      }

      // Play the new song
      const song = this.recommendations[index];
      if (song.previewUrl) {
        this.audioElement = new Audio(song.previewUrl);
        this.audioElement.play();
        this.currentlyPlayingIndex = index;

        // Add ended event listener
        this.audioElement.addEventListener('ended', () => {
          this.currentlyPlayingIndex = null;
        });
      }
    }
  }

  isPlaying(index: number): boolean {
    return this.currentlyPlayingIndex === index;
  }
  navigateToHome(){
    this.router.navigate(['/home']);
    }
}
