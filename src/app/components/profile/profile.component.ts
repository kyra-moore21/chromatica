import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../shared/supabase.service';
import { ToastService } from '../../shared/toast/toast.service';
import { CommonService } from '../../shared/common.service';
import { NavController } from '@ionic/angular';
@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  standalone: true
})
export class ProfileComponent  implements OnInit {

  privacyPublic = true;
  privacyPrivate = false;
  privacyFriends = false;
  emailNotifications = true;
  pushNotifications = true;

  constructor(private supabase: SupabaseService, private toast: ToastService, private common: CommonService, private navCtrl: NavController) { }

  ngOnInit() {
    
  }

  privacyChange(privacy: string){
    if(privacy === 'public'){
      this.privacyPublic = true;
      this.privacyPrivate = false;
      this.privacyFriends = false;
    }
    else if(privacy === 'private'){
      this.privacyPublic = false;
      this.privacyPrivate = true;
      this.privacyFriends = false;
    }
    else if(privacy === 'friends'){
      this.privacyPublic = false;
      this.privacyPrivate = false;
      this.privacyFriends = true;
    }
  }

  logout() {
    this.supabase.signOut().then((res) => {
      if (res.error) {
        this.toast.showToast(this.common.lowercaseRemoveStop(res.error.message), "error")
      } else {
        this.navCtrl.navigateForward('login', { animated: false })
      }
    })
  }

}
