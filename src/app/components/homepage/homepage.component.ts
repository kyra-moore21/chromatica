import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterOutlet, Router, ActivatedRoute } from '@angular/router';
import { IonicModule, NavController } from '@ionic/angular';
import { SupabaseService } from '../../services/supabase.service';
import { NetworkService } from '../../services/network.service';

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
  modelExists: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private changeDetector: ChangeDetectorRef,
    private supabaseService: SupabaseService,
    private navCtrl: NavController,
    private network: NetworkService
  ) {}

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

    //if model doesnt exist, then show a loading symbol and generate a new one for the user
    if(this.modelExists == false) {
      await this.network.train();
      this.modelExists = true;
    }
  }
}
