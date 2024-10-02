import { Component, OnInit } from '@angular/core';
import { IonLabel, IonTabs, IonIcon, IonTabBar, IonTabButton } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { homeOutline, timeOutline, peopleOutline, personOutline } from 'ionicons/icons';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss'],
  standalone: true, 
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel]
})
export class TabsComponent  implements OnInit {

  constructor() { 
    addIcons({ homeOutline, timeOutline, peopleOutline, personOutline  })
  }

  ngOnInit() {}

}
