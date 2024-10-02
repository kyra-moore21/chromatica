import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { MoodButtonComponent } from "./mood-button/mood-button.component";

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  standalone: true,
  imports: [IonicModule, MoodButtonComponent],
  styleUrls: ['./form.component.scss'],
})
export class FormComponent  implements OnInit {
  generationType:string = "Song" //default to song


  constructor(private route: ActivatedRoute, private router: Router) {}


  ngOnInit() {
     this.route.queryParams.subscribe(params => {
      if (params['type']) {
        this.generationType = params['type'];
      }
    });
  }
  navigateToHome(){
    this.router.navigate(['/home']);
  }


}
