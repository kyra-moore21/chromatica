import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../shared/supabase.service';
import { ToastService } from '../../shared/toast/toast.service';
import { CommonService } from '../../shared/common.service';
import { NavController } from '@ionic/angular';
import { Database, User } from '../../models/database.types';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  standalone: true,
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

  constructor(
    private supabase: SupabaseService,
    private toast: ToastService,
    private common: CommonService,
    private navCtrl: NavController
  ) {}

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

  connectSpotify() {
    //redirect to spotify auth
    this.supabase.signInWithSpotify(`${window.location.origin}/tabs/profile`);
  }
}
