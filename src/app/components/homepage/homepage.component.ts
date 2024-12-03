import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterOutlet, Router, ActivatedRoute } from '@angular/router';
import { IonicModule, NavController } from '@ionic/angular';
import { SupabaseService } from '../../services/supabase.service';
import { GeneratedPlaylist, GeneratedSong } from '../../models/database.types';
import { play } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { ToastService } from '../../shared/toast/toast.service';
import { NetworkService } from '../../services/network.service';
import { Capacitor } from '@capacitor/core';
import { Emotions, Events, Genres } from '../../../../supabase/functions/emotion-event-enum';
import * as Tone from 'tone';

interface SuggestionItem {
  emotion: Emotions;
  event: Events;
  genre: Genres;
  displayText: string;
  imageUrl: string;
}

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss'],
  imports: [IonicModule],
  standalone: true,
})
export class HomepageComponent implements OnInit {
  synth = new Tone.Synth().toDestination();
  chromaticScale = [
    'C4',
    'C#4',
    'D4',
    'D#4',
    'E4',
    'F4',
    'F#4',
    'G4',
    'G#4',
    'A4',
  ];
  isPlaying = false;
  emotionName: string = '';
  eventName: string = '';
  genreName: string = '';
  songs: GeneratedSong[] = [];
  playlists: GeneratedPlaylist[] = [];
  modelExists: boolean = false;

  constructor(
    private changeDetector: ChangeDetectorRef,
    private supabase: SupabaseService,
    private navCtrl: NavController,
    private toast: ToastService,
    private network: NetworkService
  ) {
    addIcons({ play });
  }

  navigateToForm(type: 'Song' | 'Playlist') {
    this.navCtrl.navigateForward(['/form'], {
      queryParams: { type: type },
      animated: false,
    });
  }

  title = 'chromatica';


  async ngOnInit() {
    this.changeDetector.detectChanges();

    //get user from local storage and check if username is null
    const cachedUser = localStorage.getItem('user');
    const cachedUsername = cachedUser ? JSON.parse(cachedUser).username : null;

    if (!cachedUsername) {
      this.navCtrl.navigateForward('/choose-username', { animated: false });
    }
    //check if model exists
    const model = localStorage.getItem('tensorflowjs_models/model/info');
    this.modelExists = model !== null;

    //if model doesnt exist, then show a loading symbol and load from supabase
    if (this.modelExists == false) {
      //load model from supabase
      this.supabase
        .getClient()
        .from('model_data')
        .select('*')
        .then((data) => {
          if (data.error) {
            console.error('Failed to fetch model info:', data.error);
          } else {
            console.log('Model info fetched:', data);
            //save the model info to local storage
            localStorage.setItem('tensorflowjs_models/model/info', data.data[0].info);
            localStorage.setItem('tensorflowjs_models/model/model_metadata', data.data[0].model_metadata);
            localStorage.setItem('tensorflowjs_models/model/model_topology', data.data[0].model_topology);
            localStorage.setItem('tensorflowjs_models/model/weight_data', data.data[0].weight_data);
            localStorage.setItem('tensorflowjs_models/model/weight_specs', data.data[0].weight_specs);
          }
        });

      this.modelExists = true;
    }

    this.getSpotifyPlaylists();
    this.getSpotifySongs();
  }

  private async getSpotifyPlaylists() {
    await this.supabase.getClient()
      .from('generated_playlists')
      .select('playlist_image_url, spotify_playlist_id')
      .eq('added_to_spotify', true)
      .limit(10)
      .then((data) => {
        if (data.error) {
          console.error('Error fetching playlists:', data.error);
          this.toast.showToast('Error fetching playlists', 'error');
        }
        else {
          console.log('Playlists:', data.data);
          this.playlists = data.data.map((playlist: any) => ({
            ...playlist,
            id: '',
            user_id: '',
            added_to_spotify: true
          }));
        }
      })
  }

  private async getSpotifySongs() {
    await this.supabase.getClient()
      .from('generated_songs')
      .select('song_image_url, spotify_track_id, track_name, artist')
      // .is('playlist_id', null)
      .eq('added_to_spotify', true)
      .limit(10)
      .then((data) => {
        if (data.error) {
          console.error('Error fetching songs:', data.error);
          this.toast.showToast('Error fetching songs', 'error');
        }
        else {
          console.log('Songs:', data.data);
          this.songs = data.data.map((song: any) => ({
            ...song,
            id: '',
            user_id: '',
            added_to_spotify: true
          }));
        }
      })
  }

  handleTouchMove(event: TouchEvent) {
    const touch = event.touches[0]; // Get the touch point
    const element = document.elementFromPoint(
      touch.clientX,
      touch.clientY
    ) as HTMLElement;

    // Check if the touched element is a letter
    if (element && element.id.startsWith('letter-')) {
      const letterIndex = parseInt(element.id.split('-')[1], 10);
      this.playNoteForLetter(letterIndex, element);
    }
  }

  stopPlaying() { }

  playNoteForLetter(index: number, element: HTMLElement) {
    const note = this.chromaticScale[index % this.chromaticScale.length];
    this.synth.triggerAttackRelease(note, '8n');

    // Remove the class, force reflow, then add the class
    element.classList.remove('jump');

    // Force a reflow (paint) before re-adding the class
    void element.offsetWidth;

    element.classList.add('jump');

    // Remove the 'jump' class after the animation ends (0.5s in this case)
    setTimeout(() => {
      element.classList.remove('jump');
    }, 500); // Match the duration of the animation
  }

  suggestionsList: SuggestionItem[] = [
    {
      emotion: Emotions.Angry,
      event: Events.BeachDay,
      genre: Genres.Rock,
      displayText: 'beach day rock',
      imageUrl: '/lil-guys/angry.png'
    },
    {
      emotion: Emotions.Excited,
      event: Events.Walking,
      genre: Genres.Pop,
      displayText: 'walking pop',
      imageUrl: '/lil-guys/excited.png'
    },
    {
      emotion: Emotions.Happy,
      event: Events.Running,
      genre: Genres.EDM,
      displayText: 'running edm',
      imageUrl: '/lil-guys/angry.png'
    },
    {
      emotion: Emotions.Hopeful,
      event: Events.Study,
      genre: Genres.LoFi,
      displayText: 'study lofi',
      imageUrl: '/lil-guys/hopeful.png'
    },
    {
      emotion: Emotions.Calm,
      event: Events.Sleep,
      genre: Genres.Ambient,
      displayText: 'sleep ambient',
      imageUrl: '/lil-guys/hopeful.png'
    },
    {
      emotion: Emotions.Peaceful,
      event: Events.Morning,
      genre: Genres.Jazz,
      displayText: 'morning jazz',
      imageUrl: '/lil-guys/angry.png'
    },
    {
      emotion: Emotions.Joy,
      event: Events.Party,
      genre: Genres.House,
      displayText: 'party house',
      imageUrl: '/lil-guys/angry.png'
    },
    {
      emotion: Emotions.Grateful,
      event: Events.Evening,
      genre: Genres.Soul,
      displayText: 'evening soul',
      imageUrl: '/lil-guys/grateful.png'
    }
  ];

  async train() {
    await this.network.train();
  }
}
