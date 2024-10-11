import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../shared/supabase.service';
import { ToastService } from '../../shared/toast/toast.service';
import { CommonService } from '../../shared/common.service';
import * as Tone from 'tone';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [FormsModule]
})
export class LoginComponent  implements OnInit {

  private synth = new Tone.Synth().toDestination();
  private chromaticScale = ['C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4'];

  email: string = "";
  password: string = "";

  constructor(private navCtrl: NavController, private supabase: SupabaseService, private toast: ToastService, private common: CommonService) { }

  ngOnInit() {
    console.log(this.supabase.getSession())
    this.supabase.onAuthStateChange((event, session) => {
      console.log(event);
      if (event === 'SIGNED_IN') {
        // Successful Spotify login, navigate to the home page
        this.navCtrl.navigateForward('tabs/home', { animated: false });
      } else if (event === 'SIGNED_OUT') {
        // Handle user logout or session expiration
        this.navCtrl.navigateForward('/login', { animated: false });
      }
    });
  }

  playNoteForLetter(index: number) {
    const note = this.chromaticScale[index % this.chromaticScale.length];
    this.synth.triggerAttackRelease(note, '8n');
  }

  navigate(route: string) {
    if(route == "forgot") {
      this.navCtrl.navigateForward('/forgot-password', { animated: false })
    } else if (route == "register") {
      this.navCtrl.navigateForward('/register', { animated: false })
    }
  }

  login() {
    //check for empty email or password
    if (this.email === "" || this.password === "") {
      this.toast.showToast("email or password is empty", "error")
    } else {
      this.supabase.signIn(this.email, this.password).then((res) => {
        if(res.error) {
          this.toast.showToast(this.common.lowercaseRemoveStop(res.error.message), "error")
        } else {
          this.navCtrl.navigateForward('tabs/home', { animated: false })
        }
      })
    }
  }

  loginSpotify() {
    this.supabase.signInWithSpotify()
  }
}
