import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-pass-forgot',
  templateUrl: './pass-forgot.component.html',
  styleUrls: ['./pass-forgot.component.scss'],
  standalone: true,
  imports: [FormsModule],
})
export class PassForgotComponent implements OnInit {
  email: string = '';

  constructor(
    private navCtrl: NavController,
    private supabase: SupabaseService
  ) {}

  ngOnInit() {}

  navigate() {
    this.navCtrl.navigateBack('login', { animated: false });
  }

  sendReset() {

  }
}
