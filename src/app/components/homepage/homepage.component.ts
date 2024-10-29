import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterOutlet, Router, ActivatedRoute } from '@angular/router';
import { IonicModule, NavController } from '@ionic/angular';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss'],
  imports: [IonicModule],
  standalone: true,
})
export class HomepageComponent implements OnInit {
  emotionName: string = '';
  eventName: string = '';
  genreName: string = '';
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private changeDetector: ChangeDetectorRef,
    private supabaseService: SupabaseService,
    private navCtrl: NavController
  ) {}

  navigateToForm(type: 'Song' | 'Playlist') {
    this.navCtrl.navigateForward(['/form'], {
      queryParams: { type: type },
      animated: false,
    });
  }

  title = 'chromatica';

  ngOnInit() {
    this.changeDetector.detectChanges();

    //get user from local storage and check if username is null
    const cachedUser = localStorage.getItem('user');
    const cachedUsername = cachedUser ? JSON.parse(cachedUser).username : null;

    if (!cachedUsername) {
      this.navCtrl.navigateForward('/choose-username', { animated: false });
    }
  }
}
