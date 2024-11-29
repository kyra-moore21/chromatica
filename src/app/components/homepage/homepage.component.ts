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
    private supabase: SupabaseService,
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

    //if model doesnt exist, then show a loading symbol and load from supabase
    if(this.modelExists == false) {
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
  }
}
