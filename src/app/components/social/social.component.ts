import { Component, OnInit } from '@angular/core';
import { User } from '../../models/database.types';
import { SupabaseService } from '../../services/supabase.service';
import { IonIcon, NavController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { personAddSharp } from 'ionicons/icons';

@Component({
  selector: 'app-social',
  templateUrl: './social.component.html',
  styleUrls: ['./social.component.scss'],
  standalone: true,
  imports: [IonIcon],
})
export class SocialComponent implements OnInit {
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
    private navCtrl: NavController
  ) {
    addIcons({ personAddSharp });
  }

  async ngOnInit() {
    const cachedUser = localStorage.getItem('user');
    this.user = cachedUser ? JSON.parse(cachedUser) : null;

    // const test = await this.supabase
    //   .getClient()
    //   .from('generated_songs')
    //   .select(`
    //     id,
    //     track_name,
    //     artist,
    //     song_image_url,
    //     spotify_track_id,
    //     user_id,
    //     users!inner(profile_visibility)
    //   `)
    //   .or(`
    //     user_id.eq.${this.user.id},
    //     and(
    //       friendships.friendship_status.eq.accepted,
    //       friendships.user_id.eq.${this.user.id},
    //       or(users.profile_visibility.eq.public, users.profile_visibility.eq.friends_only)
    //     )
    //   `)
    //   .order('created_at', { ascending: false });
    // console.log(test);
  }

  navigateToFriendsList() {
    this.navCtrl.navigateForward('/friend-list', { animated: false });
  }
}
