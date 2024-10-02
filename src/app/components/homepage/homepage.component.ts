import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule, NavController } from '@ionic/angular';


@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss'],
  imports: [IonicModule],
  standalone: true
})
export class HomepageComponent  implements OnInit {


  constructor(private router: Router) { }


  ngOnInit() {}


  navigateToForm(type: 'Song' | 'Playlist'){
    this.router.navigate(['/form'], {
      queryParams: { type: type }
    });
   
  }


}
