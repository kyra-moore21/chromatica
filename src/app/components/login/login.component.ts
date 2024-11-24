import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';
import { ToastService } from '../../shared/toast/toast.service';
import { CommonService } from '../../services/common.service';
import * as Tone from 'tone';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [FormsModule],
})
export class LoginComponent implements OnInit {
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

  email: string = '';
  password: string = '';

  constructor(
    private navCtrl: NavController,
    private supabase: SupabaseService,
    private toast: ToastService,
    private common: CommonService
  ) {}

  ngOnInit() {
    // Subscribe to auth changes
    this.supabase.authState$.subscribe(({ event, session }) => {
      console.log('Auth state changed:', event);
      if (event === 'SIGNED_IN' && session) {
        this.handleSignIn(session);
      }
    });
  }

  private handleSignIn(session: any) {
    const userId = session.user.id;

    // Example user fetch and navigation logic
    this.supabase
      .getClient()
      .from('users')
      .select('*')
      .eq('id', userId)
      .then((data) => {
        if (data.error) {
          console.error('Failed to fetch user:', data.error);
        } else {
          localStorage.setItem('user', JSON.stringify(data.data[0]));
          this.navCtrl.navigateForward('tabs/home', { animated: false });
        }
      });
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

  stopPlaying() {}

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

  navigate(route: string) {
    if (route == 'forgot') {
      this.navCtrl.navigateForward('/forgot-password', { animated: false });
    } else if (route == 'register') {
      this.navCtrl.navigateForward('/register', { animated: false });
    }
  }

  login() {
    //check for empty email or password
    if (this.email === '' || this.password === '') {
      this.toast.showToast('email or password is empty', 'error');
    } else {
      this.supabase.signIn(this.email, this.password).then((res) => {
        if (res.error) {
          this.toast.showToast(
            this.common.lowercaseRemoveStop(res.error.message),
            'error'
          );
        } else {
          this.navCtrl.navigateForward('tabs/home', { animated: false });
        }
      });
    }
  }

  async loginSpotify() {
    if (Capacitor.isNativePlatform()) {
      const { data, error } = await this.supabase.signInWithSpotify(
        'chromatica://callback'
      );
    } else {
      const { data, error } = await this.supabase.signInWithSpotify();
    }
  }
}
