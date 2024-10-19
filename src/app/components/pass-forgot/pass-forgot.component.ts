import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../shared/supabase.service';


@Component({
  selector: 'app-pass-forgot',
  templateUrl: './pass-forgot.component.html',
  styleUrls: ['./pass-forgot.component.scss'],
  standalone: true,
  imports: [FormsModule]
})
export class PassForgotComponent  implements OnInit {

  email: string = "";

  constructor(private navCtrl: NavController, private supabase: SupabaseService) { }

  ngOnInit() {}

  navigate() {
    this.navCtrl.navigateBack('login', { animated: false })
  }

  sendReset() {
    //check if email is populated
    this.supabase.forgotPass(this.email)
  }

}
