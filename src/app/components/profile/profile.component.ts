import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { ToastService } from '../../shared/toast/toast.service';
import { CommonService } from '../../services/common.service';
import { NavController } from '@ionic/angular';
import { Database, User } from '../../models/database.types';
import { FormsModule } from '@angular/forms';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { addIcons } from 'ionicons';
import { createOutline } from 'ionicons/icons';
import { IonIcon } from '@ionic/angular/standalone';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  standalone: true,
  imports: [FormsModule, IonIcon],
})
export class ProfileComponent implements OnInit {
  privacyPublic = false;
  privacyPrivate = false;
  privacyFriends = false;
  emailNotifications = true;
  pushNotifications = true;
  spotifyPicUrl = '';
  user: User = {
    avatar_url: null,
    created_at: null,
    deleted_at: null,
    email: '',
    friend_count: null,
    id: '',
    is_spotify_connected: null,
    last_spotify_sync: null,
    profile_visibility: null,
    spotify_id: null,
    updated_at: null,
    username: null,
    social_score: null,
    push_notifications: null,
    email_notifications: null,
  };
  newUsername: string = '';
  selectedImage: string | undefined;

  constructor(
    private supabase: SupabaseService,
    private toast: ToastService,
    private common: CommonService,
    private navCtrl: NavController
  ) {
    addIcons({ createOutline });
  }

  async ngOnInit() {
    //get user from local storage
    const cachedUser = localStorage.getItem('user');
    this.user = cachedUser ? JSON.parse(cachedUser) : null;

    this.supabase.getSession().then((session) => {
      const spotifyIdentity = session.data.session?.user.identities?.find(
        (identity: any) => identity.provider === 'spotify'
      );
      if (spotifyIdentity) {
        //check if user spotify id is set and if spotify is connected
        if (this.user.spotify_id && this.user.is_spotify_connected) {
          this.spotifyPicUrl = spotifyIdentity.identity_data?.['avatar_url'];
        } else {
          //set the supabase user spotify id and is_spotify_connected to true
          this.supabase
            .getClient()
            .from('users')
            .update({
              spotify_id: spotifyIdentity.id,
              is_spotify_connected: true,
            })
            .eq('id', this.user.id)
            .then((data) => {
              if (data.error) {
                this.toast.showToast(
                  this.common.lowercaseRemoveStop(data.error.message),
                  'error'
                );
              } else {
                //set local storage user
                this.user.spotify_id = spotifyIdentity.id;
                this.user.is_spotify_connected = true;
                localStorage.setItem('user', JSON.stringify(this.user));
                this.spotifyPicUrl =
                  spotifyIdentity.identity_data?.['avatar_url'];
              }
            });
        }
      }
    });

    if (this.user.profile_visibility === 'public') {
      this.privacyPublic = true;
      this.privacyPrivate = false;
      this.privacyFriends = false;
    } else if (this.user.profile_visibility === 'private') {
      this.privacyPublic = false;
      this.privacyPrivate = true;
      this.privacyFriends = false;
    } else if (this.user.profile_visibility === 'friends') {
      this.privacyPublic = false;
      this.privacyPrivate = false;
      this.privacyFriends = true;
    }
  }

  privacyChange(privacy: string) {
    //switch for privacy settings
    switch (privacy) {
      case 'public':
        this.privacyPublic = true;
        this.privacyPrivate = false;
        this.privacyFriends = false;
        break;
      case 'private':
        this.privacyPublic = false;
        this.privacyPrivate = true;
        this.privacyFriends = false;
        break;
      case 'friends':
        this.privacyPublic = false;
        this.privacyPrivate = false;
        this.privacyFriends = true;
        break;
    }
    //update the user profile visibility
    this.supabase
      .getClient()
      .from('users')
      .update({ profile_visibility: privacy })
      .eq('id', this.user.id)
      .then((data) => {
        if (data.error) {
          this.toast.showToast(
            this.common.lowercaseRemoveStop(data.error.message),
            'error'
          );
        } else {
          //set local storage user
          this.user.profile_visibility = privacy;
          localStorage.setItem('user', JSON.stringify(this.user));
        }
      });
  }

  toggleNotif(type: any) {
    //toggle email or push notifications
    if (type === 'email') {
      this.emailNotifications = !this.emailNotifications;
      this.supabase
        .getClient()
        .from('users')
        .update({ email_notifications: this.emailNotifications })
        .eq('id', this.user.id)
        .then((data) => {
          if (data.error) {
            this.toast.showToast(
              this.common.lowercaseRemoveStop(data.error.message),
              'error'
            );
          } else {
            //set local storage user
            this.user.email_notifications = this.emailNotifications;
            localStorage.setItem('user', JSON.stringify(this.user));
          }
        });
    } else {
      this.pushNotifications = !this.pushNotifications;
      this.supabase
        .getClient()
        .from('users')
        .update({ push_notifications: this.pushNotifications })
        .eq('id', this.user.id)
        .then((data) => {
          if (data.error) {
            this.toast.showToast(
              this.common.lowercaseRemoveStop(data.error.message),
              'error'
            );
          } else {
            //set local storage user
            this.user.push_notifications = this.pushNotifications;
            localStorage.setItem('user', JSON.stringify(this.user));
          }
        });
    }
  }

  logout() {
    this.supabase.signOut().then((res) => {
      if (res.error) {
        this.toast.showToast(
          this.common.lowercaseRemoveStop(res.error.message),
          'error'
        );
      } else {
        //clear local storage
        localStorage.removeItem('user');
        this.navCtrl.navigateForward('login', { animated: false });
      }
    });
  }

  saveUsername() {
    // Preprocess the username before saving
    let processedUsername = this.newUsername.trim(); // Remove leading/trailing spaces

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
    this.supabase
      .getClient()
      .from('users')
      .select('username')
      .eq('username', processedUsername)
      .then(async (data) => {
        if (data.data && data.data.length > 0) {
          this.toast.showToast('username is already taken.', 'error');
        } else {
          // Save the username to the database
          this.supabase
            .getClient()
            .from('users')
            .update({ username: processedUsername })
            .eq('id', this.user.id)
            .then((res) => {
              if (res.error) {
                this.toast.showToast(
                  this.common.lowercaseRemoveStop(res.error.message),
                  'error'
                );
              } else {
                //set username in local storage
                this.user.username = processedUsername;
                localStorage.setItem('user', JSON.stringify(this.user));
                this.toast.showToast('username saved successfully.', 'success');
              }
            });
        }
      });
  }

  // Method to take a picture using the phone's camera
  async takePicture() {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera,
    });
    this.selectedImage = image.dataUrl; // Store the base64 image
    this.updateImagePreview();
  }

  // Method to choose a picture from the gallery
  async chooseFromGallery() {
    console.log("Initiating camera operation...");
    
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos,
      });
      
      console.log("Image successfully retrieved:", image);
      this.selectedImage = image.dataUrl;
      this.updateImagePreview();
    } catch (error) {
      console.error("Error during Camera.getPhoto operation:", error);
    }
    
    console.log("Camera operation completed.");
  }
  

  // Method to update the image preview
  updateImagePreview() {
    const profileImagePreview: any = document.getElementById(
      'profileImagePreview'
    );
    profileImagePreview.src = this.selectedImage; // Update the preview with the selected image
    console.log('update preview')
  }

  saveProfilePicture() {
    // if (this.selectedImage) {
    //   console.log('Selected image to save:', this.selectedImage);
    //   //upload a profile picture to the database
    //   this.supabase.getClient().storage.from('avatars').upload(`${this.user.id}.png`, this.selectedImage).then((data) => {
    //     console.log(data)
    //   })
    // } else {
    //   alert('Please select an image before saving.');
    // }
  }
}
