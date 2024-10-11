import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { SupabaseService } from '../../shared/supabase.service';
import { ToastService } from '../../shared/toast/toast.service';
import { FormsModule } from '@angular/forms';
import { CommonService } from '../../shared/common.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  standalone: true,
  imports: [FormsModule]
})
export class RegisterComponent  implements OnInit {
  email: string = "";
  username: string = "";
  password: string = "";
  confirmPass: string = "";

  constructor(private navCtrl: NavController, private supabase: SupabaseService, private toast: ToastService, private common: CommonService) { }

  ngOnInit() {}

  register() {
    //check for empty email or password
    if (this.email === "" || this.password === "" || this.username === "") {
      this.toast.showToast("email, username, or password is empty", "error")
      return
    }
    //check if passwords match
    if (this.password === this.confirmPass) {
      this.supabase.signUp(this.email, this.password, this.username).then((res) => {
        console.log(res)
        if (res.error) {
          this.toast.showToast(this.common.lowercaseRemoveStop(res.error.message), "error")
        } else {
          this.toast.showToast("user created", "success")
          this.navCtrl.navigateForward('login', { animated: false })
        }
      })
    } else {
      this.toast.showToast("passwords do not match", "error")
    }
  }

  navigate() {
    this.navCtrl.navigateBack('login', { animated: false })
  }

}
