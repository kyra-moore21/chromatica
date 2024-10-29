import { Component, OnInit } from '@angular/core';
import { IonIcon, NavController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronBackOutline } from 'ionicons/icons';

@Component({
  selector: 'app-friend-list',
  templateUrl: './friend-list.component.html',
  styleUrls: ['./friend-list.component.scss'],
  standalone: true,
  imports: [IonIcon]
})
export class FriendListComponent  implements OnInit {

  constructor(private navCtrl: NavController) {
    addIcons({ chevronBackOutline })
  }

  ngOnInit() {}

  navigateBack() {
    this.navCtrl.navigateBack('/tabs/social', { animated: false });
  }

}
