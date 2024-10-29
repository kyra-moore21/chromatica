import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';
import { ToastService } from '../../shared/toast/toast.service';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-choose-username',
  templateUrl: './choose-username.component.html',
  styleUrls: ['./choose-username.component.scss'],
  standalone: true,
  imports: [FormsModule],
})
export class ChooseUsernameComponent implements OnInit {
  username: string = '';

  constructor(
    private supabaseService: SupabaseService,
    private toast: ToastService,
    private navCtrl: NavController
  ) {}

  ngOnInit() {}

  saveUsername() {
    // Preprocess the username before saving
    let processedUsername = this.username.trim(); // Remove leading/trailing spaces

    // Check for invalid characters (only allow alphanumeric characters)
    const validUsernameRegex = /^[a-zA-Z0-9_]+$/;

    // Check for empty, spaces, minimum length, and allowed characters
    if (processedUsername === '') {
      this.toast.showToast('username cannot be empty.', 'error');
      return;
    }

    if (processedUsername.length < 3 || processedUsername.length > 20) {
      this.toast.showToast(
        'username must be between 3 and 20 characters.',
        'error'
      );
      return;
    }

    if (!validUsernameRegex.test(processedUsername)) {
      this.toast.showToast(
        'username can only contain letters, numbers, and underscores.',
        'error'
      );
      return;
    }

    //now check if the username is already taken
    this.supabaseService
      .getClient()
      .from('users')
      .select('username')
      .eq('username', processedUsername)
      .then(async (data) => {
        if (data.data && data.data.length > 0) {
          this.toast.showToast('username is already taken.', 'error');
        } else {
          //get session
          const session = await this.supabaseService.getSession();
          // Save the username to the database
          this.supabaseService
            .getClient()
            .from('users')
            .update({ username: processedUsername })
            .eq('id', session.data.session?.user.id)
            .then(() => {
              //set username in local storage
              const user = JSON.parse(localStorage.getItem('user') || '{}');
              user.username = processedUsername;
              localStorage.setItem('user', JSON.stringify(user));
              this.toast.showToast('username saved successfully.', 'success');
              this.navCtrl.navigateBack('/tabs/home', { animated: false });
            });
        }
      });
  }
}
